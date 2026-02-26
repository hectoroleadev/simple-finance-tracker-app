
export enum CategoryType {
  INVESTMENTS = 'investments',
  LIQUID_CASH = 'liquid_cash',
  PENDING_PAYMENTS = 'pending_payments',
  RETIREMENT = 'retirement',
  DEBT = 'debt'
}

export interface FinanceItem {
  id: string;
  name: string;
  amount: number;
  category: CategoryType;
}

export interface FinanceTotals {
  debt: number;
  investments: number;
  liquid: number;
  pending: number;
  retirement: number;
  savings: number;
  balance: number;
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
  category: CategoryType;
  raw?: any;
}

export type TabType = 'dashboard' | 'history' | 'charts';

export interface FinanceContextType {
  items: FinanceItem[];
  totals: FinanceTotals;
  history: HistoryEntry[];
  chartData: any[];
  loading: boolean;
  error: string | null;
  actions: {
    updateItem: (id: string, name: string, amount: number) => void;
    deleteItem: (id: string) => void;
    addItem: (category: CategoryType) => FinanceItem;
    snapshotHistory: () => boolean;
    deleteHistoryItem: (id: string) => void;
    getItemHistory: (id: string) => Promise<ItemRevision[]>;
  };
  onSnapshot: () => void;
}
