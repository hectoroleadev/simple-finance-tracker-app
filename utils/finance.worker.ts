
import { FinanceItem, CategoryType, HistoryEntry, FinanceTotals } from '../types';

// Logic from finance.logic.ts moved to worker for background processing
const calculateTotals = (items: FinanceItem[]): FinanceTotals => {
    const getCategorySum = (items: FinanceItem[], cat: CategoryType) => {
        return items
            .filter(i => i.category === cat)
            .reduce((sum, item) => sum + item.amount, 0);
    };

    const debt = getCategorySum(items, CategoryType.DEBT);
    const investments = getCategorySum(items, CategoryType.INVESTMENTS);
    const liquid = getCategorySum(items, CategoryType.LIQUID_CASH);
    const pending = getCategorySum(items, CategoryType.PENDING_PAYMENTS);
    const retirement = getCategorySum(items, CategoryType.RETIREMENT);

    const savings = investments + liquid + pending;
    const balance = savings - debt;

    return { debt, investments, liquid, pending, retirement, savings, balance };
};

const prepareChartData = (history: HistoryEntry[]) => {
    return [...history].reverse().map(h => {
        const date = new Date(h.date);
        const monthShort = isNaN(date.getTime()) ? '---' : date.toLocaleString('default', { month: 'short' });
        return {
            name: monthShort,
            Balance: h.balance,
            Debt: h.debt,
            Retirement: h.retirement,
        };
    });
};

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === 'CALCULATE_TOTALS') {
        const totals = calculateTotals(payload);
        self.postMessage({ type: 'TOTALS_CALCULATED', payload: totals });
    } else if (type === 'PREPARE_CHART_DATA') {
        const chartData = prepareChartData(payload);
        self.postMessage({ type: 'CHART_DATA_PREPARED', payload: chartData });
    }
};
