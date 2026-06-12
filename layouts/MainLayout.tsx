import React, { useState, Suspense, lazy } from 'react';
import {
  Wallet,
  LayoutDashboard,
  History as HistoryIcon,
  PieChart as PieChartIcon,
  AlignJustify,
  AlignLeft,
} from 'lucide-react';
import { useDensity } from '../hooks/useDensity';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { useCounterAnimation } from '../hooks/useCounterAnimation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import MobileNav from '../components/MobileNav';
import AccountMenu from '../components/AccountMenu';
import PageTransition from '../components/PageTransition';
import { useFinanceContext } from '../context/FinanceContext';

const ShortcutsHelpModal = lazy(() => import('../components/ShortcutsHelpModal'));
const CategoriesManagerModal = lazy(() => import('../components/CategoriesManagerModal'));
const SharingManagerModal = lazy(() => import('../components/SharingManagerModal'));

interface MainLayoutProps {
  children: React.ReactNode;
  netWorth: number;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, netWorth }) => {
  const {
    state: { theme },
    dispatch,
  } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const animatedNetWorth = useCounterAnimation(netWorth, { duration: 300 });
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [showSharingManager, setShowSharingManager] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const { isReadOnly } = useFinanceContext();
  const { density, toggleDensity } = useDensity();

  const currentPath = location.pathname.substring(1) || 'dashboard';

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: '?',
        description: 'Show keyboard shortcuts',
        action: () => setShowShortcutsHelp(true),
      },
      { key: 't', description: 'Toggle theme', action: () => dispatch({ type: 'TOGGLE_THEME' }) },
      { key: '1', description: 'Go to Dashboard', action: () => navigate('/dashboard') },
      { key: '2', description: 'Go to History', action: () => navigate('/history') },
      { key: '3', description: 'Go to Charts', action: () => navigate('/charts') },
    ],
  });

  const tabs = [
    { id: 'dashboard', label: t('summary'), icon: LayoutDashboard, path: '/dashboard' },
    { id: 'history', label: t('history'), icon: HistoryIcon, path: '/history' },
    { id: 'charts', label: t('analysis'), icon: PieChartIcon, path: '/charts' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 lg:pb-0 transition-colors duration-300">
      <MobileNav
        onHelpClick={() => setShowShortcutsHelp(true)}
        onCategoriesClick={() => setShowCategoriesManager(true)}
        onSharingClick={() => setShowSharingManager(true)}
        isReadOnly={isReadOnly}
      />

      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[10000] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>

      {/* V12: sticky header with translucent blur */}
      <header className="bg-white/85 dark:bg-slate-800/85 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-700/70 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-slate-900 dark:bg-slate-700 p-2 rounded-lg transition-colors">
              <Wallet size={20} className="text-white" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t('appTitle')}
              <span className="text-slate-400 font-medium hidden sm:inline">
                {t('appTitleCore')}
              </span>
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-6 sm:gap-8 ml-4">
            <nav aria-label="Primary navigation" className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg transition-colors">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    currentPath === tab.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4 sm:gap-6 border-l border-slate-200 dark:border-slate-700 pl-4 sm:pl-6 h-10">
              {/* V14: Density toggle */}
              <button
                onClick={toggleDensity}
                title={
                  density === 'comfortable'
                    ? 'Switch to compact view'
                    : 'Switch to comfortable view'
                }
                aria-label={
                  density === 'comfortable'
                    ? 'Switch to compact view'
                    : 'Switch to comfortable view'
                }
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {density === 'comfortable' ? <AlignLeft size={16} /> : <AlignJustify size={16} />}
              </button>
              <AccountMenu
                onShowHelp={() => setShowShortcutsHelp(true)}
                onManageCategories={() => setShowCategoriesManager(true)}
                onManageSharing={() => setShowSharingManager(true)}
                isReadOnly={isReadOnly}
              />

              <div className="text-right">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('netWorth')}
                </span>
                <span
                  className={`text-lg sm:text-xl font-bold tabular-nums ${netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                >
                  {formatCurrency(animatedNetWorth)}
                </span>
              </div>
            </div>

            {/* Always show net worth on mobile, but simply */}
            <div className="text-right lg:hidden mr-12">
              <span
                className={`text-lg font-bold tabular-nums ${netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
              >
                {formatCurrency(animatedNetWorth)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PageTransition>{children}</PageTransition>
      </main>

      <footer className="py-10 text-center border-t border-slate-200 dark:border-slate-800 transition-colors">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {t('footer')}
        </p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav aria-label="Mobile navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex justify-around items-center z-30 transition-colors">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            aria-current={currentPath === tab.id ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              currentPath === tab.id
                ? 'text-slate-900 dark:text-white scale-110'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <tab.icon size={22} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      <Suspense fallback={null}>
        <ShortcutsHelpModal isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
        <CategoriesManagerModal
          isOpen={showCategoriesManager}
          onClose={() => setShowCategoriesManager(false)}
        />
        <SharingManagerModal
          isOpen={showSharingManager}
          onClose={() => setShowSharingManager(false)}
        />
      </Suspense>
    </div>
  );
};

export default MainLayout;
