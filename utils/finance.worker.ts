
import { FinanceItem, Category, HistoryEntry } from '../types';
import { FinanceCalculator } from '../domain/finance.logic';

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === 'CALCULATE_TOTALS') {
        const { items, categories }: { items: FinanceItem[]; categories: Category[] } = payload;
        const totals = FinanceCalculator.calculateTotals(items, categories);
        self.postMessage({ type: 'TOTALS_CALCULATED', payload: totals });
    } else if (type === 'PREPARE_CHART_DATA') {
        const history: HistoryEntry[] = payload;
        const chartData = FinanceCalculator.prepareChartData(history);
        self.postMessage({ type: 'CHART_DATA_PREPARED', payload: chartData });
    }
};
