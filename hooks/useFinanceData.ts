import { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FinanceItem, HistoryEntry, ItemRevision, CategoryType, FinanceContextType, FinanceTotals } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// Domain & Infrastructure Imports
import { FinanceCalculator } from '../domain/finance.logic';
import { FinanceRepository } from '../domain/ports';
import { LocalStorageAdapter } from '../infrastructure/LocalStorageAdapter';
import { ApiGatewayAdapter } from '../infrastructure/ApiGatewayAdapter';

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinanceContext = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
};

export const useFinanceData = () => {
  const { language, t } = useLanguage();
  const { getIdToken, isLoggedIn, refreshAuthTokens, logout } = useAuth();
  const queryClient = useQueryClient();

  // --- Repository Initialization ---
  const repository = useMemo<FinanceRepository>(() => {
    const apiUrl = import.meta.env.VITE_API_GATEWAY_URL;

    if (apiUrl && isLoggedIn) {
      console.log('Using API Gateway Repository:', apiUrl);
      return new ApiGatewayAdapter(apiUrl, getIdToken, refreshAuthTokens, logout);
    } else {
      console.log('Using LocalStorage Repository (or not logged in)');
      return new LocalStorageAdapter();
    }
  }, [getIdToken, isLoggedIn, refreshAuthTokens, logout]);

  // --- Web Worker Setup ---
  const [totals, setTotals] = useState<FinanceTotals>(FinanceCalculator.calculateTotals([]));
  const [chartData, setChartData] = useState<any[]>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../utils/finance.worker.ts', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'TOTALS_CALCULATED') {
        setTotals(payload);
      } else if (type === 'CHART_DATA_PREPARED') {
        setChartData(payload);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // --- Queries (TanStack Query) ---

  const {
    data: items = [],
    isLoading: isLoadingItems,
    error: itemsError
  } = useQuery({
    queryKey: ['items', isLoggedIn],
    queryFn: async () => {
      const fetchedItems = await repository.getItems();
      return fetchedItems.map(item => ({
        ...item,
        amount: Number(item.amount) || 0
      }));
    },
    enabled: isLoggedIn, // Only run query if the user is authenticated
  });

  const {
    data: history = [],
    isLoading: isLoadingHistory,
    error: historyError
  } = useQuery({
    queryKey: ['history', isLoggedIn],
    queryFn: async () => {
      const fetchedHistory = await repository.getHistory();
      // Ensure all numeric fields are actually numbers, and sort history by date descending
      return fetchedHistory
        .map(entry => ({
          ...entry,
          debt: Number(entry.debt) || 0,
          investments: Number(entry.investments) || 0,
          liquid: Number(entry.liquid) || 0,
          pending: Number(entry.pending) || 0,
          retirement: Number(entry.retirement) || 0,
          savings: Number(entry.savings) || 0,
          balance: Number(entry.balance) || 0,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    },
    enabled: isLoggedIn,
  });

  // Derived state loading/error
  const loading = (isLoadingItems || isLoadingHistory) && isLoggedIn;
  const errorObj = itemsError || historyError;
  const error = errorObj ? (errorObj.message || t('errors.loadFailed') || 'Failed to load data') : null;

  // --- Trigger Worker on Data Changes ---
  useEffect(() => {
    if (workerRef.current && items.length > 0) {
      workerRef.current.postMessage({ type: 'CALCULATE_TOTALS', payload: items });
    } else if (items.length === 0) {
      setTotals(FinanceCalculator.calculateTotals([]));
    }
  }, [items]);

  useEffect(() => {
    if (workerRef.current && history.length > 0) {
      workerRef.current.postMessage({ type: 'PREPARE_CHART_DATA', payload: history });
    } else if (history.length === 0) {
      setChartData([]);
    }
  }, [history]);

  // --- Mutations (TanStack Query Optimistic Updates) ---

  // Update Items directly in the backend
  const saveItemsMutation = useMutation({
    mutationFn: (newItems: FinanceItem[]) => repository.saveItems(newItems),
    onMutate: async (newItems) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previousItems = queryClient.getQueryData(['items']);
      queryClient.setQueryData(['items', isLoggedIn], newItems);
      return { previousItems };
    },
    onError: (err, newItems, context: any) => {
      console.error('Failed to save items', err);
      if (context?.previousItems) {
        queryClient.setQueryData(['items', isLoggedIn], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  // Delete single item (combining local change with batch save behavior of the API)
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      // The current API Gateway Adapter assumes /items/{id} for delete
      await repository.deleteItem(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previousItems = queryClient.getQueryData<FinanceItem[]>(['items', isLoggedIn]);

      if (previousItems) {
        queryClient.setQueryData(['items', isLoggedIn], previousItems.filter(i => i.id !== id));
      }
      return { previousItems };
    },
    onError: (err, id, context: any) => {
      console.error('Failed to delete item', err);
      if (context?.previousItems) {
        queryClient.setQueryData(['items', isLoggedIn], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });

  const saveHistoryMutation = useMutation({
    mutationFn: (newHistory: HistoryEntry[]) => repository.saveHistory(newHistory),
    onMutate: async (newHistory) => {
      await queryClient.cancelQueries({ queryKey: ['history'] });
      const previousHistory = queryClient.getQueryData(['history']);
      queryClient.setQueryData(['history', isLoggedIn], newHistory);
      return { previousHistory };
    },
    onError: (err, newHistory, context: any) => {
      console.error('Failed to save history', err);
      if (context?.previousHistory) {
        queryClient.setQueryData(['history', isLoggedIn], context.previousHistory);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const deleteHistoryItemMutation = useMutation({
    mutationFn: (id: string) => repository.deleteHistoryItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['history'] });
      const previousHistory = queryClient.getQueryData<HistoryEntry[]>(['history', isLoggedIn]);

      if (previousHistory) {
        queryClient.setQueryData(['history', isLoggedIn], previousHistory.filter(i => i.id !== id));
      }
      return { previousHistory };
    },
    onError: (err, id, context: any) => {
      console.error('Failed to delete history item', err);
      if (context?.previousHistory) {
        queryClient.setQueryData(['history', isLoggedIn], context.previousHistory);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });


  // --- Actions (Use Cases) ---
  const actions = {
    updateItem: (id: string, name: string, amount: number) => {
      const prevItems = queryClient.getQueryData<FinanceItem[]>(['items', isLoggedIn]) || [];
      const newItems = prevItems.map(item => item.id === id ? { ...item, name, amount } : item);
      saveItemsMutation.mutate(newItems);
    },

    deleteItem: (id: string) => {
      deleteItemMutation.mutate(id);
    },

    addItem: (category: CategoryType) => {
      const prevItems = queryClient.getQueryData<FinanceItem[]>(['items', isLoggedIn]) || [];
      const newItem: FinanceItem = {
        id: crypto.randomUUID(),
        name: 'New Item',
        amount: 0,
        category,
      };
      saveItemsMutation.mutate([...prevItems, newItem]);
      return newItem;
    },

    snapshotHistory: () => {
      const prevHistory = queryClient.getQueryData<HistoryEntry[]>(['history', isLoggedIn]) || [];
      const newEntry = FinanceCalculator.createSnapshot(totals);
      saveHistoryMutation.mutate([newEntry, ...prevHistory]);
      return true;
    },

    deleteHistoryItem: (id: string) => {
      deleteHistoryItemMutation.mutate(id);
    },

    getItemHistory: async (id: string) => {
      // Direct query for item history as it's typically fetched on-demand per item in a modal
      try {
        return await queryClient.fetchQuery({
          queryKey: ['itemHistory', id],
          queryFn: () => repository.getItemHistory(id),
          staleTime: 1000 * 60, // 1 minute stale time for individual histories
        });
      } catch (err) {
        console.error('Failed to load item history', err);
        throw err;
      }
    }
  };

  return {
    items,
    history,
    totals,
    chartData,
    loading,
    error,
    actions
  };
};
