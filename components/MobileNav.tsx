import React, { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, History, BarChart3, Sun, Moon, Globe, Wallet, ChevronRight, LogOut, HelpCircle, Tags } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface MobileNavProps {
    onHelpClick?: () => void;
    onCategoriesClick?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onHelpClick, onCategoriesClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { state: { theme }, dispatch } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { isLoggedIn, logout } = useAuth();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    // Close menu when pressing Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeMenu();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    const handleNavigation = (path: string) => {
        navigate(path);
        closeMenu();
    };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: t('summary') },
        { path: '/history', icon: History, label: t('history') },
        { path: '/charts', icon: BarChart3, label: t('analysis') },
    ];

    return (
        <>
            {/* Mobile Menu Trigger Button */}
            <button
                onClick={toggleMenu}
                className="lg:hidden fixed top-4 right-4 z-[60] p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop Overlay */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeMenu}
            />

            {/* Side drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-slate-900 z-[55] lg:hidden transform transition-transform duration-500 ease-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Branding Header */}
                <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-slate-900 dark:bg-slate-700 p-2 rounded-xl">
                            <Wallet size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                {t('appTitle')}<span className="text-slate-400 font-medium">{t('appTitleCore')}</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                                {t('appDescription')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="px-4 py-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            Menu
                        </span>
                    </div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${isActive
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-none'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 dark:bg-slate-900/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    <Icon size={20} />
                                </div>
                                <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
                                <ChevronRight size={16} className={`transition-transform duration-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                            </button>
                        );
                    })}
                </div>

                {/* Settings / Footer Section */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="px-4 py-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            {t('settings')}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {/* Help Button */}
                        <button
                            onClick={() => {
                                closeMenu();
                                if (onHelpClick) onHelpClick();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <HelpCircle size={20} className="text-indigo-500" />
                            <span className="font-semibold text-sm">{t('help')} - {t('shortcuts')}</span>
                        </button>

                        {/* Categories Manager */}
                        <button
                            onClick={() => {
                                closeMenu();
                                if (onCategoriesClick) onCategoriesClick();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <Tags size={20} className="text-amber-500" />
                            <span className="font-semibold text-sm">{t('categoriesManager.title')}</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-blue-600" />}
                                <span className="font-semibold text-sm">{theme === 'dark' ? t('lightMode') : t('darkMode')}</span>
                            </div>
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100'}`}>
                                <div className={`w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4 bg-amber-500' : 'bg-slate-400'}`} />
                            </div>
                        </button>

                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                <Globe size={20} className="text-emerald-500" />
                                <span className="font-semibold text-sm">{language === 'en' ? t('spanish') : t('english')}</span>
                            </div>
                            <div className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md uppercase">
                                {language === 'en' ? 'ES' : 'EN'}
                            </div>
                        </button>

                        {/* Logout Button */}
                        {isLoggedIn && (
                            <button
                                onClick={() => {
                                    logout();
                                    closeMenu();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all shadow-sm active:scale-[0.98] mt-4"
                            >
                                <LogOut size={20} />
                                <span className="font-semibold text-sm">{t('logout')}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileNav;
