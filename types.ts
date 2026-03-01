
export enum BalanceEffect {
  POSITIVE = 'POSITIVE',     // Increases balance (income/assets)
  NEGATIVE = 'NEGATIVE',     // Decreases balance (debts/expenses)
  INFORMATIVE = 'INFORMATIVE' // Doesn't affect balance (e.g. retirement/pension)
}

export interface Category {
  id: string;
  name: string;
  effect: BalanceEffect;
  color?: string;
}

// Default categories (used as seeds for existing data compatibility)
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'investments', name: 'Investments', effect: BalanceEffect.POSITIVE, color: 'green' },
  { id: 'liquid_cash', name: 'Liquid Cash', effect: BalanceEffect.POSITIVE, color: 'blue' },
  { id: 'pending_payments', name: 'Pending Payments', effect: BalanceEffect.POSITIVE, color: 'yellow' },
  { id: 'debt', name: 'Debt', effect: BalanceEffect.NEGATIVE, color: 'red' },
  { id: 'retirement', name: 'Retirement', effect: BalanceEffect.INFORMATIVE, color: 'purple' },
];

export interface FinanceItem {
  id: string;
  name: string;
  amount: number;
  category: string; // references Category.id
}

export interface FinanceTotals {
  income: number;      // Sum of POSITIVE categories
  expenses: number;    // Sum of NEGATIVE categories
  balance: number;     // income - expenses
  informative: number; // Sum of INFORMATIVE categories
}

export interface HistoryEntry {
  id: string;
  date: string; // ISO Date string
  savings: number;
  debt: number;
  balance: number;
  retirement: number;
}

export interface ItemRevision {
  itemId: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete';
  name: string;
  amount: number;
  category: string;
  raw?: any;
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
  };
  onSnapshot: () => void;
}
