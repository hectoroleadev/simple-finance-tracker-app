import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'danger',
}) => {
    // Handle Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleEscape);
        // Prevent body scroll when open
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            button: 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 focus:ring-rose-500',
            icon: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30',
            Icon: AlertTriangle,
        },
        warning: {
            button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 focus:ring-amber-500',
            icon: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
            Icon: AlertCircle,
        },
        info: {
            button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500',
            icon: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
            Icon: Info,
        },
    };

    const styles = variantStyles[variant];
    const { Icon } = styles;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full shrink-0 ${styles.icon}`}>
                            <Icon size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                {title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 px-6 py-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-all active:scale-[0.98]"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmDialog;
