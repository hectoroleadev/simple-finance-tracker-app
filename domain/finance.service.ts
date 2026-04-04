import { FinanceItem, HistoryEntry, Category, FinanceTotals, DEFAULT_CATEGORIES } from '../types';
import { FinanceCalculator } from './finance.logic';

/**
 * Domain Service — pure business logic orchestration.
 *
 * No React, no TanStack Query, no framework dependencies.
 * All methods are pure functions: given the same inputs, produce the same output.
 * Fully testable in a plain Node.js/Vitest environment.
 */
export const FinanceService = {

  /** Returns a new items array with the specified item updated. */
  updateItem: (items: FinanceItem[], id: string, name: string, amount: number): FinanceItem[] =>
    items.map(item => item.id === id ? { ...item, name, amount } : item),

  /** Returns a new items array with the specified item removed. */
  removeItem: (items: FinanceItem[], id: string): FinanceItem[] =>
    items.filter(item => item.id !== id),

  /** Returns a new items array with a fresh item appended, plus the new item itself. */
  addItem: (items: FinanceItem[], categoryId: string): { items: FinanceItem[]; newItem: FinanceItem } => {
    const newItem: FinanceItem = {
      id: globalThis.crypto.randomUUID(),
      name: 'New Item',
      amount: 0,
      category: categoryId,
    };
    return { items: [...items, newItem], newItem };
  },

  /** Returns a new history array with a snapshot prepended. */
  createSnapshot: (totals: FinanceTotals, history: HistoryEntry[]): HistoryEntry[] => {
    const newEntry = FinanceCalculator.createSnapshot(totals);
    return [newEntry, ...history];
  },

  /** 
   * Returns a fresh set of default categories but with unique UUIDs 
   * to avoid clobbering other users in DynamoDB.
   */
  seedDefaultCategories: (): Category[] => {
    return DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      id: globalThis.crypto.randomUUID(),
    }));
  },

  /**
   * Returns a new categories array with a new category appended.
   */
  addCategory: (categories: Category[], _items: FinanceItem[], newCategory: Category): Category[] => {
    const nextBatch = [...categories];
    const maxOrder = nextBatch.reduce((max, c) => Math.max(max, c.order ?? 0), -1);
    const cat: Category = {
      ...newCategory,
      id: newCategory.id || (globalThis.crypto?.randomUUID?.() ?? Date.now().toString()),
      order: maxOrder + 1,
    };
    return [...nextBatch, cat];
  },

  /** Returns a new categories array with the specified category updated. */
  updateCategory: (categories: Category[], updated: Category): Category[] =>
    categories.map(c => c.id === updated.id ? updated : c),

  /** Returns a new categories array with the specified category removed. */
  removeCategory: (categories: Category[], id: string): Category[] =>
    categories.filter(c => c.id !== id),

  /** Returns a new categories array with sequential order values assigned. */
  reorderCategories: (categories: Category[]): Category[] =>
    categories.map((cat, idx) => ({ ...cat, order: idx })),
};
