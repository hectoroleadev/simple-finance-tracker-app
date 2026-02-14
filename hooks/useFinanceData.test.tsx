
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFinanceData } from './useFinanceData';
import { CategoryType, FinanceItem } from '../types';
import { LanguageProvider } from '../context/LanguageContext';

// Mock the adapter to isolate hook testing
const mockGetItems = vi.fn();
const mockSaveItems = vi.fn();
const mockGetHistory = vi.fn();
const mockSaveHistory = vi.fn();

vi.mock('../infrastructure/LocalStorageAdapter', () => {
  return {
    LocalStorageAdapter: vi.fn().mockImplementation(() => ({
      getItems: mockGetItems,
      saveItems: mockSaveItems,
      getHistory: mockGetHistory,
      saveHistory: mockSaveHistory,
    }))
  };
});

// Mock constants or crypto
beforeEach(() => {
  vi.clearAllMocks();
  // Default mocks
  mockGetItems.mockReturnValue([]);
  mockGetHistory.mockReturnValue([]);
  
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: () => 'uuid-test' }
  });
  
  // Mock window.confirm
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

// Wrapper to provide LanguageContext
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('useFinanceData Hook', () => {
  it('initializes state by loading data from repository', () => {
    const initialItems: FinanceItem[] = [
      { id: '1', name: 'Test', amount: 100, category: CategoryType.DEBT }
    ];
    mockGetItems.mockReturnValue(initialItems);

    const { result } = renderHook(() => useFinanceData(), { wrapper });

    expect(result.current.items).toEqual(initialItems);
    expect(mockGetItems).toHaveBeenCalled();
  });

  it('adds a new item correctly', () => {
    const { result } = renderHook(() => useFinanceData(), { wrapper });

    act(() => {
      result.current.actions.addItem(CategoryType.INVESTMENTS);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].category).toBe(CategoryType.INVESTMENTS);
    expect(result.current.items[0].name).toBe('New Item');
  });

  it('updates an existing item and recalculates totals', () => {
    const initialItems: FinanceItem[] = [
      { id: 'uuid-test', name: 'Original', amount: 100, category: CategoryType.DEBT }
    ];
    mockGetItems.mockReturnValue(initialItems);

    const { result } = renderHook(() => useFinanceData(), { wrapper });

    expect(result.current.totals.debt).toBe(100);

    act(() => {
      result.current.actions.updateItem('uuid-test', 'Edited', 200);
    });

    expect(result.current.items[0].amount).toBe(200);
    expect(result.current.items[0].name).toBe('Edited');
    expect(result.current.totals.debt).toBe(200); // Verify auto recalculation
  });

  it('deletes an item', () => {
    const initialItems: FinanceItem[] = [
      { id: '1', name: 'Delete Me', amount: 100, category: CategoryType.DEBT }
    ];
    mockGetItems.mockReturnValue(initialItems);

    const { result } = renderHook(() => useFinanceData(), { wrapper });

    act(() => {
      result.current.actions.deleteItem('1');
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('persists changes to repository when state changes', () => {
    const { result } = renderHook(() => useFinanceData(), { wrapper });

    act(() => {
      result.current.actions.addItem(CategoryType.RETIREMENT);
    });

    // useEffect should trigger saveItems
    expect(mockSaveItems).toHaveBeenCalled();
  });

  it('clears history if user confirms', () => {
     // Mock window.confirm is true in beforeEach
    const { result } = renderHook(() => useFinanceData(), { wrapper });
    
    act(() => {
      result.current.actions.clearHistory();
    });

    expect(result.current.history).toEqual([]);
    expect(mockSaveHistory).toHaveBeenCalledWith([]);
  });
});
