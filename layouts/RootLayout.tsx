
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useFinanceData } from '../hooks/useFinanceData';
import MainLayout from './MainLayout';
import Loading from '../components/Loading';
import { FinanceContextType } from '../types';

const RootLayout: React.FC = () => {
  const { 
    items, 
    history, 
    totals, 
    chartData, 
    loading,
    error,
    actions 
  } = useFinanceData();

  const navigate = useNavigate();

  const handleSnapshot = () => {
    actions.snapshotHistory();
    navigate('/history');
  };

  const contextValue: FinanceContextType = {
    items,
    totals,
    history,
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
    <MainLayout netWorth={totals.balance}>
      <Outlet context={contextValue} />
    </MainLayout>
  );
};

export default RootLayout;
