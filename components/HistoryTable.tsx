import React, { useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { HistoryEntry } from '../types';
import { formatCurrencyNoDecimals } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface HistoryTableProps {
  history: HistoryEntry[];
  onDelete: (id: string) => void;
}

const HistoryRow = React.memo(({
  entry,
  onDelete,
  t,
  language,
  getHeatmapColor,
  formatYear,
  formatDate,
  dataKeys,
  style
}: {
  entry: HistoryEntry;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  t: (key: string) => string;
  language: string;
  getHeatmapColor: (val: number, type: 'savings' | 'debt' | 'balance' | 'retirement') => string;
  formatYear: (isoDate: string) => string | number;
  formatDate: (isoDate: string) => string;
  dataKeys: ('savings' | 'debt' | 'balance' | 'retirement')[];
  style: React.CSSProperties;
}) => (
  <div
    style={style}
    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group relative"
  >
    <div className="flex flex-col md:flex-row p-4 md:px-6 md:py-0 md:h-[60px] md:items-center">
      {/* Mobile Header: Date & Delete Button */}
      <div className="md:hidden flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            {formatYear(entry.date)}
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-lg capitalize">
            {formatDate(entry.date)}
          </span>
        </div>
        <button
          onClick={(e) => onDelete(entry.id, e)}
          className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors rounded-lg bg-slate-50 dark:bg-slate-700/50"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Desktop: Year & Date Columns */}
      <div className="hidden md:block w-20 text-slate-400 dark:text-slate-500 text-sm">
        {formatYear(entry.date)}
      </div>
      <div className="hidden md:block flex-1 font-semibold text-slate-700 dark:text-slate-300 text-sm capitalize">
        {formatDate(entry.date)}
      </div>

      {/* Data Grid: 2 cols on mobile, flex row on desktop */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:flex md:gap-0 w-full md:w-auto">
        {dataKeys.map((key) => (
          <div key={key} className="flex flex-col md:block md:w-28 text-left md:text-right md:px-1">
            {/* Mobile Label */}
            <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 px-0.5">
              {key === 'debt' ? t('totalDebt') :
                key === 'savings' ? t('savings') :
                  key === 'balance' ? t('netBalance') : t('retirementCapital')}
            </span>

            {/* Value Badge */}
            <div className={`inline-flex items-center md:justify-end rounded-lg px-3 py-2 md:py-1 text-sm md:text-xs font-bold tabular-nums border transition-colors w-full md:w-auto shadow-sm md:shadow-none ${getHeatmapColor(entry[key], key)}`}>
              {formatCurrencyNoDecimals(entry[key])}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Delete Button */}
      <div className="hidden md:flex w-10 justify-end">
        <button
          onClick={(e) => onDelete(entry.id, e)}
          className="p-2 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
));

const HistoryTable: React.FC<HistoryTableProps> = ({ history, onDelete }) => {
  const { t, language } = useLanguage();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const getHeatmapColor = (val: number, type: 'savings' | 'debt' | 'balance' | 'retirement') => {
    const vals = history.map(h => h[type]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const percentile = (val - min) / range;

    if (type === 'debt') {
      if (percentile > 0.66) return 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800';
      if (percentile > 0.33) return 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800';
      return 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800';
    } else {
      if (percentile > 0.66) return 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800';
      if (percentile > 0.33) return 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-600';
      return 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800';
    }
  };

  const formatYear = (isoDate: string) => {
    const date = new Date(isoDate);
    return isNaN(date.getTime()) ? '----' : date.getFullYear();
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', {
      day: 'numeric',
      month: 'long'
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

  const dataKeys: ('savings' | 'debt' | 'balance' | 'retirement')[] = ['savings', 'debt', 'balance', 'retirement'];

  // Row height for virtual list
  // Mobile rows are taller to accommodate the card layout (~230px)
  const [rowHeight, setRowHeight] = useState(window.innerWidth < 768 ? 230 : 60);

  useEffect(() => {
    const handleResize = () => {
      setRowHeight(window.innerWidth < 768 ? 230 : 60);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[600px] transition-colors relative z-0">
        <div className="hidden md:flex bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div className="w-20 text-left">{t('year')}</div>
          <div className="flex-1 text-left">{t('date')}</div>
          <div className="w-28 text-right">{t('savings')}</div>
          <div className="w-28 text-right">{t('totalDebt')}</div>
          <div className="w-28 text-right">{t('netBalance')}</div>
          <div className="w-28 text-right">{t('retirementCapital')}</div>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 relative">
          {history.length > 0 ? (
            <List
              height={550}
              itemCount={history.length}
              itemSize={rowHeight}
              width="100%"
              className="virtual-list h-full overflow-y-auto"
            >
              {({ index, style }) => (
                <HistoryRow
                  style={style}
                  entry={history[index]}
                  onDelete={handleDeleteClick}
                  t={t}
                  language={language}
                  getHeatmapColor={getHeatmapColor}
                  formatYear={formatYear}
                  formatDate={formatDate}
                  dataKeys={dataKeys}
                />
              )}
            </List>
          ) : (
            <div className="p-20 text-center text-slate-400 dark:text-slate-500 text-sm">{t('emptyList')}</div>
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
