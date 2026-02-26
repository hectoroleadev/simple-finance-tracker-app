import React, { useEffect, useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useFinanceContext } from '../hooks/useFinanceData';
import { ItemRevision } from '../types';
import { formatCurrency } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';

interface ItemHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string | null;
    itemName: string;
    currentAmount: number;
}

const ItemHistoryModal: React.FC<ItemHistoryModalProps> = ({ isOpen, onClose, itemId, itemName, currentAmount }) => {
    const { actions } = useFinanceContext();
    const { t } = useLanguage();
    const [history, setHistory] = useState<ItemRevision[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && itemId) {
            const loadHistory = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await actions.getItemHistory(itemId);
                    setHistory(data);
                } catch (err: any) {
                    setError(err.message || 'Failed to load history');
                } finally {
                    setLoading(false);
                }
            };
            loadHistory();
        } else {
            setHistory([]);
        }
    }, [isOpen, itemId, actions]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Clock size={18} className="text-blue-500" />
                            {t('history') || 'Historia'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[250px]">{itemName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Current Info */}
                <div className="px-6 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-800/30">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Valor Actual</p>
                    <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{formatCurrency(currentAmount)}</p>
                </div>

                {/* Timeline Body */}
                <div className="overflow-y-auto flex-1 p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-rose-500 dark:text-rose-400 text-sm p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            {error}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-slate-500 dark:text-slate-400 italic py-8">
                            No hay historial disponible para esta entrada.
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 pb-4">
                            {history.map((rev, idx) => {
                                const isCreate = rev.type === 'create';
                                const isUpdate = rev.type === 'update';
                                const isDelete = rev.type === 'delete';

                                let bgColor = 'bg-blue-500';
                                let title = 'Actualizado';

                                if (isCreate) {
                                    bgColor = 'bg-emerald-500';
                                    title = 'Creado';
                                } else if (isDelete) {
                                    bgColor = 'bg-rose-500';
                                    title = 'Eliminado';
                                }

                                const date = new Date(rev.timestamp);
                                const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                                const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <div key={rev.timestamp + idx} className="relative pl-6">
                                        <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${bgColor} ring-4 ring-white dark:ring-slate-800`} />

                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-100 dark:border-slate-600">
                                            <div className="flex justify-between items-baseline mb-2">
                                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{formattedDate} • {formattedTime}</span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Monto:</span>
                                                    <span className="font-medium tabular-nums text-slate-900 dark:text-white">{formatCurrency(rev.amount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Nombre:</span>
                                                    <span className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{rev.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemHistoryModal;
