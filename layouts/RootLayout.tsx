
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceData, FinanceContext } from '../hooks/useFinanceData';
import MainLayout from './MainLayout';
import Loading from '../components/Loading';
import { FinanceContextType } from '../types';

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const {
    items,
    categories,
    history: financeHistory,
    totals,
    chartData,
    loading,
    error,
    actions
  } = useFinanceData();

  const handleSnapshot = () => {
    actions.snapshotHistory();
    navigate('/history');
  };

  const contextValue: FinanceContextType = {
    items,
    categories,
    totals,
    history: financeHistory,
    chartData,
    loading,
    error,
    actions,
    onSnapshot: handleSnapshot
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border-l-4 border-rose-500">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error</h2>
          <p className="text-slate-600 dark:text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <FinanceContext.Provider value={contextValue}>
      <MainLayout netWorth={totals.balance}>
        {children}
      </MainLayout>
    </FinanceContext.Provider>
  );
};

export default RootLayout;
