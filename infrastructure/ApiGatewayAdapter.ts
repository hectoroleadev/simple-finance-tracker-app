
import { FinanceRepository } from '../domain/ports';
import { FinanceItem, HistoryEntry } from '../types';

export class ApiGatewayAdapter implements FinanceRepository {
  private apiUrl: string;
  private apiKey?: string;

  constructor(apiUrl: string, apiKey?: string) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private get headers(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }
    return headers;
  }

  async getItems(): Promise<FinanceItem[]> {
    try {
      const response = await fetch(`${this.apiUrl}/items`, {
        method: 'GET',
        headers: this.headers,
      });
      if (!response.ok) throw new Error(`Failed to fetch items: ${response.statusText}`);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('API Gateway Error (getItems):', error);
      return [];
    }
  }

  async saveItems(items: FinanceItem[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/items`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ items }),
      });
      if (!response.ok) throw new Error(`Failed to save items: ${response.statusText}`);
    } catch (error) {
      console.error('API Gateway Error (saveItems):', error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      // Try DELETE with body first, as this is common for single-resource Lambdas
      // If the backend expects /items/{id}, this might need adjustment based on specific backend logic
      const response = await fetch(`${this.apiUrl}/items`, {
        method: 'DELETE',
        headers: this.headers,
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        // Fallback or retry logic could go here, but for now just log
        console.warn(`Initial delete attempt failed: ${response.statusText}.`);
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
      if (!response.ok) throw new Error(`Failed to fetch history: ${response.statusText}`);
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('API Gateway Error (getHistory):', error);
      return [];
    }
  }

  async saveHistory(history: HistoryEntry[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/history`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ history }),
      });
      if (!response.ok) throw new Error(`Failed to save history: ${response.statusText}`);
    } catch (error) {
      console.error('API Gateway Error (saveHistory):', error);
      throw error;
    }
  }
}
