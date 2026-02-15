import React, { useState } from 'react';
import { Menu, X, Home, History, BarChart3, Sun, Moon, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const MobileNav: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { state: { theme }, dispatch } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const handleNavigation = (path: string) => {
        navigate(path);
        closeMenu();
    };

    const toggleTheme = () => {
        dispatch({ type: 'TOGGLE_THEME' });
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'es' : 'en');
    };

    const navItems = [
        { path: '/', icon: Home, label: t('dashboard') || 'Dashboard', key: '1' },
        { path: '/history', icon: History, label: t('history') || 'History', key: '2' },
        { path: '/charts', icon: BarChart3, label: t('charts') || 'Charts', key: '3' },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMenu}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                ) : (
                    <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={closeMenu}
                />
            )}

            {/* Slide-out Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-800 shadow-2xl z-40 lg:hidden transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Finance Tracker Pro
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('appDescription') || 'Manage your finances'}
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-slate-900 dark:bg-slate-700 text-white'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                    <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                                        {item.key}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Settings */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                            <span className="font-medium">
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </span>
                            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                                T
                            </span>
                        </button>

                        <button
                            onClick={toggleLanguage}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <Globe className="w-5 h-5" />
                            <span className="font-medium">
                                {language === 'en' ? 'Español' : 'English'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileNav;
