import React from 'react';
import HistoryTable from '../components/HistoryTable';
import { useLanguage } from '../context/LanguageContext';
import { useFinanceContext } from '../context/FinanceContext';

const HistoryPage: React.FC = () => {
  const { history, isReadOnly, actions, loading } = useFinanceContext();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <HistoryTable
        history={history}
        onDelete={actions.deleteHistoryItem}
        isReadOnly={isReadOnly}
        isLoading={loading}
      />
    </div>
  );
};

export default HistoryPage;
