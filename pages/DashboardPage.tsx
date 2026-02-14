import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ExternalLink 
} from 'lucide-react';
import { CategoryType } from '../types';
import StatCard from '../components/StatCard';
import CategoryTable from '../components/CategoryTable';
import { formatCurrency } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { useFinanceContext } from '../hooks/useFinanceData';

const DashboardPage: React.FC = () => {
  const { items, totals, actions, onSnapshot } = useFinanceContext();
  const { t } = useLanguage();

  const getItemsByCategory = (cat: CategoryType) => items.filter(i => i.category === cat);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('savings')} value={totals.savings} color="green" icon={<TrendingUp size={18} />} />
        <StatCard label={t('totalDebt')} value={totals.debt} color="red" icon={<TrendingDown size={18} />} />
        <StatCard label={t('retirementCapital')} value={totals.retirement} color="yellow" icon={<ExternalLink size={18} />} />
        <StatCard label={t('netBalance')} value={totals.balance} color="blue" icon={<Wallet size={18} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <CategoryTable 
          title={t('categories.debt')} type={CategoryType.DEBT} color="red"
          items={getItemsByCategory(CategoryType.DEBT)} 
          onUpdateItem={actions.updateItem} onDeleteItem={actions.deleteItem} onAddItem={actions.addItem}
        />
        <CategoryTable 
          title={t('categories.investments')} type={CategoryType.INVESTMENTS} color="green"
          items={getItemsByCategory(CategoryType.INVESTMENTS)} 
          onUpdateItem={actions.updateItem} onDeleteItem={actions.deleteItem} onAddItem={actions.addItem}
        />
        <CategoryTable 
          title={t('categories.liquid_cash')} type={CategoryType.LIQUID_CASH} color="green"
          items={getItemsByCategory(CategoryType.LIQUID_CASH)} 
          onUpdateItem={actions.updateItem} onDeleteItem={actions.deleteItem} onAddItem={actions.addItem}
        />
        <CategoryTable 
          title={t('categories.pending_payments')} type={CategoryType.PENDING_PAYMENTS} color="green"
          items={getItemsByCategory(CategoryType.PENDING_PAYMENTS)} 
          onUpdateItem={actions.updateItem} onDeleteItem={actions.deleteItem} onAddItem={actions.addItem}
        />
        <CategoryTable 
          title={t('categories.retirement')} type={CategoryType.RETIREMENT} color="yellow"
          items={getItemsByCategory(CategoryType.RETIREMENT)} 
          onUpdateItem={actions.updateItem} onDeleteItem={actions.deleteItem} onAddItem={actions.addItem}
        />

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between h-[450px] shadow-sm transition-colors">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('periodClose')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('periodCloseDesc')}</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('totalAssets')}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.savings)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('finalNet')}</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(totals.balance)}</span>
            </div>
          </div>

          <button 
            onClick={onSnapshot}
            className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all active:scale-[0.98] shadow-sm text-sm"
          >
            {t('snapshot')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;