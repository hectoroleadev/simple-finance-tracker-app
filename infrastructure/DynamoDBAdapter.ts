
import { FinanceRepository } from '../domain/ports';
import { FinanceItem, HistoryEntry } from '../types';

export class DynamoDBAdapter implements FinanceRepository {
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
      return data.items || []; // Assuming API returns { items: [...] }
    } catch (error) {
      console.error('DynamoDB/API Error (getItems):', error);
      return [];
    }
  }

  async saveItems(items: FinanceItem[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/items`, {
        method: 'POST', // or PUT
        headers: this.headers,
        body: JSON.stringify({ items }),
      });
      if (!response.ok) throw new Error(`Failed to save items: ${response.statusText}`);
    } catch (error) {
      console.error('DynamoDB/API Error (saveItems):', error);
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
      console.error('DynamoDB/API Error (getHistory):', error);
      return [];
    }
  }

  async saveHistory(history: HistoryEntry[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/history`, {
        method: 'POST', // or PUT
        headers: this.headers,
        body: JSON.stringify({ history }),
      });
      if (!response.ok) throw new Error(`Failed to save history: ${response.statusText}`);
    } catch (error) {
      console.error('DynamoDB/API Error (saveHistory):', error);
      throw error;
    }
  }
}
