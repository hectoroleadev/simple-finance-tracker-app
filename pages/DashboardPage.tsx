import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { BalanceEffect } from '../types';
import StatCard from '../components/StatCard';
import CategoryTable from '../components/CategoryTable';
import { formatCurrency } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { useFinanceContext } from '../hooks/useFinanceData';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const DashboardPage: React.FC = () => {
  const { items, categories, totals, actions, onSnapshot } = useFinanceContext();
  const { t } = useLanguage();

  const getItemsByCategory = (catId: string) => items.filter(i => i.category === catId);

  // Page-specific keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      { key: 's', description: 'Take snapshot', action: onSnapshot },
    ],
  });

  // Helper: derive a TailwindCSS color class from category config
  const colorClass = (effect: BalanceEffect): 'green' | 'red' | 'yellow' => {
    if (effect === BalanceEffect.POSITIVE) return 'green';
    if (effect === BalanceEffect.NEGATIVE) return 'red';
    return 'yellow';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label={t('totalIncome')} value={totals.income} color="green" icon={<TrendingUp size={18} />} />
        <StatCard label={t('totalDebt')} value={totals.expenses} color="red" icon={<TrendingDown size={18} />} />
        <StatCard label={t('netBalance')} value={totals.balance} color="blue" icon={<Wallet size={18} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-start">
        {categories.map(cat => (
          <CategoryTable
            key={cat.id}
            title={cat.name}
            categoryId={cat.id}
            color={colorClass(cat.effect)}
            items={getItemsByCategory(cat.id)}
            onUpdateItem={actions.updateItem}
            onDeleteItem={actions.deleteItem}
            onAddItem={actions.addItem}
          />
        ))}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between h-[450px] shadow-sm transition-colors hover-lift">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('periodClose')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('periodCloseDesc')}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('totalAssets')}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.income)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('finalNet')}</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(totals.balance)}</span>
            </div>
          </div>

          <button
            onClick={onSnapshot}
            className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all active:scale-[0.98] shadow-sm text-sm hover:shadow-lg"
          >
            {t('snapshot')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;