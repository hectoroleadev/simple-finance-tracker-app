
import React from 'react';
import { FinanceItem, CategoryType } from '../types';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';
import { useItemEditor } from '../hooks/useItemEditor';
import { formatCurrency } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';

interface CategoryTableProps {
  title: string;
  type: CategoryType;
  items: FinanceItem[];
  color: 'green' | 'red' | 'yellow';
  onUpdateItem: (id: string, name: string, amount: number) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: CategoryType) => FinanceItem;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  title,
  type,
  items,
  color,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
}) => {
  const { t } = useLanguage();
  const {
    editingId,
    editName,
    editAmount,
    startEditing,
    saveEdit,
    handleNameChange,
    handleAmountChange,
    handleKeyDown
  } = useItemEditor({ onUpdate: onUpdateItem });

  const total = items.reduce((acc, item) => acc + item.amount, 0);

  const accentColor = {
    green: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    yellow: 'text-amber-600 dark:text-amber-400',
  }[color];

  const handleAddItem = () => {
    const newItem = onAddItem(type);
    startEditing(newItem);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[450px] overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <button 
          onClick={handleAddItem}
          className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
        >
          <Plus size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto virtual-list">
        {items.length > 0 ? (
          items.map((item) => (
            <div 
              key={item.id}
              className="border-b border-slate-50 dark:border-slate-700/50 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors px-5 py-3.5 group"
            >
              <div className="flex-1 overflow-hidden">
                {editingId === item.id ? (
                  <input
                    autoFocus
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-slate-900 dark:text-white"
                    value={editName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={(e) => e.target.select()}
                  />
                ) : (
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate block">{item.name}</span>
                )}
              </div>
              <div className="w-24 text-right ml-3 shrink-0">
                {editingId === item.id ? (
                  <input
                    type="number"
                    className="w-full text-right bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-slate-900 dark:text-white"
                    value={editAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                ) : (
                  <span className="text-sm text-slate-900 dark:text-white font-semibold tabular-nums">{formatCurrency(item.amount)}</span>
                )}
              </div>
              <div className="w-14 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                {editingId === item.id ? (
                  <button onClick={saveEdit} className="text-emerald-600 dark:text-emerald-400"><Check size={16} /></button>
                ) : (
                  <>
                    <button onClick={() => startEditing(item)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Edit2 size={14} /></button>
                    <button onClick={() => onDeleteItem(item.id)} className="text-slate-300 hover:text-rose-500 dark:hover:text-rose-400"><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs italic">
            {t('emptyList')}
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-700/20 flex justify-between items-center">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('total')}</span>
        <span className={`text-lg font-bold tabular-nums ${accentColor}`}>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};

export default CategoryTable;
