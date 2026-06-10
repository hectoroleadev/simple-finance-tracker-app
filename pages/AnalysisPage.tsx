import React, { Suspense, lazy, useRef, useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useFinanceContext } from '../context/FinanceContext';
import { ChartDataPoint } from '../types';
import { formatCurrencyNoDecimals } from '../utils/format';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { BarChart2 } from 'lucide-react';

const AreaChart = lazy(() => import('recharts').then(mod => ({ default: mod.AreaChart })));
const Area = lazy(() => import('recharts').then(mod => ({ default: mod.Area })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const ReferenceLine = lazy(() => import('recharts').then(mod => ({ default: mod.ReferenceLine })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));

const LazyChart: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsInView(true); observer.disconnect(); }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] flex items-center justify-center">
      {isInView ? <Suspense fallback={<Loading />}>{children}</Suspense> : <Loading />}
    </div>
  );
};

// Renders a labeled dot only on the last data point
const makeLastDot = (color: string, total: number) => (props: any): React.ReactElement => {
  const { cx, cy, index, value } = props;
  if (index !== total - 1) {
    return <circle key={`dot-${index}`} cx={cx} cy={cy} r={0} fill="transparent" />;
  }
  return (
    <g key={`dot-${index}`}>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={10} fontWeight="600" fill={color}>
        {formatCurrencyNoDecimals(value)}
      </text>
    </g>
  );
};

interface TooltipColors { bg: string; border: string; text: string }

const ChartTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  chartData: ChartDataPoint[];
  colors: TooltipColors;
}> = ({ active, payload, label, chartData, colors }) => {
  if (!active || !payload?.length || !label) return null;
  const idx = chartData.findIndex(d => d.date === label);
  const prev = idx > 0 ? chartData[idx - 1] : null;
  const d = new Date(label);
  const dateStr = isNaN(d.getTime())
    ? label
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ background: colors.bg, borderRadius: 12, border: `1px solid ${colors.border}`, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <p style={{ color: colors.text, marginBottom: 8, fontWeight: 600, fontSize: 11 }}>{dateStr}</p>
      {payload.map((p, i) => {
        const prevVal = prev ? (prev as any)[p.dataKey] as number : null;
        const delta = prevVal !== null && prevVal !== 0
          ? ((p.value - prevVal) / Math.abs(prevVal)) * 100
          : null;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 6 : 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: colors.text, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
              {formatCurrencyNoDecimals(p.value)}
            </span>
            {delta !== null && (
              <span style={{ fontSize: 10, fontWeight: 600, color: delta >= 0 ? '#10b981' : '#f43f5e' }}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const AnalysisPage: React.FC = () => {
  const { chartData } = useFinanceContext();
  const { state: { theme } } = useTheme();
  const { t } = useLanguage();

  const chartColors = {
    grid: theme === 'dark' ? '#334155' : '#f1f5f9',
    text: theme === 'dark' ? '#94a3b8' : '#94a3b8',
    tooltip: {
      bg: theme === 'dark' ? '#1e293b' : '#ffffff',
      border: theme === 'dark' ? '#334155' : '#e2e8f0',
      text: theme === 'dark' ? '#cbd5e1' : '#475569',
    },
  };

  const n = chartData.length;

  const avgBalance = useMemo(
    () => n === 0 ? 0 : chartData.reduce((s: number, d: ChartDataPoint) => s + (d.Balance || 0), 0) / n,
    [chartData, n]
  );
  const avgRetirement = useMemo(
    () => n === 0 ? 0 : chartData.reduce((s: number, d: ChartDataPoint) => s + (d.Retirement || 0), 0) / n,
    [chartData, n]
  );

  const wealthLastDot = useMemo(() => makeLastDot('#10b981', n), [n]);
  const retirementLastDot = useMemo(() => makeLastDot('#7c3aed', n), [n]);

  const wealthTooltip = (props: any) => (
    <ChartTooltip {...props} chartData={chartData} colors={chartColors.tooltip} />
  );
  const retirementTooltip = (props: any) => (
    <ChartTooltip {...props} chartData={chartData} colors={chartColors.tooltip} />
  );

  const xAxisFormatter = (val: string) => {
    const d = new Date(val);
    return isNaN(d.getTime()) ? '---' : d.toLocaleString('default', { month: 'short' });
  };

  const empty = n === 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">

        {/* Chart 1: Wealth Trend — emerald/rose palette */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-8 h-[400px] sm:h-[500px] shadow-sm flex flex-col card-interactive overflow-hidden">
          <div className="mb-4 sm:mb-6">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 mb-2">
              Balance & Debt
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('trendWealth')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t('trendWealthDesc')}</p>
          </div>
          <div className="flex-1">
            {empty ? (
              <EmptyState icon={<BarChart2 size={28} />} title={t('emptyHistory')} subtitle={t('emptyHistoryHint')} />
            ) : (
              <LazyChart>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#10b981" stopOpacity={0.28} />
                        <stop offset="55%"  stopColor="#10b981" stopOpacity={0.07} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradDebt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#f43f5e" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} tickFormatter={xAxisFormatter} minTickGap={30} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} />
                    <Tooltip content={wealthTooltip} />
                    <ReferenceLine y={avgBalance} stroke={chartColors.text} strokeDasharray="4 4" strokeOpacity={0.45} label={{ value: 'avg', fill: chartColors.text, fontSize: 10, position: 'insideTopRight' } as any} />
                    <Area type="monotone" dataKey="Balance" name="Net" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradBalance)" dot={wealthLastDot} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#10b981' }} />
                    <Area type="monotone" dataKey="Debt" name="Debt" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#gradDebt)" dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: '#f43f5e' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </LazyChart>
            )}
          </div>
        </div>

        {/* Chart 2: Retirement Evolution — violet palette */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-8 h-[400px] sm:h-[500px] shadow-sm flex flex-col card-interactive overflow-hidden">
          <div className="mb-4 sm:mb-6">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 mb-2">
              Retirement
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('evolutionRetirement')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t('evolutionRetirementDesc')}</p>
          </div>
          <div className="flex-1">
            {empty ? (
              <EmptyState icon={<BarChart2 size={28} />} title={t('emptyHistory')} subtitle={t('emptyHistoryHint')} />
            ) : (
              <LazyChart>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gradRetirement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="55%"  stopColor="#7c3aed" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} tickFormatter={xAxisFormatter} minTickGap={30} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} />
                    <Tooltip content={retirementTooltip} />
                    <ReferenceLine y={avgRetirement} stroke={chartColors.text} strokeDasharray="4 4" strokeOpacity={0.45} label={{ value: 'avg', fill: chartColors.text, fontSize: 10, position: 'insideTopRight' } as any} />
                    <Area type="monotone" dataKey="Retirement" name="Retirement" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#gradRetirement)" dot={retirementLastDot} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#7c3aed' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </LazyChart>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisPage;
