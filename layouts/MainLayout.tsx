
import React from 'react';
import { 
  Wallet, 
  LayoutDashboard, 
  History as HistoryIcon, 
  PieChart as PieChartIcon, 
  Moon, 
  Sun
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/format';

interface MainLayoutProps {
  children: React.ReactNode;
  netWorth: number;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  netWorth 
}) => {
  const { state: { theme }, dispatch } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.substring(1) || 'dashboard';

  const tabs = [
    { id: 'dashboard', label: t('summary'), icon: LayoutDashboard, path: '/dashboard' },
    { id: 'history', label: t('history'), icon: HistoryIcon, path: '/history' },
    { id: 'charts', label: t('analysis'), icon: PieChartIcon, path: '/charts' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-slate-900 dark:bg-slate-700 p-2 rounded-lg transition-colors">
              <Wallet size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t('appTitle')}<span className="text-slate-400 font-medium">{t('appTitleCore')}</span>
            </h1>
          </div>

          <nav className="hidden md:flex items-center bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg transition-colors">
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

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block mr-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('netWorth')}</span>
              <span className={`text-xl font-bold tabular-nums ${netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(netWorth)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-full">
              <button 
                onClick={() => setLanguage('en')}
                className={`text-xs font-bold px-2 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('es')}
                className={`text-xs font-bold px-2 py-1 rounded-full transition-colors ${language === 'es' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
              >
                ES
              </button>
            </div>

            <button 
              onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="py-10 text-center border-t border-slate-200 dark:border-slate-800 transition-colors">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('footer')}</p>
      </footer>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex justify-around items-center z-50 transition-colors">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`p-2 transition-colors ${
              currentPath === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <tab.icon size={22} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MainLayout;
