
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
  year: number;
  month: string;
  savings: number;
  debt: number;
  balance: number;
  retirement: number;
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
    addItem: (category: CategoryType) => void;
    snapshotHistory: () => boolean;
    clearHistory: () => void;
  };
  onSnapshot: () => void;
}
