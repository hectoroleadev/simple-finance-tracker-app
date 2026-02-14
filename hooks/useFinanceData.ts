
import { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import { FinanceItem, HistoryEntry, CategoryType, FinanceContextType } from '../types';
import { useLanguage } from '../context/LanguageContext';

// Domain & Infrastructure Imports
import { FinanceCalculator } from '../domain/finance.logic';
import { FinanceRepository } from '../domain/ports';
import { LocalStorageAdapter } from '../infrastructure/LocalStorageAdapter';
import { ApiGatewayAdapter } from '../infrastructure/ApiGatewayAdapter';

// Determine which repository to use based on environment variables
const getRepository = (): FinanceRepository => {
  // Safely access import.meta.env which might be undefined in some environments
  // @ts-ignore - handling potential missing env property on import.meta
  const env = (import.meta.env || {}) as { VITE_API_URL?: string; VITE_API_KEY?: string };
  
  // Use the provided API Gateway URL as default if env var is not set
  const apiUrl = env.VITE_API_URL || 'https://vdra964tzg.execute-api.mx-central-1.amazonaws.com/prod';
  const apiKey = env.VITE_API_KEY;

  if (apiUrl) {
    console.log('Using API Gateway Repository:', apiUrl);
    return new ApiGatewayAdapter(apiUrl, apiKey);
  }
  
  console.log('Using LocalStorage Repository');
  return new LocalStorageAdapter();
};

const repository = getRepository();

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
  
  // --- State ---
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  // --- Initial Data Loading ---
  useEffect(() => {
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
        
        setError(null);
      } catch (err: any) {
        console.error('Failed to load finance data', err);
        // Use the specific error message if available, otherwise fallback to translation
        setError(err.message || t('errors.loadFailed') || 'Failed to load data');
      } finally {
        setLoading(false);
        isInitialized.current = true;
      }
    };

    loadData();
  }, [t]);

  // --- Persistence Effects ---
  // Only save if data has been initialized to avoid overwriting remote data with empty initial state
  useEffect(() => {
    if (isInitialized.current) {
      const save = async () => {
        try {
          await repository.saveItems(items);
        } catch (err) {
          console.error('Failed to save items', err);
        }
      };
      save();
    }
  }, [items]);

  useEffect(() => {
    if (isInitialized.current) {
      const save = async () => {
        try {
          await repository.saveHistory(history);
        } catch (err) {
          console.error('Failed to save history', err);
        }
      };
      save();
    }
  }, [history]);

  // --- Domain Logic ---
  const totals = useMemo(() => FinanceCalculator.calculateTotals(items), [items]);
  
  const chartData = useMemo(() => FinanceCalculator.prepareChartData(history), [history]);

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
