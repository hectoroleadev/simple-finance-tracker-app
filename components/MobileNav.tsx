import React, { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, History, BarChart3, Sun, Moon, Globe, Wallet, ChevronRight, LogOut, HelpCircle, Tags, Users, User, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useFinanceContext } from '../context/FinanceContext';

interface MobileNavProps {
    onHelpClick?: () => void;
    onCategoriesClick?: () => void;
    onSharingClick?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onHelpClick, onCategoriesClick, onSharingClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { state: { theme }, dispatch } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { isLoggedIn, logout } = useAuth();
    const { sharedWithMe, viewAs, actions } = useFinanceContext();

    const sh = (key: string) => t(`sharing.${key}`);

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

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto flex flex-col">
                    {/* Navigation Section */}
                    <div className="p-4 space-y-1">
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

                    {/* Account Status / Switching */}
                    <div className="p-4 pt-0">
                        <div className="px-4 py-2 mb-2">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                {t('auth.usernameLabel')}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    actions.setViewAs(null);
                                    closeMenu();
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${!viewAs
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <User size={20} className={!viewAs ? 'text-blue-500' : 'text-slate-400'} />
                                    <span>{t('sharing.myAccount')}</span>
                                </div>
                                {!viewAs && <Check size={18} />}
                            </button>

                            {sharedWithMe.map(share => {
                                const isActive = viewAs === share.ownerId;
                                return (
                                    <button
                                        key={share.ownerId}
                                        onClick={() => {
                                            actions.setViewAs(share.ownerId);
                                            closeMenu();
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Users size={20} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                                            <span className="truncate">{share.ownerId}</span>
                                        </div>
                                        {isActive && <Check size={18} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Settings / Footer Section */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
                        <div className="px-4 py-2 mb-2">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                {t('settings')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {!viewAs && (
                                <>
                                    <button
                                        onClick={() => { closeMenu(); if (onCategoriesClick) onCategoriesClick(); }}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                    >
                                        <Tags size={20} className="text-amber-500 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight text-center">{t('categories.debt').replace('s', '')}</span>
                                    </button>

                                    <button
                                        onClick={() => { closeMenu(); if (onSharingClick) onSharingClick(); }}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                    >
                                        <Users size={20} className="text-blue-500 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight text-center">{sh('title').split(' ')[0]}</span>
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            >
                                {theme === 'dark' ? <Sun size={20} className="text-amber-500 mb-2" /> : <Moon size={20} className="text-blue-600 mb-2" />}
                                <span className="text-[10px] font-bold uppercase tracking-tight text-center">{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
                            </button>

                            <button
                                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            >
                                <Globe size={20} className="text-emerald-500 mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-tight text-center">{language === 'en' ? 'ESPAÑOL' : 'ENGLISH'}</span>
                            </button>
                        </div>

                        <div className="mt-2 space-y-2">
                            <button
                                onClick={() => { closeMenu(); if (onHelpClick) onHelpClick(); }}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-slate-500 dark:text-slate-500 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <HelpCircle size={18} />
                                <span>{t('shortcuts')}</span>
                            </button>

                            {isLoggedIn && (
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-rose-500 font-bold text-sm bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20"
                                >
                                    <LogOut size={18} />
                                    <span>{t('auth.logout')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileNav;
