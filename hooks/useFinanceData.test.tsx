
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFinanceData } from './useFinanceData';
import { FinanceItem, DEFAULT_CATEGORIES } from '../types';
import { LanguageProvider } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUser = { username: 'test-user', email: 'test@example.com' };

// Mock the adapter to isolate hook testing
const mockGetItems = vi.fn();
const mockSaveItems = vi.fn();
const mockGetHistory = vi.fn();
const mockSaveHistory = vi.fn();
const mockGetCategories = vi.fn().mockResolvedValue(DEFAULT_CATEGORIES);
const mockSaveCategories = vi.fn();

const mockRepo = {
  getItems: mockGetItems,
  saveItems: (items: any[], userId?: string) => mockSaveItems(items, userId),
  getHistory: mockGetHistory,
  saveHistory: (history: any[], userId?: string) => mockSaveHistory(history, userId),
  getCategories: mockGetCategories,
  saveCategories: (categories: any[], userId?: string) => mockSaveCategories(categories, userId),
  deleteItem: vi.fn().mockResolvedValue(true),
  deleteHistoryItem: vi.fn().mockResolvedValue(true),
  getItemHistory: vi.fn().mockResolvedValue([]),
  getMyShares: vi.fn().mockResolvedValue([]),
  createShare: vi.fn().mockResolvedValue(undefined),
  deleteShare: vi.fn().mockResolvedValue(undefined),
  getSharedWithMe: vi.fn().mockResolvedValue([]),
};

// Mock Worker
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  postMessage = vi.fn((data: any) => {
    // Simulate worker responses synchronously for stable testing
    if (data.type === 'CALCULATE_TOTALS') {
      this.onmessage?.({ data: { type: 'TOTALS_CALCULATED', payload: { income: 1000, expenses: 0, balance: 1000 } } } as MessageEvent);
    } else if (data.type === 'PREPARE_CHART_DATA') {
      this.onmessage?.({ data: { type: 'CHART_DATA_PREPARED', payload: [] } } as MessageEvent);
    }
  });
  terminate = vi.fn();
}

// @ts-ignore
global.Worker = MockWorker;

let queryClient: QueryClient;

// Mock constants or crypto
beforeEach(() => {
  vi.clearAllMocks();
  // Default mocks
  mockGetItems.mockResolvedValue([]);
  mockGetHistory.mockResolvedValue([]);
  mockGetCategories.mockResolvedValue(DEFAULT_CATEGORIES);

  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: () => 'uuid-test' },
    writable: true
  });

  // Mock window.confirm
  vi.spyOn(window, 'confirm').mockReturnValue(true);

  const authValue = {
    user: mockUser,
    isLoggedIn: true,
    getIdToken: vi.fn().mockReturnValue('test-token'),
    refreshAuthTokens: vi.fn().mockResolvedValue(true),
    logout: vi.fn(),
  };

  (useAuth as any).mockReturnValue(authValue);

  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
});

// Wrapper to provide LanguageContext and QueryClient
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>{children}</LanguageProvider>
  </QueryClientProvider>
);

describe('useFinanceData Hook', () => {
  const waitForLoad = async (result: any) => {
    // Wait for initial load
    await waitFor(() => {
      if (result.current.loading) throw new Error('Still loading');
    }, { timeout: 3000 });
    
    // Allow any pending microtasks to settle
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
  };

  it('initializes state by loading data from repository', async () => {
    console.log('>>> Test: initializes state');
    const initialItems: FinanceItem[] = [
      { id: '1', name: 'Test', amount: 100, category: 'debt' }
    ];
    mockGetItems.mockResolvedValue(initialItems);

    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });

    await waitForLoad(result);

    expect(mockGetItems).toHaveBeenCalled();
    expect(result.current.items).toHaveLength(1);
  });

  it('adds a new item correctly', async () => {
    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });
    await waitForLoad(result);

    await act(async () => {
      await result.current.actions.addItem('investments');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].category).toBe('investments');
    expect(result.current.items[0].name).toBe('New Item');
  });

  it('updates an existing item', async () => {
    const initialItems: FinanceItem[] = [
      { id: 'uuid-test', name: 'Original', amount: 100, category: 'debt' }
    ];
    mockGetItems.mockResolvedValue(initialItems);

    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });
    await waitForLoad(result);

    await act(async () => {
      result.current.actions.updateItem('uuid-test', 'Edited', 200);
    });

    expect(result.current.items[0].amount).toBe(200);
    expect(result.current.items[0].name).toBe('Edited');
  });

  it('deletes an item', async () => {
    const initialItems: FinanceItem[] = [
      { id: '1', name: 'Delete Me', amount: 100, category: 'debt' }
    ];
    mockGetItems.mockResolvedValue(initialItems);

    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });
    await waitForLoad(result);

    await act(async () => {
      result.current.actions.deleteItem('1');
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('snapshotHistory creates a new history entry', async () => {
    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });
    await waitForLoad(result);

    await act(async () => {
      result.current.actions.snapshotHistory();
    });

    expect(result.current.history).toHaveLength(1);
  });

  // --- Category Tests ---

  it('adds a new category', async () => {
    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });
    await waitForLoad(result);

    await act(async () => {
      await result.current.actions.addCategory({ id: 'cat-new', name: 'New Cat', effect: 'NEGATIVE' as any });
    });

    expect(result.current.categories).toContainEqual(expect.objectContaining({ id: 'cat-new', name: 'New Cat' }));
  });

  it('updates an existing category', async () => {
    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });
    await waitForLoad(result);

    // Default categories include 'debt'
    await act(async () => {
      await result.current.actions.updateCategory({ id: 'debt', name: 'Debt Updated', effect: 'NEGATIVE' as any });
    });

    const updatedCat = result.current.categories.find(c => c.id === 'debt');
    expect(updatedCat?.name).toBe('Debt Updated');
  });

  it('deletes a category', async () => {
    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });
    await waitForLoad(result);

    await act(async () => {
      await result.current.actions.deleteCategory('debt');
    });

    const deletedCat = result.current.categories.find(c => c.id === 'debt');
    expect(deletedCat).toBeUndefined();
  });

  it('reorders categories', async () => {
    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });
    await waitForLoad(result);

    await act(async () => {
      const reversed = [...result.current.categories].reverse();
      await result.current.actions.reorderCategories(reversed);
    });

    // The order should be reflected and the save function should have been called
    expect(mockSaveCategories).toHaveBeenCalled();
  });

  it('auto-seeds unique categories if the list is empty', async () => {
    mockGetCategories.mockResolvedValueOnce([]); // Start empty
    mockGetCategories.mockResolvedValue(DEFAULT_CATEGORIES); // Second load should be success
    
    const { result } = renderHook(() => useFinanceData(mockRepo), { wrapper });
    
    // Internal seeding happens in an effect, so we wait
    await waitForLoad(result);

    // mockSaveCategories should have been called with the seeded data
    expect(mockSaveCategories).toHaveBeenCalled();
    // The first argument to the call should be an array of length 5 (DEFAULT_CATEGORIES length)
    expect(mockSaveCategories.mock.calls[0][0]).toHaveLength(5);
    // Each category should have a UUID-like id (mocked as 'uuid-test')
    expect(mockSaveCategories.mock.calls[0][0][0].id).toBe('uuid-test');
  });
});
