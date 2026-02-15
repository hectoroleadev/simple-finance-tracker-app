import React, { Suspense, lazy, useRef, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useFinanceContext } from '../hooks/useFinanceData';
import Loading from '../components/Loading';

// Lazy load Recharts components as they are quite heavy
const AreaChart = lazy(() => import('recharts').then(mod => ({ default: mod.AreaChart })));
const Area = lazy(() => import('recharts').then(mod => ({ default: mod.Area })));
const LineChart = lazy(() => import('recharts').then(mod => ({ default: mod.LineChart })));
const Line = lazy(() => import('recharts').then(mod => ({ default: mod.Line })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));

// Component to defer rendering until it's in viewport
const LazyChart: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] flex items-center justify-center">
      {isInView ? (
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      ) : (
        <Loading />
      )}
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
    tooltipBg: theme === 'dark' ? '#1e293b' : '#ffffff',
    tooltipBorder: theme === 'dark' ? '#334155' : '#e2e8f0',
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Wealth Trend Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-8 h-[400px] sm:h-[500px] shadow-sm flex flex-col transition-colors hover-lift overflow-hidden">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('trendWealth')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t('trendWealthDesc')}</p>
          </div>
          <div className="flex-1">
            <LazyChart>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorNeto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderRadius: '12px',
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: chartColors.text,
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="Balance" name="Net" stroke="#10b981" fillOpacity={1} fill="url(#colorNeto)" strokeWidth={3} />
                  <Area type="monotone" dataKey="Debt" name="Debt" stroke="#ef4444" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </LazyChart>
          </div>
        </div>

        {/* Retirement Evolution Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-8 h-[400px] sm:h-[500px] shadow-sm flex flex-col transition-colors hover-lift overflow-hidden">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('evolutionRetirement')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t('evolutionRetirementDesc')}</p>
          </div>
          <div className="flex-1">
            <LazyChart>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderRadius: '12px',
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: chartColors.text,
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="Retirement" name="Retirement" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </LazyChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;