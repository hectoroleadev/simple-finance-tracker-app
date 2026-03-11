
import { FinanceRepository } from '../domain/ports';
import { FinanceItem, HistoryEntry, ItemRevision, Category, DEFAULT_CATEGORIES, ShareInvite } from '../types';

export class ApiGatewayAdapter implements FinanceRepository {
  private apiUrl: string;
  private getToken: () => string | null;
  private refreshAuthTokens: () => Promise<boolean>;
  private logout: () => void;

  constructor(
    apiUrl: string,
    getToken: () => string | null,
    refreshAuthTokens: () => Promise<boolean>,
    logout: () => void
  ) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.getToken = getToken;
    this.refreshAuthTokens = refreshAuthTokens;
    this.logout = logout;
  }

  private get headers(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async _makeRequest(
    url: string,
    options: RequestInit,
    action: string,
    retry: boolean = true
  ): Promise<Response> {
    let response: Response;

    try {
      response = await fetch(url, options);
    } catch (error) {
      console.error(`_makeRequest: Network error during initial fetch to ${url}:`, error);
      // If a network error occurs, we cannot proceed with token refresh logic
      // Re-throw the error so it can be caught by the calling function (e.g., getItems)
      throw error;
    }

    if (response.status === 401 && retry) {
      const refreshSuccessful = await this.refreshAuthTokens();

      if (refreshSuccessful) {
        const newToken = this.getToken();
        if (!newToken) {
          console.error('_makeRequest: New token is null after refresh. Logging out.');
          this.logout();
          await this.handleResponseError(response, action);
        }

        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        };

        try {
          response = await fetch(url, newOptions);
        } catch (retryError) {
          console.error(`_makeRequest: Network error during retried fetch to ${url}:`, retryError);
          throw retryError;
        }

      } else {
        console.error('Token refresh failed. Logging out...');
        this.logout();
        await this.handleResponseError(response, action);
      }
    }

    if (!response.ok) {
      console.error(`_makeRequest: Request to ${url} failed with status ${response.status}`);
      await this.handleResponseError(response, action);
    }
    return response;
  }

  private async handleResponseError(response: Response, action: string): Promise<never> {
    let errorMessage = `Failed to ${action}`;

    try {
      const data = await response.json();

      // Check for various common error field names
      const message = data.message || data.error || data.errorMessage;
      const code = data.code || data.errorCode || data.statusCode;
      const details = data.details || data.context || data.cause;

      // Prioritize the server's message, fallback to status text
      if (message) {
        errorMessage = message;
      } else {
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }

      // Append error code if available
      if (code) {
        errorMessage += ` (Code: ${code})`;
      }

      // Append details if available
      if (details) {
        const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details);
        errorMessage += ` | Details: ${detailsStr}`;
      }
    } catch (e) {
      // Fallback if JSON parsing fails
      errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }

  async getItems(userId?: string): Promise<FinanceItem[]> {
    try {
      const url = userId ? `${this.apiUrl}/items?viewAs=${userId}` : `${this.apiUrl}/items`;
      const response = await this._makeRequest(
        url,
        { method: 'GET', headers: this.headers },
        'fetch items'
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('API Gateway Error (getItems):', error);
      throw error;
    }
  }

  async saveItems(items: FinanceItem[]): Promise<void> {
    try {
      await this._makeRequest(
        `${this.apiUrl}/items`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ items }),
        },
        'save items'
      );
    } catch (error) {
      console.error('API Gateway Error (saveItems):', error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      await this._makeRequest(
        `${this.apiUrl}/items/${id}`,
        {
          method: 'DELETE',
          headers: this.headers,
        },
        'delete item'
      );
    } catch (error) {
      console.error('API Gateway Error (deleteItem):', error);
      throw error;
    }
  }

  async getItemHistory(id: string): Promise<ItemRevision[]> {
    try {
      // NOTE: For now history is fetched directly by itemId, 
      // the backend checkAccess logic handles permission.
      const response = await this._makeRequest(
        `${this.apiUrl}/items/${id}/history`,
        { method: 'GET', headers: this.headers },
        'fetch item history'
      );
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('API Gateway Error (getItemHistory):', error);
      throw error;
    }
  }

  async getHistory(userId?: string): Promise<HistoryEntry[]> {
    try {
      const url = userId ? `${this.apiUrl}/history?viewAs=${userId}` : `${this.apiUrl}/history`;
      const response = await this._makeRequest(
        url,
        { method: 'GET', headers: this.headers },
        'fetch history'
      );
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('API Gateway Error (getHistory):', error);
      throw error;
    }
  }

  async saveHistory(history: HistoryEntry[]): Promise<void> {
    try {
      await this._makeRequest(
        `${this.apiUrl}/history`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ history }),
        },
        'save history'
      );
    } catch (error) {
      console.error('API Gateway Error (saveHistory):', error);
      throw error;
    }
  }

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      await this._makeRequest(
        `${this.apiUrl}/history/${id}`,
        {
          method: 'DELETE',
          headers: this.headers,
        },
        'delete history item'
      );
    } catch (error) {
      console.error('API Gateway Error (deleteHistoryItem):', error);
      throw error;
    }
  }

  async getCategories(userId?: string): Promise<Category[]> {
    try {
      const url = userId ? `${this.apiUrl}/categories?viewAs=${userId}` : `${this.apiUrl}/categories`;
      const response = await this._makeRequest(
        url,
        { method: 'GET', headers: this.headers },
        'fetch categories'
      );
      const data = await response.json();
      const cats: Category[] = data.categories || [];
      // If the table is empty on first use, seed defaults so the UI has something to show
      return cats.length > 0 ? cats : DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('API Gateway Error (getCategories):', error);
      throw error;
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      await this._makeRequest(
        `${this.apiUrl}/categories`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ categories }),
        },
        'save categories'
      );
    } catch (error) {
      console.error('API Gateway Error (saveCategories):', error);
      throw error;
    }
  }

  // --- Sharing Management ---

  async getMyShares(): Promise<ShareInvite[]> {
    try {
      const response = await this._makeRequest(
        `${this.apiUrl}/shares`,
        { method: 'GET', headers: this.headers },
        'fetch my shares'
      );
      const data = await response.json();
      return data.shares || [];
    } catch (error) {
      console.error('API Gateway Error (getMyShares):', error);
      throw error;
    }
  }

  async createShare(sharedWithId: string): Promise<void> {
    try {
      await this._makeRequest(
        `${this.apiUrl}/shares`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ sharedWithId }),
        },
        'create share'
      );
    } catch (error) {
      console.error('API Gateway Error (createShare):', error);
      throw error;
    }
  }

  async deleteShare(sharedWithId: string): Promise<void> {
    try {
      await this._makeRequest(
        `${this.apiUrl}/shares/${sharedWithId}`,
        { method: 'DELETE', headers: this.headers },
        'delete share'
      );
    } catch (error) {
      console.error('API Gateway Error (deleteShare):', error);
      throw error;
    }
  }

  async getSharedWithMe(): Promise<ShareInvite[]> {
    try {
      const response = await this._makeRequest(
        `${this.apiUrl}/shared-with-me`,
        { method: 'GET', headers: this.headers },
        'fetch shared with me'
      );
      const data = await response.json();
      return data.sharedWithMe || [];
    } catch (error) {
      console.error('API Gateway Error (getSharedWithMe):', error);
      throw error;
    }
  }
}

