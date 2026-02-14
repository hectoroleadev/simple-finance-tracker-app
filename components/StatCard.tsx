
import React from 'react';
import { formatCurrency } from '../utils/format';

interface StatCardProps {
  label: string;
  value: number;
  color: 'green' | 'red' | 'blue' | 'yellow';
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon }) => {
  const colorMap = {
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
    yellow: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg transition-colors ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
        {formatCurrency(value)}
      </div>
    </div>
  );
};

export default StatCard;
