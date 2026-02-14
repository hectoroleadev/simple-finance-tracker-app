
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { INITIAL_ITEMS } from '../constants';
import { FinanceItem, CategoryType } from '../types';

describe('LocalStorageAdapter Infrastructure', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial items if localStorage is empty', () => {
    const items = adapter.getItems();
    expect(localStorage.getItem).toHaveBeenCalledWith('finance_items_v2');
    expect(items).toEqual(INITIAL_ITEMS);
  });

  it('returns saved items if they exist', () => {
    const mockItems: FinanceItem[] = [{ id: '1', name: 'Test', amount: 100, category: CategoryType.DEBT }];
    localStorage.setItem('finance_items_v2', JSON.stringify(mockItems));
    
    const items = adapter.getItems();
    expect(items).toEqual(mockItems);
  });

  it('saves items correctly to localStorage', () => {
    const mockItems: FinanceItem[] = [{ id: '1', name: 'Test Save', amount: 500, category: CategoryType.INVESTMENTS }];
    adapter.saveItems(mockItems);
    
    expect(localStorage.setItem).toHaveBeenCalledWith('finance_items_v2', JSON.stringify(mockItems));
  });

  it('handles JSON parsing errors by returning initial values', () => {
    localStorage.setItem('finance_items_v2', '{ invalid json }');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const items = adapter.getItems();
    expect(items).toEqual(INITIAL_ITEMS);
    
    consoleSpy.mockRestore();
  });
});
