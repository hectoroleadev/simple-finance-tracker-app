
import { FinanceRepository } from '../domain/ports';
import { FinanceItem, HistoryEntry, ItemRevision, Category, DEFAULT_CATEGORIES } from '../types';
import { INITIAL_ITEMS, INITIAL_HISTORY } from '../constants';

const KEYS = {
  ITEMS: 'finance_items_v3',
  HISTORY: 'finance_history_v3',
  CATEGORIES: 'finance_categories_v1',
};

export class LocalStorageAdapter implements FinanceRepository {
  async getItems(): Promise<FinanceItem[]> {
    try {
      const saved = localStorage.getItem(KEYS.ITEMS);
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

  async getItemHistory(_id: string): Promise<ItemRevision[]> {
    return []; // Local storage doesn't track per-item history
  }

  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const saved = localStorage.getItem(KEYS.HISTORY);
      if (!saved) return INITIAL_HISTORY;

      const parsed = JSON.parse(saved);

      return parsed.map((item: any) => {
        if (!item.date && item.year && item.month) {
          const monthIndex = new Date(`${item.month} 1, 2000`).getMonth();
          const month = isNaN(monthIndex) ? 0 : monthIndex;
          const date = new Date(item.year, month, 1);
          return { ...item, date: date.toISOString(), year: undefined, month: undefined };
        }
        return item;
      });
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

  async getCategories(): Promise<Category[]> {
    try {
      const saved = localStorage.getItem(KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('Error loading categories from local storage', error);
      return DEFAULT_CATEGORIES;
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to local storage', error);
    }
  }
}
