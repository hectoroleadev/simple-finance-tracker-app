import React from 'react';
import { Trash2 } from 'lucide-react';
import HistoryTable from '../components/HistoryTable';
import { useLanguage } from '../context/LanguageContext';
import { useFinanceContext } from '../hooks/useFinanceData';

const HistoryPage: React.FC = () => {
  const { history, actions } = useFinanceContext();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('historyTitle')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('historyDesc')}</p>
        </div>
        <button 
          onClick={actions.clearHistory}
          className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2"
        >
          <Trash2 size={16} />
          {t('clearAll')}
        </button>
      </div>
      
      <HistoryTable history={history} onDelete={actions.deleteHistoryItem} />
    </div>
  );
};

export default HistoryPage;