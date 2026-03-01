import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { Category, BalanceEffect } from '../types';
import { useFinanceContext } from '../hooks/useFinanceData';
import { useLanguage } from '../context/LanguageContext';
import ConfirmDialog from './ConfirmDialog';

interface CategoriesManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EFFECT_OPTIONS = [
    { value: BalanceEffect.POSITIVE, labelKey: 'effectPositive' },
    { value: BalanceEffect.NEGATIVE, labelKey: 'effectNegative' },
    { value: BalanceEffect.INFORMATIVE, labelKey: 'effectInformative' },
];

const EFFECT_COLORS = {
    [BalanceEffect.POSITIVE]: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    [BalanceEffect.NEGATIVE]: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    [BalanceEffect.INFORMATIVE]: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
};

const EMPTY_FORM: Omit<Category, 'id'> = { name: '', effect: BalanceEffect.POSITIVE };

const CategoriesManagerModal: React.FC<CategoriesManagerModalProps> = ({ isOpen, onClose }) => {
    const { categories, actions } = useFinanceContext();
    const { t } = useLanguage();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Omit<Category, 'id'>>(EMPTY_FORM);
    const [isAddNew, setIsAddNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const openNew = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setIsAddNew(true);
    };

    const openEdit = (cat: Category) => {
        setForm({ name: cat.name, effect: cat.effect, color: cat.color });
        setEditingId(cat.id);
        setIsAddNew(false);
    };

    const cancelForm = () => {
        setIsAddNew(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const id = isAddNew ? (window.crypto?.randomUUID?.() || Date.now().toString()) : editingId!;
            if (isAddNew) {
                await actions.addCategory({ id, ...form });
            } else {
                await actions.updateCategory({ id, ...form });
            }
            cancelForm();
        } catch (err: any) {
            console.error('handleSave error:', err);
            alert(err.message || 'Error saving category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deletingId) {
            try {
                await actions.deleteCategory(deletingId);
                setDeletingId(null);
            } catch (err: any) {
                console.error('handleDelete error:', err);
                alert(err.message || 'Error deleting category');
            }
        }
    };

    const cm = (key: string) => t(`categoriesManager.${key}`);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{cm('title')}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Category List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${EFFECT_COLORS[cat.effect]}`}>
                                {cat.effect === BalanceEffect.POSITIVE ? '➕' : cat.effect === BalanceEffect.NEGATIVE ? '➖' : 'ℹ️'}
                            </span>
                            <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(cat)}
                                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-110 transition-transform"
                                    title={cm('editCategory')}
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => setDeletingId(cat.id)}
                                    className="text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-110 transition-transform"
                                    title={cm('deleteCategoryTitle')}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inline Add / Edit Form */}
                {(isAddNew || editingId) && (
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-6 py-4 space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {isAddNew ? cm('addCategory') : cm('editCategory')}
                        </h3>
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{cm('categoryName')}</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                                autoFocus
                                placeholder={cm('categoryName')}
                            />
                        </div>
                        {/* Effect */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{cm('categoryEffect')}</label>
                            <div className="flex flex-col gap-2">
                                {EFFECT_OPTIONS.map(opt => (
                                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="effect"
                                            value={opt.value}
                                            checked={form.effect === opt.value}
                                            onChange={() => setForm(f => ({ ...f, effect: opt.value }))}
                                            className="accent-blue-600"
                                        />
                                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full border ${EFFECT_COLORS[opt.value]}`}>
                                            {cm(opt.labelKey)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={cancelForm}
                                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.name.trim()}
                                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Save size={14} />
                                {saving ? cm('saving') : cm('save')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {!isAddNew && !editingId && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                            onClick={openNew}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-slate-500 dark:hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all"
                        >
                            <Plus size={16} />
                            {cm('addCategory')}
                        </button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deletingId !== null}
                title={cm('deleteCategoryTitle')}
                message={cm('deleteCategoryMessage')}
                confirmText={cm('confirmDeleteCategory')}
                cancelText={t('cancel')}
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeletingId(null)}
            />
        </div>,
        document.body
    );
};

export default CategoriesManagerModal;
