
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFinanceData } from './useFinanceData';
import { FinanceItem, DEFAULT_CATEGORIES } from '../types';
import { LanguageProvider } from '../context/LanguageContext';

// Mock the adapter to isolate hook testing
const mockGetItems = vi.fn();
const mockSaveItems = vi.fn();
const mockGetHistory = vi.fn();
const mockSaveHistory = vi.fn();
const mockGetCategories = vi.fn().mockResolvedValue(DEFAULT_CATEGORIES);
const mockSaveCategories = vi.fn();

vi.mock('../infrastructure/LocalStorageAdapter', () => {
  return {
    LocalStorageAdapter: vi.fn().mockImplementation(() => ({
      getItems: mockGetItems,
      saveItems: mockSaveItems,
      getHistory: mockGetHistory,
      saveHistory: mockSaveHistory,
      getCategories: mockGetCategories,
      saveCategories: mockSaveCategories,
      deleteItem: vi.fn().mockResolvedValue(true),
      deleteHistoryItem: vi.fn().mockResolvedValue(true),
    }))
  };
});

// Mock Worker
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  postMessage = vi.fn((data: any) => {
    // Simulate worker responses
    if (data.type === 'CALCULATE_TOTALS') {
      setTimeout(() => {
        this.onmessage?.({ data: { type: 'TOTALS_CALCULATED', payload: { income: 1000, expenses: 0, balance: 1000 } } } as MessageEvent);
      }, 0);
    }
  });
  terminate = vi.fn();
}

// @ts-ignore
global.Worker = MockWorker;

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
});

// Wrapper to provide LanguageContext
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('useFinanceData Hook', () => {
  it('initializes state by loading data from repository', async () => {
    const initialItems: FinanceItem[] = [
      { id: '1', name: 'Test', amount: 100, category: 'debt' }
    ];
    mockGetItems.mockResolvedValue(initialItems);

    const { result } = renderHook(() => useFinanceData(), { wrapper });

    // Wait for internal loading effect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockGetItems).toHaveBeenCalled();
  });

  it('adds a new item correctly', async () => {
    const { result } = renderHook(() => useFinanceData(), { wrapper });

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

    const { result } = renderHook(() => useFinanceData(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0)); // wait for load
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

    const { result } = renderHook(() => useFinanceData(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0)); // wait for load
      result.current.actions.deleteItem('1');
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('snapshotHistory creates a new history entry', async () => {
    const { result } = renderHook(() => useFinanceData(), { wrapper });

    await act(async () => {
      result.current.actions.snapshotHistory();
    });

    expect(result.current.history).toHaveLength(1);
  });
});
