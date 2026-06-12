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
  sparkline?: number[];
}

// Lightweight inline SVG — recharts is lazy-loaded and too heavy for a 64px line
const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className }) => {
  if (data.length < 2) return null;
  const w = 64;
  const h = 22;
  const pad = 2;
  const min = Math.min(...data);
  const range = Math.max(...data) - min || 1;
  const points = data
    .map(
      (v, i) =>
        `${pad + (i * (w - 2 * pad)) / (data.length - 1)},${
          h - pad - ((v - min) / range) * (h - 2 * pad)
        }`
    )
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  color,
  icon,
  trend,
  trendInverted,
  sparkline,
}) => {
  const animatedValue = useCounterAnimation(value, { duration: 300 });

  const colorMap = {
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
    yellow: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
  };

  const sparkColorMap = {
    green: 'text-emerald-500/60 dark:text-emerald-400/60',
    red: 'text-rose-500/60 dark:text-rose-400/60',
    blue: 'text-blue-500/60 dark:text-blue-400/60',
    yellow: 'text-amber-500/60 dark:text-amber-400/60',
  };

  // V12: Subtle directional gradient tint per KPI sign
  const gradientMap = {
    green:
      'bg-gradient-to-br from-white to-emerald-50/70 dark:from-slate-800 dark:to-emerald-900/20',
    red: 'bg-gradient-to-br from-white to-rose-50/70 dark:from-slate-800 dark:to-rose-900/20',
    blue: 'bg-gradient-to-br from-white to-blue-50/70 dark:from-slate-800 dark:to-blue-900/20',
    yellow: 'bg-gradient-to-br from-white to-amber-50/70 dark:from-slate-800 dark:to-amber-900/20',
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
    <div
      className={`${gradientMap[color]} p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm card-interactive`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg transition-all ${colorMap[color]}`}>{icon}</div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {sparkline && (
          <Sparkline data={sparkline} className={`ml-auto shrink-0 ${sparkColorMap[color]}`} />
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
          {formatCurrency(animatedValue)}
        </div>
        {showTrend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums mb-0.5 shrink-0 ${trendColor}`}
          >
            {trendFlat ? (
              <Equal size={11} />
            ) : trendPositive ? (
              <TrendingUp size={11} />
            ) : (
              <TrendingDown size={11} />
            )}
            {trendFlat ? '0.0' : `${trendPositive ? '+' : '-'}${Math.abs(trend!).toFixed(1)}`}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
