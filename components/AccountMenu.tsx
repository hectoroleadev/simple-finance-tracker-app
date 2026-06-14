import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Users,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  Check,
  Tags,
  AlignLeft,
  AlignJustify,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useFinanceContext } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDensity } from '../hooks/useDensity';

interface AccountMenuProps {
  onShowHelp: () => void;
  onManageCategories: () => void;
  onManageSharing: () => void;
  isReadOnly?: boolean;
}

const AccountMenu: React.FC<AccountMenuProps> = ({
  onShowHelp,
  onManageCategories,
  onManageSharing,
  isReadOnly,
}) => {
  const { sharedWithMe, viewAs, actions } = useFinanceContext();
  const { language, setLanguage, t } = useLanguage();
  const {
    state: { theme },
    dispatch,
  } = useTheme();
  const { isLoggedIn, logout } = useAuth();

  const location = useLocation();
  const { density, toggleDensity } = useDensity();
  const isDensityPage = ['/dashboard', '/history'].includes(location.pathname);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sh = (key: string) => t(`sharing.${key}`);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentUserName = viewAs || sh('myAccount') || 'My Account';
  const isShared = !!viewAs;

  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 ${
          isOpen ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-800' : ''
        }`}
        aria-label={currentUserName}
      >
        <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
          <User size={18} className="text-slate-400 dark:text-slate-300" />
        </div>
        {isShared && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-left backdrop-blur-xl bg-white/90 dark:bg-slate-800/90">
          <div className="p-2 space-y-1">
            {/* Account Selection Section */}
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {sh('title') || 'Accounts'}
            </div>

            <button
              onClick={() => {
                actions.setViewAs(null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                !viewAs
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <User size={18} className={!viewAs ? 'text-blue-500' : 'text-slate-400'} />
                <span>{sh('myAccount') || 'My Account'}</span>
              </div>
              {!viewAs && <Check size={16} />}
            </button>

            {sharedWithMe.map((share) => {
              const isActive = viewAs === share.ownerId;
              return (
                <button
                  key={share.ownerId}
                  onClick={() => {
                    actions.setViewAs(share.ownerId);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Users
                      size={18}
                      className={`shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`}
                    />
                    <span className="truncate">{share.ownerId}</span>
                  </div>
                  {isActive && <Check size={16} />}
                </button>
              );
            })}

            {!viewAs && !isReadOnly && (
              <>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-2" />

                {/* Management Section */}
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {t('settings') || 'Management'}
                </div>

                <button
                  onClick={() => {
                    onManageCategories();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                >
                  <Tags size={18} className="text-slate-400" />
                  <span>{t('categoriesManager.title')}</span>
                </button>

                <button
                  onClick={() => {
                    onManageSharing();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                >
                  <Users size={18} className="text-slate-400" />
                  <span>{sh('title')}</span>
                </button>
              </>
            )}

            <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-2" />

            {/* Preferences Section */}
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t('language')} & {t('theme')}
            </div>

            <div className="flex items-center gap-1 px-3 py-1">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                ENGLISH
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'es' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                ESPAÑOL
              </button>
            </div>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Sun size={18} className="text-amber-500" />
                ) : (
                  <Moon size={18} className="text-slate-400" />
                )}
                <span>{theme === 'dark' ? t('lightMode') : t('darkMode')}</span>
              </div>
              <div
                className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-slate-300'}`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`}
                />
              </div>
            </button>

            {isDensityPage && (
              <button
                onClick={toggleDensity}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  {density === 'compact' ? (
                    <AlignJustify size={18} className="text-slate-400" />
                  ) : (
                    <AlignLeft size={18} className="text-slate-400" />
                  )}
                  <span>{density === 'comfortable' ? t('densityCompact') : t('densityComfortable')}</span>
                </div>
                <div
                  className={`w-8 h-4 rounded-full p-0.5 transition-colors ${density === 'compact' ? 'bg-blue-500' : 'bg-slate-300'}`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full transition-transform ${density === 'compact' ? 'translate-x-4' : ''}`}
                  />
                </div>
              </button>
            )}

            <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-2" />

            {/* Help & Logout */}
            <button
              onClick={() => {
                onShowHelp();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
            >
              <HelpCircle size={18} className="text-slate-400" />
              <span>{t('shortcuts')}</span>
            </button>

            {isLoggedIn && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-medium"
              >
                <LogOut size={18} />
                <span>{t('auth.logout')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
