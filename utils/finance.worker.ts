
import { FinanceItem, Category, BalanceEffect, HistoryEntry, FinanceTotals } from '../types';

// Inline dynamic totals calculation for the worker context
const calculateTotals = (items: FinanceItem[], categories: Category[]): FinanceTotals => {
    const categoryMap = new Map(categories.map((c: Category) => [c.id, c]));

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

    return { income, expenses, balance: income - expenses, informative };
};

const prepareChartData = (history: HistoryEntry[]) => {
    return [...history].reverse().map(h => {
        const date = new Date(h.date);
        const monthShort = isNaN(date.getTime()) ? '---' : date.toLocaleString('default', { month: 'short' });
        return {
            name: monthShort,
            date: h.date,
            Balance: h.balance,
            Debt: h.debt,
            Retirement: h.retirement,
        };
    });
};

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === 'CALCULATE_TOTALS') {
        const { items, categories } = payload;
        const totals = calculateTotals(items, categories);
        self.postMessage({ type: 'TOTALS_CALCULATED', payload: totals });
    } else if (type === 'PREPARE_CHART_DATA') {
        const chartData = prepareChartData(payload);
        self.postMessage({ type: 'CHART_DATA_PREPARED', payload: chartData });
    }
};
