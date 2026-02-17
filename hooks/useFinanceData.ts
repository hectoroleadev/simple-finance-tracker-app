
import { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import { FinanceItem, HistoryEntry, CategoryType, FinanceContextType, FinanceTotals } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth

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
  const { getIdToken, isLoggedIn } = useAuth(); // Get getIdToken and isLoggedIn from AuthContext

  // --- Repository Initialization ---
  const repository = useMemo<FinanceRepository>(() => {
    const apiUrl = import.meta.env.VITE_API_GATEWAY_URL;

    if (apiUrl && isLoggedIn) { // Only use API Gateway if logged in
      console.log('Using API Gateway Repository:', apiUrl);
      return new ApiGatewayAdapter(apiUrl, getIdToken);
    } else {
      console.log('Using LocalStorage Repository (or not logged in)');
      return new LocalStorageAdapter(); // Fallback to LocalStorage or if not logged in
    }
  }, [getIdToken, isLoggedIn]); // Re-initialize if token or login status changes


  // --- State ---
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [totals, setTotals] = useState<FinanceTotals>(FinanceCalculator.calculateTotals([]));
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);
  const workerRef = useRef<Worker | null>(null);

  // --- Initial Data Loading ---
  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('../utils/finance.worker.ts', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'TOTALS_CALCULATED') {
        setTotals(payload);
      } else if (type === 'CHART_DATA_PREPARED') {
        setChartData(payload);
      }
    };

    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedItems, fetchedHistory] = await Promise.all([
          repository.getItems(),
          repository.getHistory()
        ]);

        setItems(fetchedItems);

        // Sort history by date descending (newest first)
        const sortedHistory = fetchedHistory.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHistory(sortedHistory);

        // Trigger initial calculations in worker
        workerRef.current?.postMessage({ type: 'CALCULATE_TOTALS', payload: fetchedItems });
        workerRef.current?.postMessage({ type: 'PREPARE_CHART_DATA', payload: sortedHistory });

        setError(null);
      } catch (err: any) {
        console.error('Failed to load finance data', err);
        setError(err.message || t('errors.loadFailed') || 'Failed to load data');
      } finally {
        setLoading(false);
        isInitialized.current = true;
      }
    };

    if (isLoggedIn) { // Only load data if logged in
      loadData();
    } else { // If not logged in, clear data and set loading to false
      setItems([]);
      setHistory([]);
      setTotals(FinanceCalculator.calculateTotals([]));
      setChartData([]);
      setLoading(false);
      isInitialized.current = true; // Mark as initialized to prevent initial save attempts
    }


    return () => {
      workerRef.current?.terminate();
    };
  }, [t, repository, isLoggedIn]); // Add repository and isLoggedIn to dependencies

  // --- Background Calculation Effects ---
  useEffect(() => {
    if (isInitialized.current && workerRef.current) {
      workerRef.current.postMessage({ type: 'CALCULATE_TOTALS', payload: items });
    }
  }, [items]);

  useEffect(() => {
    if (isInitialized.current && workerRef.current) {
      workerRef.current.postMessage({ type: 'PREPARE_CHART_DATA', payload: history });
    }
  }, [history]);

  // --- Persistence Effects ---
  // Only save if data has been initialized and user is logged in
  useEffect(() => {
    if (isInitialized.current && isLoggedIn) {
      const save = async () => {
        try {
          await repository.saveItems(items);
        } catch (err) {
          console.error('Failed to save items', err);
        }
      };
      save();
    }
  }, [items, isLoggedIn, repository]);

  useEffect(() => {
    if (isInitialized.current && isLoggedIn) {
      const save = async () => {
        try {
          await repository.saveHistory(history);
        } catch (err) {
          console.error('Failed to save history', err);
        }
      };
      save();
    }
  }, [history, isLoggedIn, repository]);

  // --- Actions (Use Cases) ---
  const actions = {
    updateItem: (id: string, name: string, amount: number) => {
      setItems(prev => prev.map(item => item.id === id ? { ...item, name, amount } : item));
    },

    deleteItem: (id: string) => {
      // Optimistic update
      setItems(prev => prev.filter(item => item.id !== id));

      // Explicitly call delete on repository
      repository.deleteItem(id).catch(err => {
        console.error('Failed to delete item in repository', err);
        // Note: In a production app, we might want to revert the state change or show a toast error here
      });
    },

    addItem: (category: CategoryType) => {
      const newItem: FinanceItem = {
        id: crypto.randomUUID(),
        name: 'New Item',
        amount: 0,
        category,
      };
      setItems(prev => [...prev, newItem]);
      return newItem;
    },

    snapshotHistory: () => {
      const newEntry = FinanceCalculator.createSnapshot(totals);
      // Prepend new entry (which is the newest date) to maintain desc order
      setHistory(prev => [newEntry, ...prev]);
      return true;
    },

    deleteHistoryItem: (id: string) => {
      // Optimistic update
      setHistory(prev => prev.filter(item => item.id !== id));
      // Explicitly call delete on repository
      repository.deleteHistoryItem(id).catch(err => {
        console.error('Failed to delete history item in repository', err);
      });
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
