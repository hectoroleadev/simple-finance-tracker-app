
import { FinanceItem, HistoryEntry } from '../types';

export interface FinanceRepository {
  getItems(): Promise<FinanceItem[]>;
  saveItems(items: FinanceItem[]): Promise<void>;
  deleteItem(id: string): Promise<void>;
  getHistory(): Promise<HistoryEntry[]>;
  saveHistory(history: HistoryEntry[]): Promise<void>;
  deleteHistoryItem(id: string): Promise<void>;
}
