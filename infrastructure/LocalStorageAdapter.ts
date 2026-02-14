
import { FinanceRepository } from '../domain/ports';
import { FinanceItem, HistoryEntry } from '../types';
import { INITIAL_ITEMS, INITIAL_HISTORY } from '../constants';

const KEYS = {
  ITEMS: 'finance_items_v3',
  HISTORY: 'finance_history_v3'
};

export class LocalStorageAdapter implements FinanceRepository {
  async getItems(): Promise<FinanceItem[]> {
    try {
      const saved = localStorage.getItem(KEYS.ITEMS);
      // Simulate network delay for realism if needed, but keeping it fast for local
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch (error) {
      console.error('Error loading items from local storage', error);
      return INITIAL_ITEMS;
    }
  }

  async saveItems(items: FinanceItem[]): Promise<void> {
    try {
      localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving items to local storage', error);
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      const items = await this.getItems();
      const newItems = items.filter(item => item.id !== id);
      await this.saveItems(newItems);
    } catch (error) {
      console.error('Error deleting item from local storage', error);
    }
  }

  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const saved = localStorage.getItem(KEYS.HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch (error) {
      console.error('Error loading history from local storage', error);
      return INITIAL_HISTORY;
    }
  }

  async saveHistory(history: HistoryEntry[]): Promise<void> {
    try {
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history to local storage', error);
    }
  }

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const newHistory = history.filter(h => h.id !== id);
      await this.saveHistory(newHistory);
    } catch (error) {
      console.error('Error deleting history item from local storage', error);
    }
  }
}
