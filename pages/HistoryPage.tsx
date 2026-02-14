
import React from 'react';
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
      </div>
      
      <HistoryTable history={history} onDelete={actions.deleteHistoryItem} />
    </div>
  );
};

export default HistoryPage;
