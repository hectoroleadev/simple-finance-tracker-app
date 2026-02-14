
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { FinanceCalculator } from './finance.logic';
import { CategoryType, FinanceItem, HistoryEntry } from '../types';

describe('FinanceCalculator Domain Logic', () => {
  // Mock for crypto.randomUUID
  beforeAll(() => {
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => 'test-uuid-123'
      }
    });
  });

  const mockItems: FinanceItem[] = [
    { id: '1', name: 'Debt 1', amount: 100, category: CategoryType.DEBT },
    { id: '2', name: 'Investment 1', amount: 200, category: CategoryType.INVESTMENTS },
    { id: '3', name: 'Liquid 1', amount: 50, category: CategoryType.LIQUID_CASH },
    { id: '4', name: 'Pending 1', amount: 50, category: CategoryType.PENDING_PAYMENTS },
    { id: '5', name: 'Retirement 1', amount: 300, category: CategoryType.RETIREMENT },
  ];

  it('correctly calculates sum per category', () => {
    const sumDebt = FinanceCalculator.getCategorySum(mockItems, CategoryType.DEBT);
    expect(sumDebt).toBe(100);

    const sumInvestments = FinanceCalculator.getCategorySum(mockItems, CategoryType.INVESTMENTS);
    expect(sumInvestments).toBe(200);
  });

  it('correctly calculates totals and balances', () => {
    const totals = FinanceCalculator.calculateTotals(mockItems);

    expect(totals.debt).toBe(100);
    expect(totals.investments).toBe(200);
    expect(totals.liquid).toBe(50);
    expect(totals.pending).toBe(50);
    expect(totals.retirement).toBe(300);
    
    // Savings = Investments + Liquid + Pending (200 + 50 + 50)
    expect(totals.savings).toBe(300);
    
    // Balance = Savings - Debt (300 - 100)
    expect(totals.balance).toBe(200);
  });

  it('creates a history snapshot with correct structure', () => {
    const totals = FinanceCalculator.calculateTotals(mockItems);
    const snapshot = FinanceCalculator.createSnapshot(totals, 'August');

    expect(snapshot).toEqual({
      id: 'test-uuid-123',
      year: new Date().getFullYear(),
      month: 'August',
      savings: 300,
      debt: 100,
      balance: 200,
      retirement: 300,
    });
  });

  it('prepares chart data by reversing order', () => {
    const history: HistoryEntry[] = [
      { id: '1', year: 2024, month: 'January', savings: 10, debt: 5, balance: 5, retirement: 10 },
      { id: '2', year: 2024, month: 'February', savings: 20, debt: 5, balance: 15, retirement: 20 },
    ];

    const chartData = FinanceCalculator.prepareChartData(history);

    // It should reverse order (Feb first for chart display typically, though logic just reverses array)
    // The previous logic was [...history].reverse()
    
    expect(chartData[0].name).toBe('Feb');
    expect(chartData[1].name).toBe('Jan');
    expect(chartData[0].Balance).toBe(15);
  });
});
