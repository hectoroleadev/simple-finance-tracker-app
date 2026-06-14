import React, { useState, Suspense, lazy } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Camera,
  Clock,
  FolderPlus,
} from 'lucide-react';
import { BalanceEffect } from '../types';
import StatCard from '../components/StatCard';
import CategoryTable from '../components/CategoryTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { useFinanceContext } from '../context/FinanceContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const CategoriesManagerModal = lazy(() => import('../components/CategoriesManagerModal'));

const calcTrend = (current: number, previous: number): number | null => {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const DashboardPage: React.FC = () => {
  const { items, categories, totals, isReadOnly, actions, loading, history } = useFinanceContext();
  const { t, language } = useLanguage();
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  const [showSnapshotConfirm, setShowSnapshotConfirm] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);

  // Last 6 snapshots, oldest first, for the StatCard sparklines
  const sparkOf = (key: 'savings' | 'debt' | 'balance' | 'retirement') =>
    history
      .slice(0, 6)
      .map((h) => h[key])
      .reverse();

  const lastSnapshotDate = history.length > 0 ? new Date(history[0].date) : null;
  const daysSinceSnapshot =
    lastSnapshotDate && !isNaN(lastSnapshotDate.getTime())
      ? Math.max(0, Math.floor((Date.now() - lastSnapshotDate.getTime()) / 86_400_000))
      : null;
  const snapshotAge =
    daysSinceSnapshot === null
      ? null
      : daysSinceSnapshot >= 30
        ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
            -Math.round(daysSinceSnapshot / 30),
            'month'
          )
        : new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
            -daysSinceSnapshot,
            'day'
          );

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
    shortcuts: [
      {
        key: 's',
        description: 'Take snapshot',
        action: () => {
          if (!isReadOnly) setShowSnapshotConfirm(true);
        },
      },
    ],
  });

  const handleSnapshotConfirm = () => {
    actions.snapshotHistory();
    setShowSnapshotConfirm(false);
  };

  // Values frozen by a snapshot, in the same order/colors used by HistoryTable
  const snapshotPreview = [
    { label: t('savings'), value: totals.income, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: t('totalDebt'), value: totals.expenses, color: 'text-rose-600 dark:text-rose-400' },
    { label: t('netBalance'), value: totals.balance, color: 'text-blue-600 dark:text-blue-400' },
    {
      label: t('retirementCapital'),
      value: totals.informative,
      color: 'text-amber-600 dark:text-amber-400',
    },
  ];

  // Helper: derive a TailwindCSS color class from category config
  const colorClass = (effect: BalanceEffect): 'green' | 'red' | 'yellow' => {
    if (effect === BalanceEffect.POSITIVE) return 'green';
    if (effect === BalanceEffect.NEGATIVE) return 'red';
    return 'yellow';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex justify-end items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {snapshotAge !== null && (
            <span
              title={lastSnapshotDate!.toLocaleDateString(locale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                daysSinceSnapshot! >= 30
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              }`}
            >
              <Clock size={12} />
              <span className="hidden sm:inline">{t('lastSnapshot')} </span>
              {snapshotAge}
            </span>
          )}
          {!isReadOnly && (
            <button
              onClick={() => setShowSnapshotConfirm(true)}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-sm text-sm hover:shadow-lg"
            >
              <Camera size={16} />
              {t('snapshot')}
            </button>
          )}
        </div>
      </div>

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

      <ConfirmDialog
        isOpen={showSnapshotConfirm}
        title={t('confirmSnapshot')}
        message={t('confirmSnapshotMessage')}
        confirmText={t('save')}
        cancelText={t('cancel')}
        onConfirm={handleSnapshotConfirm}
        onCancel={() => setShowSnapshotConfirm(false)}
        variant="info"
      >
        <div className="grid grid-cols-2 gap-2">
          {snapshotPreview.map(({ label, value, color }) => (
            <div key={label} className="rounded-lg bg-slate-50 dark:bg-slate-700/30 px-3 py-2">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                {label}
              </span>
              <span className={`text-sm font-bold tabular-nums ${color}`}>
                {formatCurrency(value)}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 text-right capitalize">
          {new Date().toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </ConfirmDialog>

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
