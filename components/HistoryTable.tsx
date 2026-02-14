
import React from 'react';
import { HistoryEntry } from '../types';
import { formatCurrencyNoDecimals } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { Trash2 } from 'lucide-react';

interface HistoryTableProps {
  history: HistoryEntry[];
  onDelete: (id: string) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ history, onDelete }) => {
  const { t, language } = useLanguage();

  const getHeatmapColor = (val: number, type: 'savings' | 'debt' | 'balance' | 'retirement') => {
    const vals = history.map(h => h[type]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const percentile = (val - min) / range;

    if (type === 'debt') {
      // Debt: Higher is "bad" (red), lower is "good" (green/amber)
      if (percentile > 0.66) return 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800';
      if (percentile > 0.33) return 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800';
      return 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800';
    } else {
      // Assets: Higher is "good" (green)
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
    
    // Format: "24 January" (EN) or "24 enero" (ES)
    return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', {
      day: 'numeric',
      month: 'long'
    });
  };

  // Keys to display in order
  const dataKeys: ('savings' | 'debt' | 'balance' | 'retirement')[] = ['savings', 'debt', 'balance', 'retirement'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] md:h-[600px] transition-colors">
      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden md:flex bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <div className="w-20 text-left">{t('year')}</div>
        <div className="flex-1 text-left">{t('date')}</div>
        <div className="w-28 text-right">{t('savings')}</div>
        <div className="w-28 text-right">{t('totalDebt')}</div>
        <div className="w-28 text-right">{t('netBalance')}</div>
        <div className="w-28 text-right">{t('retirementCapital')}</div>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto virtual-list">
        {history.length > 0 ? (
          history.map((entry) => (
            <div 
              key={entry.id}
              className="flex flex-col md:flex-row border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors p-4 md:px-6 md:py-0 md:h-[60px] md:items-center group relative"
            >
              {/* Mobile Header: Date & Delete Button */}
              <div className="md:hidden flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    {formatYear(entry.date)}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-lg capitalize">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <button 
                  onClick={() => onDelete(entry.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
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
              <div className="grid grid-cols-2 gap-3 md:flex md:gap-0 w-full md:w-auto">
                {dataKeys.map((key) => (
                  <div key={key} className="flex flex-col md:block md:w-28 text-left md:text-right md:px-1">
                    {/* Mobile Label */}
                    <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">
                      {key === 'debt' ? t('totalDebt') : 
                       key === 'savings' ? t('savings') :
                       key === 'balance' ? t('netBalance') : t('retirementCapital')}
                    </span>
                    
                    {/* Value Badge */}
                    <div className={`inline-flex items-center md:justify-end rounded-md px-2 md:px-3 py-1.5 md:py-1 text-sm md:text-xs font-bold tabular-nums border transition-colors w-full md:w-auto ${getHeatmapColor(entry[key], key)}`}>
                      {formatCurrencyNoDecimals(entry[key])}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Delete Button */}
              <div className="hidden md:flex w-10 justify-end">
                <button 
                  onClick={() => onDelete(entry.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center text-slate-400 dark:text-slate-500 text-sm">{t('emptyList')}</div>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;
