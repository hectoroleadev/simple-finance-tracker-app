import { FinanceItem, HistoryEntry, ItemRevision, Category, ShareInvite } from '../types';

export interface FinanceRepository {
  getItems(userId?: string): Promise<FinanceItem[]>;
  saveItems(items: FinanceItem[]): Promise<void>;
  deleteItem(id: string): Promise<void>;
  getItemHistory(id: string): Promise<ItemRevision[]>;
  getHistory(userId?: string): Promise<HistoryEntry[]>;
  saveHistory(history: HistoryEntry[]): Promise<void>;
  deleteHistoryItem(id: string): Promise<void>;
  getCategories(userId?: string): Promise<Category[]>;
  saveCategories(categories: Category[]): Promise<void>;

  // Sharing
  getMyShares(): Promise<ShareInvite[]>;
  createShare(sharedWithId: string): Promise<void>;
  deleteShare(sharedWithId: string): Promise<void>;
  getSharedWithMe(): Promise<ShareInvite[]>;
}

