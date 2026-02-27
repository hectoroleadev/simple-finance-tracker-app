import React, { useEffect } from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ShortcutsHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();

    // Handle Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? '⌘' : 'Ctrl';

    // Simplistic mobile check (CSS media queries are generally better, but this works for JS logic)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const shortcuts = [
        {
            category: t('helpModal.categories.general'),
            items: [
                { keys: ['Esc'], description: t('helpModal.shortcuts.closeModal') },
            ],
            hideOnMobile: true,
        },
        {
            category: t('helpModal.categories.navigation'),
            items: [
                { keys: ['1'], description: t('helpModal.shortcuts.goDashboard') },
                { keys: ['2'], description: t('helpModal.shortcuts.goHistory') },
                { keys: ['3'], description: t('helpModal.shortcuts.goCharts') },
            ],
            hideOnMobile: true,
        },
        {
            category: t('helpModal.categories.actions'),
            items: [
                { keys: ['s'], description: t('helpModal.shortcuts.takeSnapshot') },
                { keys: [modKey, 'e'], description: t('helpModal.shortcuts.exportData') },
            ],
            hideOnMobile: false, // Actions like taking a snapshot might be useful to know even if no keyboard
        },
        {
            category: t('helpModal.categories.theme'),
            items: [
                { keys: ['t'], description: t('helpModal.shortcuts.toggleTheme') },
            ],
            hideOnMobile: true,
        },
    ];

    const visibleShortcuts = isMobile ? shortcuts.filter(s => !s.hideOnMobile) : shortcuts;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <Keyboard className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('helpModal.title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {isMobile && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-lg text-sm mb-4">
                            {t('helpModal.shortcuts.mobileNote')}
                        </div>
                    )}
                    {visibleShortcuts.map((section) => (
                        <div key={section.category}>
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                {section.category}
                            </h3>
                            <div className="space-y-2">
                                {section.items.map((shortcut, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors gap-4"
                                    >
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {shortcut.description}
                                        </span>
                                        {!isMobile && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                {shortcut.keys.map((key, keyIdx) => (
                                                    <React.Fragment key={keyIdx}>
                                                        {keyIdx > 0 && (
                                                            <span className="text-slate-400 dark:text-slate-500 text-xs mx-1">
                                                                +
                                                            </span>
                                                        )}
                                                        <kbd className="px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm min-w-[28px] text-center">
                                                            {key}
                                                        </kbd>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        {t('helpModal.closeHelp')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShortcutsHelpModal;
