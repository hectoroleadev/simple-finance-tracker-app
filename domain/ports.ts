
import { FinanceItem, HistoryEntry, ItemRevision, Category } from '../types';

export interface FinanceRepository {
  getItems(): Promise<FinanceItem[]>;
  saveItems(items: FinanceItem[]): Promise<void>;
  deleteItem(id: string): Promise<void>;
  getItemHistory(id: string): Promise<ItemRevision[]>;
  getHistory(): Promise<HistoryEntry[]>;
  saveHistory(history: HistoryEntry[]): Promise<void>;
  deleteHistoryItem(id: string): Promise<void>;
  getCategories(): Promise<Category[]>;
  saveCategories(categories: Category[]): Promise<void>;
}

