import React, { useState, Suspense, lazy } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, FolderPlus } from 'lucide-react';
import { BalanceEffect } from '../types';
import StatCard from '../components/StatCard';
import CategoryTable from '../components/CategoryTable';
import EmptyState from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { useFinanceContext } from '../context/FinanceContext';

const CategoriesManagerModal = lazy(() => import('../components/CategoriesManagerModal'));

const calcTrend = (current: number, previous: number): number | null => {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const DashboardPage: React.FC = () => {
  const { items, categories, totals, isReadOnly, actions, loading, history } = useFinanceContext();
  const { t } = useLanguage();
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);

  // Last 6 snapshots, oldest first, for the StatCard sparklines
  const sparkOf = (key: 'savings' | 'debt' | 'balance' | 'retirement') =>
    history
      .slice(0, 6)
      .map((h) => h[key])
      .reverse();

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
            sparkline={sparkOf('savings')}
          />
          <StatCard
            label={t('totalDebt')}
            value={totals.expenses}
            color="red"
            icon={<TrendingDown size={18} />}
            trend={trends?.debt}
            trendInverted
            sparkline={sparkOf('debt')}
          />
          <StatCard
            label={t('netBalance')}
            value={totals.balance}
            color="blue"
            icon={<Wallet size={18} />}
            trend={trends?.balance}
            sparkline={sparkOf('balance')}
          />
          <StatCard
            label={t('retirementCapital')}
            value={totals.informative}
            color="yellow"
            icon={<PiggyBank size={18} />}
            trend={trends?.retirement}
            sparkline={sparkOf('retirement')}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-start">
        {loading && categories.length === 0 ? (
          [...Array(3)].map((_, i) => (
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
        ) : categories.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-[320px]">
            <EmptyState
              icon={<FolderPlus size={28} />}
              title={t('emptyCategories')}
              subtitle={t('emptyCategoriesHint')}
              action={
                !isReadOnly ? (
                  <button
                    onClick={() => setShowCategoriesManager(true)}
                    className="inline-flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-sm text-sm hover:shadow-lg"
                  >
                    {t('categoriesManager.title')}
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          categories.map((cat) => (
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
          ))
        )}
      </div>

      {showCategoriesManager && (
        <Suspense fallback={null}>
          <CategoriesManagerModal
            isOpen={showCategoriesManager}
            onClose={() => setShowCategoriesManager(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default DashboardPage;
