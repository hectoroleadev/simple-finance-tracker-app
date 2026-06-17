import React, { useState, Suspense, lazy } from 'react';
import {
  LayoutDashboard,
  History as HistoryIcon,
  PieChart as PieChartIcon,
  User,
  Camera,
} from 'lucide-react';
import { useDensity } from '../hooks/useDensity';
import { useSnapshot } from '../hooks/useSnapshot';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/format';
import { useCounterAnimation } from '../hooks/useCounterAnimation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import MobileNav from '../components/MobileNav';
import AccountMenu from '../components/AccountMenu';
import PageTransition from '../components/PageTransition';
import SnapshotConfirmDialog from '../components/SnapshotConfirmDialog';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSnapshotConfirm, setShowSnapshotConfirm] = useState(false);
  const { isReadOnly } = useFinanceContext();
  const { isStale, snapshotAge, hasSnapshot, canSnapshot, recency } = useSnapshot();
  const { toggleDensity } = useDensity();
  const DENSITY_PAGES = ['/dashboard', '/history'];

  const snapshotTitle = hasSnapshot ? `${t('lastSnapshot')} ${snapshotAge}` : t('snapshot');
  const recencyDotClass = {
    fresh: 'bg-emerald-500',
    aging: 'bg-amber-500',
    stale: 'bg-rose-500',
  } as const;

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
      {
        key: 'c',
        description: 'Toggle compact view',
        action: () => {
          if (DENSITY_PAGES.includes(location.pathname)) toggleDensity();
        },
      },
      { key: '1', description: 'Go to Dashboard', action: () => navigate('/dashboard') },
      { key: '2', description: 'Go to History', action: () => navigate('/history') },
      { key: '3', description: 'Go to Charts', action: () => navigate('/charts') },
      {
        key: 's',
        description: 'Take snapshot',
        action: () => {
          if (canSnapshot) setShowSnapshotConfirm(true);
        },
      },
    ],
  });

  const tabs = [
    { id: 'dashboard', label: t('summary'), icon: LayoutDashboard, path: '/dashboard' },
    { id: 'history', label: t('history'), icon: HistoryIcon, path: '/history' },
    { id: 'charts', label: t('analysis'), icon: PieChartIcon, path: '/charts' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
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
        {t('skipToContent')}
      </a>

      <header className="bg-white/75 dark:bg-slate-800/75 backdrop-blur-[3px] border-b border-slate-200/70 dark:border-slate-700/70 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar — desktop: AccountMenu dropdown, mobile: opens drawer */}
            <div className="hidden lg:block">
              <AccountMenu
                onShowHelp={() => setShowShortcutsHelp(true)}
                onManageCategories={() => setShowCategoriesManager(true)}
                onManageSharing={() => setShowSharingManager(true)}
                isReadOnly={isReadOnly}
              />
            </div>

            <button
              className={`lg:hidden relative w-9 h-9 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 ${
                mobileMenuOpen
                  ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-800'
                  : ''
              }`}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
            >
              <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                <User size={18} className="text-slate-400 dark:text-slate-300" />
              </div>
            </button>

            {/* App title — desktop only */}
            <h1
              className="hidden lg:block text-base lg:text-lg font-bold text-slate-900 dark:text-white tracking-tight cursor-pointer"
              onClick={() => navigate('/')}
            >
              {t('appTitle')}
              <span className="text-slate-400 font-medium">{t('appTitleCore')}</span>
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-6 sm:gap-8 ml-4">
            {/* Mobile icon-only nav */}
            <nav
              aria-label="Primary navigation"
              className="lg:hidden flex items-center gap-1"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  aria-label={tab.label}
                  className={`p-2 rounded-lg transition-all ${
                    currentPath === tab.id
                      ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <tab.icon size={20} />
                </button>
              ))}

              {/* Snapshot — reduced message on small screens */}
              {canSnapshot && (
                <button
                  onClick={() => setShowSnapshotConfirm(true)}
                  title={snapshotTitle}
                  aria-label={snapshotTitle}
                  className="relative flex items-center p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
                >
                  <Camera size={20} />
                  {hasSnapshot && recency && (
                    <span
                      className={`absolute top-1 right-1 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${recencyDotClass[recency]}`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )}
            </nav>

            <nav
              aria-label="Primary navigation"
              className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg transition-colors"
            >
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

              {/* Snapshot — action grouped with the nav tabs */}
              {canSnapshot && (
                <button
                  onClick={() => setShowSnapshotConfirm(true)}
                  title={snapshotTitle}
                  aria-label={snapshotTitle}
                  className="flex items-center gap-2 px-4 py-1.5 ml-1 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-l border-slate-200 dark:border-slate-600 transition-all"
                >
                  <Camera size={16} />
                  {hasSnapshot && (
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        isStale ? 'text-amber-600 dark:text-amber-400' : ''
                      }`}
                    >
                      <span className="hidden xl:inline">{t('lastSnapshot')} </span>
                      {snapshotAge}
                    </span>
                  )}
                </button>
              )}
            </nav>

            <div className="hidden lg:flex items-center gap-4 sm:gap-6 border-l border-slate-200 dark:border-slate-700 pl-4 sm:pl-6 h-10">
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

            {/* Mobile: net worth only */}
            <div className="text-right lg:hidden">
              <span
                className={`text-lg font-bold tabular-nums ${netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
              >
                {formatCurrency(animatedNetWorth)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PageTransition>{children}</PageTransition>
      </main>

      <footer className="py-6 text-center border-t border-slate-200/70 dark:border-slate-800/70 transition-colors">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} {t('footer')}
        </p>
      </footer>

      {/* Mobile Bottom Navigation — hidden now that nav is in the header */}
      <nav
        aria-label="Mobile navigation"
        className="hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex justify-around items-center z-30 transition-colors"
      >
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
        <ShortcutsHelpModal
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />
        <CategoriesManagerModal
          isOpen={showCategoriesManager}
          onClose={() => setShowCategoriesManager(false)}
        />
        <SharingManagerModal
          isOpen={showSharingManager}
          onClose={() => setShowSharingManager(false)}
        />
      </Suspense>

      <SnapshotConfirmDialog
        isOpen={showSnapshotConfirm}
        onClose={() => setShowSnapshotConfirm(false)}
      />
    </div>
  );
};

export default MainLayout;
