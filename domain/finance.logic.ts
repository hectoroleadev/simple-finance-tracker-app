import { FinanceItem, CategoryType, HistoryEntry, FinanceTotals } from '../types';

export const FinanceCalculator = {
  getCategorySum: (items: FinanceItem[], cat: CategoryType): number => {
    return items
      .filter(i => i.category === cat)
      .reduce((sum, item) => sum + item.amount, 0);
  },

  calculateTotals: (items: FinanceItem[]): FinanceTotals => {
    const debt = FinanceCalculator.getCategorySum(items, CategoryType.DEBT);
    const investments = FinanceCalculator.getCategorySum(items, CategoryType.INVESTMENTS);
    const liquid = FinanceCalculator.getCategorySum(items, CategoryType.LIQUID_CASH);
    const pending = FinanceCalculator.getCategorySum(items, CategoryType.PENDING_PAYMENTS);
    const retirement = FinanceCalculator.getCategorySum(items, CategoryType.RETIREMENT);
    
    const savings = investments + liquid + pending;
    const balance = savings - debt;

    return { debt, investments, liquid, pending, retirement, savings, balance };
  },

  createSnapshot: (totals: FinanceTotals, monthName: string): HistoryEntry => {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      year: now.getFullYear(),
      month: monthName,
      savings: totals.savings,
      debt: totals.debt,
      balance: totals.balance,
      retirement: totals.retirement,
    };
  },

  prepareChartData: (history: HistoryEntry[]) => {
    return [...history].reverse().map(h => ({
      name: h.month.substring(0, 3), // Short name
      Balance: h.balance,
      Debt: h.debt,
      Retirement: h.retirement,
    }));
  }
};