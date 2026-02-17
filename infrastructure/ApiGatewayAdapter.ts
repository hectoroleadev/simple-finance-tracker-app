
import { FinanceRepository } from '../domain/ports';
import { FinanceItem, HistoryEntry } from '../types';

export class ApiGatewayAdapter implements FinanceRepository {
  private apiUrl: string;
  private getToken: () => string | null;

  constructor(apiUrl: string, getToken: () => string | null) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.getToken = getToken;
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

  async getItems(): Promise<FinanceItem[]> {
    try {
      const response = await fetch(`${this.apiUrl}/items`, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (!response.ok) {
        await this.handleResponseError(response, 'fetch items');
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('API Gateway Error (getItems):', error);
      throw error;
    }
  }

  async saveItems(items: FinanceItem[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/items`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) {
        await this.handleResponseError(response, 'save items');
      }
    } catch (error) {
      console.error('API Gateway Error (saveItems):', error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/items/${id}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      if (!response.ok) {
        await this.handleResponseError(response, 'delete item');
      }
    } catch (error) {
      console.error('API Gateway Error (deleteItem):', error);
      throw error;
    }
  }

  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const response = await fetch(`${this.apiUrl}/history`, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (!response.ok) {
        await this.handleResponseError(response, 'fetch history');
      }
      
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('API Gateway Error (getHistory):', error);
      throw error;
    }
  }

  async saveHistory(history: HistoryEntry[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/history`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ history }),
      });
      
      if (!response.ok) {
        await this.handleResponseError(response, 'save history');
      }
    } catch (error) {
      console.error('API Gateway Error (saveHistory):', error);
      throw error;
    }
  }

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/history/${id}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      if (!response.ok) {
        await this.handleResponseError(response, 'delete history item');
      }
    } catch (error) {
      console.error('API Gateway Error (deleteHistoryItem):', error);
      throw error;
    }
  }
}
