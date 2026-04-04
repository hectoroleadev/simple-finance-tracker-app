import { HistoryEntry, ChartDataPoint } from '../types';

/**
 * Chart utilities — presentation-layer data transformations.
 *
 * Moved out of domain/finance.logic.ts because chart formatting is a UI concern,
 * not a business rule. The domain should not know what a chart axis label looks like.
 */
export const prepareChartData = (history: HistoryEntry[]): ChartDataPoint[] => {
  return [...history].reverse().map(h => {
    const date = new Date(h.date);
    const monthShort = isNaN(date.getTime())
      ? '---'
      : date.toLocaleString('default', { month: 'short' });
    return {
      name: monthShort,
      date: h.date,
      Balance: h.balance,
      Debt: h.debt,
      Retirement: h.retirement,
    };
  });
};
