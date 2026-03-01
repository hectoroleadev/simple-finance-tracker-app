
import { FinanceItem, Category, BalanceEffect, HistoryEntry, FinanceTotals } from '../types';

export const FinanceCalculator = {
  calculateTotals: (items: FinanceItem[], categories: Category[]): FinanceTotals => {
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    let income = 0;
    let expenses = 0;
    let informative = 0;

    for (const item of items) {
      const cat = categoryMap.get(item.category);
      if (!cat) continue;
      if (cat.effect === BalanceEffect.POSITIVE) {
        income += item.amount;
      } else if (cat.effect === BalanceEffect.NEGATIVE) {
        expenses += item.amount;
      } else if (cat.effect === BalanceEffect.INFORMATIVE) {
        informative += item.amount;
      }
    }

    const balance = income - expenses;
    return { income, expenses, balance, informative };
  },

  getCategorySum: (items: FinanceItem[], categoryId: string): number => {
    return items
      .filter(item => item.category === categoryId)
      .reduce((sum, item) => sum + item.amount, 0);
  },

  createSnapshot: (totals: FinanceTotals): HistoryEntry => {
    return {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      savings: totals.income,
      debt: totals.expenses,
      balance: totals.balance,
      retirement: totals.informative,
    };
  },

  prepareChartData: (history: HistoryEntry[]) => {
    return [...history].reverse().map(h => {
      const date = new Date(h.date);
      // Fallback for invalid dates
      const monthShort = isNaN(date.getTime()) ? '---' : date.toLocaleString('default', { month: 'short' });
      return {
        name: monthShort,
        date: h.date,
        Balance: h.balance,
        Debt: h.debt,
        Retirement: h.retirement,
      };
    });
  }
};
