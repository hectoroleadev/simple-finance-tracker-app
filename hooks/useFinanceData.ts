import { useState, useEffect, useMemo, useRef } from 'react';
import { FinanceTotals, ChartDataPoint, DEFAULT_CATEGORIES } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// Domain
import { FinanceCalculator } from '../domain/finance.logic';
import { FinanceRepository } from '../domain/ports';

// Infrastructure
import { createRepository } from '../infrastructure/createRepository';

// Application layer
import { useFinanceQueries } from '../application/useFinanceQueries';
import { useFinanceActions } from '../application/useFinanceActions';

// Presentation layer — re-export so RootLayout keeps a single import
export { FinanceContext, useFinanceContext } from '../context/FinanceContext';

/**
 * Thin orchestrator — composes the application layer hooks and the web worker.
 * Does NOT contain query logic or use-case logic directly.
 *
 * Dependency flow:
 *   infrastructure/createRepository  →  FinanceRepository (port)
 *   application/useFinanceQueries   →  reads + mutations
 *   application/useFinanceActions   →  use cases
 */
export const useFinanceData = () => {
  const { t } = useLanguage();
  const { getIdToken, isLoggedIn, refreshAuthTokens, logout } = useAuth();

  const [viewAs, setViewAs] = useState<string | null>(null);
  const [totals, setTotals] = useState<FinanceTotals>(FinanceCalculator.calculateTotals([], DEFAULT_CATEGORIES));
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const workerRef = useRef<Worker | null>(null);

  const isReadOnly = useMemo(() => viewAs !== null, [viewAs]);

  // Infrastructure: choose the right adapter
  const repository = useMemo<FinanceRepository>(
    () => createRepository(isLoggedIn, { getToken: getIdToken, refreshAuthTokens, logout }),
    [getIdToken, isLoggedIn, refreshAuthTokens, logout]
  );

  // Application: queries + mutations
  const {
    items, categories, history, shares, sharedWithMe,
    loading, errorObj,
    saveItemsMutation, deleteItemMutation, saveHistoryMutation,
    saveCategoriesMutation, deleteHistoryItemMutation,
    inviteUserMutation, revokeShareMutation,
  } = useFinanceQueries({ repository, isLoggedIn, viewAs });

  // Application: use cases
  const actions = useFinanceActions({
    repository, isLoggedIn, viewAs,
    items, categories, totals,
    saveItemsMutation, deleteItemMutation, saveHistoryMutation,
    saveCategoriesMutation, deleteHistoryItemMutation,
    inviteUserMutation, revokeShareMutation,
  });

  // Web Worker: off-main-thread calculations
  useEffect(() => {
    workerRef.current = new Worker(new URL('../utils/finance.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'TOTALS_CALCULATED') setTotals(payload);
      else if (type === 'CHART_DATA_PREPARED') setChartData(payload);
    };
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (workerRef.current && items.length > 0 && categories.length > 0) {
      workerRef.current.postMessage({ type: 'CALCULATE_TOTALS', payload: { items, categories } });
    } else if (items.length === 0) {
      setTotals(FinanceCalculator.calculateTotals([], categories.length > 0 ? categories : DEFAULT_CATEGORIES));
    }
  }, [items, categories]);

  useEffect(() => {
    if (workerRef.current && history.length > 0) {
      workerRef.current.postMessage({ type: 'PREPARE_CHART_DATA', payload: history });
    } else if (history.length === 0) {
      setChartData([]);
    }
  }, [history]);

  const error = errorObj ? (errorObj.message || t('errors.loadFailed') || 'Failed to load data') : null;

  return {
    items, categories, history, totals, chartData,
    loading, error, viewAs, isReadOnly, shares, sharedWithMe,
    actions: { ...actions, setViewAs },
  };
};
