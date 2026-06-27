import React, { useState, useEffect, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { HistoryEntry } from '../types';
import { formatCurrencyNoDecimals } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { useDensity } from '../hooks/useDensity';
import { Trash2, CalendarDays } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';

interface HistoryTableProps {
  history: HistoryEntry[];
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
}

type ColKey = 'savings' | 'debt' | 'balance' | 'retirement';
interface ColStat {
  min: number;
  max: number;
  range: number;
}

const colBarColors: Record<ColKey, string> = {
  savings: '#10b981',
  debt: '#f43f5e',
  balance: '#3b82f6',
  retirement: '#f59e0b',
};

const colTextColors: Record<ColKey, string> = {
  savings: 'text-positive-700 dark:text-positive-400',
  debt: 'text-rose-700 dark:text-rose-400',
  balance: 'text-blue-700 dark:text-blue-400',
  retirement: 'text-amber-700 dark:text-amber-400',
};

const HistoryRow = React.memo(
  ({
    entry,
    prevEntry,
    isLatest,
    onDelete,
    t,
    language,
    colStats,
    formatYear,
    formatDate,
    dataKeys,
    style,
    isReadOnly,
  }: {
    entry: HistoryEntry;
    prevEntry?: HistoryEntry;
    isLatest?: boolean;
    onDelete: (id: string, e?: React.MouseEvent) => void;
    t: (key: string) => string;
    language: string;
    colStats: Record<ColKey, ColStat>;
    formatYear: (isoDate: string) => string | number;
    formatDate: (isoDate: string) => string;
    dataKeys: ColKey[];
    style: React.CSSProperties;
    isReadOnly?: boolean;
  }) => {
    const { min: bMin, range: bRange } = colStats.balance;
    const bPct = (entry.balance - bMin) / bRange;
    const rowBg =
      bPct > 0.6
        ? 'bg-positive-50/40 dark:bg-positive-900/15'
        : bPct < 0.3
          ? 'bg-rose-50/30 dark:bg-rose-900/10'
          : '';

    return (
      <div
        style={style}
        className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors group relative ${rowBg}`}
      >
        <div className="flex flex-col md:flex-row p-4 md:px-6 md:py-0 md:h-full md:items-center">
          {/* Mobile Header */}
          <div className="md:hidden flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {formatYear(entry.date)}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-lg capitalize">
                {formatDate(entry.date)}
                {isLatest && (
                  <span className="ml-2 align-middle text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-positive-100 dark:bg-positive-900/40 text-positive-700 dark:text-positive-300">
                    {t('latest')}
                  </span>
                )}
              </span>
            </div>
            {!isReadOnly && (
              <button
                onClick={(e) => onDelete(entry.id, e)}
                className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors rounded-lg bg-slate-50 dark:bg-slate-700/50"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {/* Desktop: Year & Date */}
          <div className="hidden md:block w-20 text-slate-400 dark:text-slate-500 text-sm">
            {formatYear(entry.date)}
          </div>
          <div className="hidden md:flex flex-1 items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 text-sm capitalize">
            {formatDate(entry.date)}
            {isLatest && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-positive-100 dark:bg-positive-900/40 text-positive-700 dark:text-positive-300">
                {t('latest')}
              </span>
            )}
          </div>

          {/* Data columns */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:flex md:gap-0 w-full md:w-auto">
            {dataKeys.map((key) => {
              const val = entry[key];
              const { min, range } = colStats[key];
              const barW = Math.max(4, Math.round(((val - min) / range) * 100));
              const prevVal = prevEntry?.[key];
              const delta = prevVal ? ((val - prevVal) / Math.abs(prevVal)) * 100 : null;
              // For debt, an increase is bad news
              const deltaGood = key === 'debt' ? delta! < 0 : delta! > 0;
              const deltaColor =
                delta === 0
                  ? 'text-slate-400 dark:text-slate-500'
                  : deltaGood
                    ? 'text-positive-500 dark:text-positive-400'
                    : 'text-rose-500 dark:text-rose-400';
              return (
                <div
                  key={key}
                  className="flex flex-col md:block md:w-28 text-left md:text-right md:px-1"
                >
                  <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 px-0.5">
                    {key === 'debt'
                      ? t('totalDebt')
                      : key === 'savings'
                        ? t('savings')
                        : key === 'balance'
                          ? t('netBalance')
                          : t('retirementCapital')}
                  </span>
                  <div>
                    <div className="flex items-baseline gap-1.5 md:justify-end">
                      {delta !== null && (
                        <span
                          className={`text-[10px] font-semibold tabular-nums pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 transition-opacity ${deltaColor}`}
                        >
                          {delta >= 0 ? '+' : ''}
                          {delta.toFixed(1)}%
                        </span>
                      )}
                      <span className={`text-sm font-bold tabular-nums ${colTextColors[key]}`}>
                        {formatCurrencyNoDecimals(val)}
                      </span>
                    </div>
                    <div className="h-[3px] mt-1 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${barW}%`, backgroundColor: colBarColors[key] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!isReadOnly && (
            <div className="hidden md:flex w-10 justify-end">
              <button
                onClick={(e) => onDelete(entry.id, e)}
                className="p-2 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100 transition-all rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  onDelete,
  isReadOnly,
  isLoading,
}) => {
  const { t, language } = useLanguage();
  const { isCompact } = useDensity();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const colStats = useMemo<Record<ColKey, ColStat>>(() => {
    const keys: ColKey[] = ['savings', 'debt', 'balance', 'retirement'];
    return Object.fromEntries(
      keys.map((key) => {
        const vals = history.map((h) => h[key]);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        return [key, { min, max, range: max - min || 1 }];
      })
    ) as Record<ColKey, ColStat>;
  }, [history]);

  const formatYear = (isoDate: string) => {
    const date = new Date(isoDate);
    return isNaN(date.getTime()) ? '----' : date.getFullYear();
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', {
      day: 'numeric',
      month: 'long',
    });
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setItemToDelete(id);
  };

  const dataKeys: ColKey[] = ['savings', 'debt', 'balance', 'retirement'];

  const desktopRowHeight = isCompact ? 48 : 60;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const rowHeight = isMobile ? 230 : desktopRowHeight;

  // Grow with content instead of leaving dead space, capped at the previous fixed height
  const listHeight = Math.min(550, Math.max(rowHeight, history.length * rowHeight));

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-colors relative z-0">
        <div className="hidden md:flex bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700 px-6 py-4 density-header-py text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div className="w-20 text-left">{t('year')}</div>
          <div className="flex-1 text-left">{t('date')}</div>
          <div className="w-28 text-right">{t('savings')}</div>
          <div className="w-28 text-right">{t('totalDebt')}</div>
          <div className="w-28 text-right">{t('netBalance')}</div>
          <div className="w-28 text-right">{t('retirementCapital')}</div>
          <div className="w-10"></div>
        </div>

        <div
          className={`relative ${history.length === 0 && !isLoading ? 'h-[320px]' : ''}`}
          style={!isLoading && history.length > 0 ? { height: listHeight } : undefined}
        >
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-2 py-3 border-b border-slate-50 dark:border-slate-700/50"
                >
                  <div className="skeleton h-4 w-16 rounded-md" />
                  <div className="skeleton h-4 w-28 rounded-md" />
                  <div className="ml-auto flex gap-3">
                    {[...Array(4)].map((__, j) => (
                      <div key={j} className="skeleton h-6 w-20 rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <List
              height={listHeight}
              itemCount={history.length}
              itemSize={rowHeight}
              width="100%"
              className="virtual-list h-full overflow-y-auto"
            >
              {({ index, style }: { index: number; style: React.CSSProperties }) => (
                <HistoryRow
                  key={index}
                  style={style}
                  entry={history[index]}
                  prevEntry={history[index + 1]}
                  isLatest={index === 0}
                  onDelete={handleDeleteClick}
                  t={t}
                  language={language}
                  colStats={colStats}
                  formatYear={formatYear}
                  formatDate={formatDate}
                  dataKeys={dataKeys}
                  isReadOnly={isReadOnly}
                />
              )}
            </List>
          ) : (
            <EmptyState
              icon={<CalendarDays size={28} />}
              title={t('emptyHistory')}
              subtitle={t('emptyHistoryHint')}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title={t('confirmDeleteHistory')}
        message={t('confirmDeleteHistoryMessage')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
        variant="danger"
      />
    </>
  );
};

export default HistoryTable;
