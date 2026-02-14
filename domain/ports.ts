
import { FinanceItem, HistoryEntry } from '../types';

export interface FinanceRepository {
  getItems(): Promise<FinanceItem[]>;
  saveItems(items: FinanceItem[]): Promise<void>;
  getHistory(): Promise<HistoryEntry[]>;
  saveHistory(history: HistoryEntry[]): Promise<void>;
}
