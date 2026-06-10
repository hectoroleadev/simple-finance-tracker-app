
import React from 'react';
import { TrendingUp, TrendingDown, Equal } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { useCounterAnimation } from '../hooks/useCounterAnimation';

interface StatCardProps {
  label: string;
  value: number;
  color: 'green' | 'red' | 'blue' | 'yellow';
  icon?: React.ReactNode;
  trend?: number | null;
  trendInverted?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon, trend, trendInverted }) => {
  const animatedValue = useCounterAnimation(value, { duration: 300 });

  const colorMap = {
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
    yellow: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
  };

  const showTrend = trend != null;
  const trendFlat = trend === 0;
  const trendPositive = trendInverted ? trend! < 0 : trend! > 0;
  const trendColor = trendFlat
    ? 'text-slate-400 dark:text-slate-500'
    : trendPositive
      ? 'text-emerald-500 dark:text-emerald-400'
      : 'text-rose-500 dark:text-rose-400';

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm card-interactive transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg transition-all ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
          {formatCurrency(animatedValue)}
        </div>
        {showTrend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums mb-0.5 shrink-0 ${trendColor}`}>
            {trendFlat ? <Equal size={11} /> : trendPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trendFlat ? '0.0' : `${trendPositive ? '+' : '-'}${Math.abs(trend!).toFixed(1)}`}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
