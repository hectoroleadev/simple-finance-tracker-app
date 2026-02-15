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

    const shortcuts = [
        {
            category: 'General',
            items: [
                { keys: ['Shift', '/'], description: 'Show keyboard shortcuts' },
                { keys: ['Esc'], description: 'Close modal/dialog' },
            ],
        },
        {
            category: 'Navigation',
            items: [
                { keys: ['1'], description: 'Go to Dashboard' },
                { keys: ['2'], description: 'Go to History' },
                { keys: ['3'], description: 'Go to Charts' },
            ],
        },
        {
            category: 'Actions',
            items: [
                { keys: ['s'], description: 'Take snapshot' },
                { keys: [modKey, 'e'], description: 'Export data (coming soon)' },
            ],
        },
        {
            category: 'Theme',
            items: [
                { keys: ['t'], description: 'Toggle dark/light theme' },
            ],
        },
    ];

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
                            Keyboard Shortcuts
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
                    {shortcuts.map((section) => (
                        <div key={section.category}>
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                {section.category}
                            </h3>
                            <div className="space-y-2">
                                {section.items.map((shortcut, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {shortcut.description}
                                        </span>
                                        <div className="flex items-center gap-1">
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-600 rounded">Esc</kbd> or click outside to close
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShortcutsHelpModal;
