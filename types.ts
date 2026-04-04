import { BalanceEffect } from './domain/balanceEffect.ts';
export { BalanceEffect };

export interface Category {
  id: string;
  name: string;
  effect: BalanceEffect;
  color?: string;
  order?: number;
  userId?: string;
}

// Default categories (used as seeds for existing data compatibility)
// Moved to domain/defaults.ts
export { DEFAULT_CATEGORIES } from './domain/defaults';

export interface FinanceItem {
  id: string;
  name: string;
  amount: number;
  category: string; // references Category.id
  userId?: string;
}

export interface FinanceTotals {
  income: number;      // Sum of POSITIVE categories
  expenses: number;    // Sum of NEGATIVE categories
  balance: number;     // income - expenses
  informative: number; // Sum of INFORMATIVE categories
}

export interface ChartDataPoint {
  name: string;        // Short month label (e.g. "Jan")
  date: string;        // ISO date string
  Balance: number;
  Debt: number;
  Retirement: number;
}

export interface HistoryEntry {
  id: string;
  date: string; // ISO Date string
  savings: number;
  debt: number;
  balance: number;
  retirement: number;
  userId?: string;
}

export interface ItemRevision {
  itemId: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete';
  name: string;
  amount: number;
  category: string;
  raw?: Record<string, unknown>;
}

export interface ShareInvite {
  ownerId: string;
  sharedWithId: string;
  permissions: 'READ';
  status: 'ACTIVE';
  createdAt: string;
}

export type TabType = 'dashboard' | 'history' | 'charts';

export interface FinanceContextType {
  items: FinanceItem[];
  categories: Category[];
  totals: FinanceTotals;
  history: HistoryEntry[];
  chartData: any[];
  loading: boolean;
  error: string | null;
  viewAs: string | null;
  isReadOnly: boolean;
  shares: ShareInvite[];
  sharedWithMe: ShareInvite[];
  actions: {
    updateItem: (id: string, name: string, amount: number) => void;
    deleteItem: (id: string) => void;
    addItem: (categoryId: string) => FinanceItem;
    snapshotHistory: () => boolean;
    deleteHistoryItem: (id: string) => void;
    getItemHistory: (id: string) => Promise<ItemRevision[]>;
    addCategory: (category: Category) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    reorderCategories: (categories: Category[]) => Promise<void>;
    setViewAs: (userId: string | null) => void;
    inviteUser: (sharedWithId: string) => Promise<void>;
    revokeShare: (sharedWithId: string) => Promise<void>;
  };
}
