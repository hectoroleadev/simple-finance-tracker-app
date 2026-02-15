
import { describe, it, expect } from 'vitest';
import { FinanceCalculator } from './finance.logic';
import { FinanceItem, CategoryType } from '../types';

describe('FinanceCalculator', () => {
  const mockItems: FinanceItem[] = [
    { id: '1', name: 'Cash', amount: 1000, category: CategoryType.LIQUID_CASH },
    { id: '2', name: 'Stocks', amount: 5000, category: CategoryType.INVESTMENTS },
    { id: '3', name: 'Credit Card', amount: 200, category: CategoryType.DEBT },
    { id: '4', name: 'Pending Bonus', amount: 500, category: CategoryType.PENDING_PAYMENTS },
    { id: '5', name: '401k', amount: 10000, category: CategoryType.RETIREMENT },
  ];

  it('should sum amounts for a specific category', () => {
    const liquidSum = FinanceCalculator.getCategorySum(mockItems, CategoryType.LIQUID_CASH);
    expect(liquidSum).toBe(1000);
  });

  it('should calculate totals correctly', () => {
    const totals = FinanceCalculator.calculateTotals(mockItems);

    expect(totals.liquid).toBe(1000);
    expect(totals.investments).toBe(5000);
    expect(totals.pending).toBe(500);
    expect(totals.debt).toBe(200);
    expect(totals.retirement).toBe(10000);

    // savings = investments + liquid + pending = 5000 + 1000 + 500 = 6500
    expect(totals.savings).toBe(6500);

    // balance = savings - debt = 6500 - 200 = 6300
    expect(totals.balance).toBe(6300);
  });

  it('should create a valid snapshot from totals', () => {
    const totals = FinanceCalculator.calculateTotals(mockItems);
    const snapshot = FinanceCalculator.createSnapshot(totals);

    expect(snapshot.id).toBeDefined();
    expect(snapshot.date).toBeDefined();
    expect(snapshot.savings).toBe(6500);
    expect(snapshot.debt).toBe(200);
    expect(snapshot.balance).toBe(6300);
    expect(snapshot.retirement).toBe(10000);
  });

  it('should handle empty items array gracefully', () => {
    const totals = FinanceCalculator.calculateTotals([]);
    expect(totals.balance).toBe(0);
    expect(totals.savings).toBe(0);
    expect(totals.debt).toBe(0);
  });

  it('should handle negative amounts correctly', () => {
    const itemsWithNegative: FinanceItem[] = [
      { id: '1', name: 'Cash', amount: -500, category: CategoryType.LIQUID_CASH },
      { id: '2', name: 'Debt', amount: 1000, category: CategoryType.DEBT },
    ];
    const totals = FinanceCalculator.calculateTotals(itemsWithNegative);

    // savings = -500
    expect(totals.savings).toBe(-500);
    // debt = 1000
    expect(totals.debt).toBe(1000);
    // balance = -500 - 1000 = -1500
    expect(totals.balance).toBe(-1500);
  });

  it('should prepare chart data and reverse history order', () => {
    const history = [
      { id: 'h1', date: '2024-01-01T00:00:00Z', savings: 100, debt: 10, balance: 90, retirement: 1000 },
      { id: 'h2', date: '2024-02-01T00:00:00Z', savings: 200, debt: 20, balance: 180, retirement: 2000 },
    ];

    const chartData = FinanceCalculator.prepareChartData(history);

    expect(chartData).toHaveLength(2);
    // Original prepares chart data as: [...history].reverse()
    // [h1, h2] -> [h2, h1]
    expect(chartData[1].Balance).toBe(90);  // h1
    expect(chartData[0].Balance).toBe(180); // h2 (newest)
    expect(chartData[0].date).toBe('2024-02-01T00:00:00Z');
  });

  it('should handle invalid dates in prepareChartData', () => {
    const history = [
      { id: 'h1', date: 'invalid-date', savings: 100, debt: 10, balance: 90, retirement: 1000 },
    ];
    const chartData = FinanceCalculator.prepareChartData(history);
    expect(chartData[0].name).toBe('---');
    expect(chartData[0].Balance).toBe(90);
  });

  it('should handle empty history in prepareChartData', () => {
    const chartData = FinanceCalculator.prepareChartData([]);
    expect(chartData).toEqual([]);
  });
});
