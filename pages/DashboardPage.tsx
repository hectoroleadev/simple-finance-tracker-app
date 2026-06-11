import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { BalanceEffect } from '../types';
import StatCard from '../components/StatCard';
import CategoryTable from '../components/CategoryTable';
import { formatCurrency } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { useFinanceContext } from '../context/FinanceContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const calcTrend = (current: number, previous: number): number | null => {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const DashboardPage: React.FC = () => {
  const { items, categories, totals, isReadOnly, actions, loading, history } = useFinanceContext();
  const { t } = useLanguage();

  const lastSnapshot = history.length > 0 ? history[1] : null;
  const trends = lastSnapshot
    ? {
        income: calcTrend(totals.income, lastSnapshot.savings),
        debt: calcTrend(totals.expenses, lastSnapshot.debt),
        balance: calcTrend(totals.balance, lastSnapshot.balance),
        retirement: calcTrend(totals.informative, lastSnapshot.retirement),
      }
    : null;

  const getItemsByCategory = (catId: string) => items.filter((i) => i.category === catId);

  // Page-specific keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [{ key: 's', description: 'Take snapshot', action: actions.snapshotHistory }],
  });

  // Helper: derive a TailwindCSS color class from category config
  const colorClass = (effect: BalanceEffect): 'green' | 'red' | 'yellow' => {
    if (effect === BalanceEffect.POSITIVE) return 'green';
    if (effect === BalanceEffect.NEGATIVE) return 'red';
    return 'yellow';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="skeleton h-9 w-9 rounded-lg" />
                <div className="skeleton h-3 w-24 rounded-md" />
              </div>
              <div className="skeleton h-7 w-32 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label={t('totalIncome')}
            value={totals.income}
            color="green"
            icon={<TrendingUp size={18} />}
            trend={trends?.income}
          />
          <StatCard
            label={t('totalDebt')}
            value={totals.expenses}
            color="red"
            icon={<TrendingDown size={18} />}
            trend={trends?.debt}
            trendInverted
          />
          <StatCard
            label={t('netBalance')}
            value={totals.balance}
            color="blue"
            icon={<Wallet size={18} />}
            trend={trends?.balance}
          />
          <StatCard
            label={t('retirementCapital')}
            value={totals.informative}
            color="yellow"
            icon={<PiggyBank size={18} />}
            trend={trends?.retirement}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-start">
        {loading && categories.length === 0
          ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-[450px] flex flex-col"
              >
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
                  <div className="skeleton h-4 w-28 rounded-md" />
                </div>
                <div className="flex-1 overflow-hidden">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="flex items-center px-5 py-3.5 border-b border-slate-50 dark:border-slate-700/50 gap-3"
                    >
                      <div className="skeleton h-4 flex-1 rounded-md" />
                      <div className="skeleton h-4 w-20 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          : categories.map((cat) => (
              <CategoryTable
                key={cat.id}
                title={cat.name}
                categoryId={cat.id}
                color={colorClass(cat.effect)}
                items={getItemsByCategory(cat.id)}
                onUpdateItem={actions.updateItem}
                onDeleteItem={actions.deleteItem}
                onAddItem={actions.addItem}
                isReadOnly={isReadOnly}
                isLoading={loading}
              />
            ))}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between h-[450px] shadow-sm card-interactive">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('periodClose')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {t('periodCloseDesc')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {t('totalAssets')}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totals.income)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                {t('finalNet')}
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(totals.balance)}
              </span>
            </div>
          </div>

          {!isReadOnly ? (
            <button
              onClick={actions.snapshotHistory}
              className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all active:scale-[0.98] shadow-sm text-sm hover:shadow-lg"
            >
              {t('snapshot')}
            </button>
          ) : (
            <div className="w-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-semibold py-3 rounded-lg text-sm text-center italic cursor-not-allowed">
              {t('sharing.viewAs')} {t('sharing.sharedAccount')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
