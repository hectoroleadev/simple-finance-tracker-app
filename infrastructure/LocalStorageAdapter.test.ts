/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { INITIAL_ITEMS, INITIAL_HISTORY } from '../utils/constants';
import { BalanceEffect } from '../domain/balanceEffect';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    adapter = new LocalStorageAdapter();
  });

  // ── Items ──────────────────────────────────────────────────────────────────

  describe('getItems', () => {
    it('returns INITIAL_ITEMS when storage is empty', async () => {
      const items = await adapter.getItems();
      expect(items).toEqual(INITIAL_ITEMS);
    });

    it('returns parsed items from localStorage', async () => {
      const stored = [{ id: '1', name: 'Rent', amount: 1200, category: 'debt' }];
      localStorage.setItem('finance_items_v3', JSON.stringify(stored));
      const items = await adapter.getItems();
      expect(items).toEqual(stored);
    });

    it('returns INITIAL_ITEMS when stored JSON is corrupted', async () => {
      localStorage.setItem('finance_items_v3', '{invalid-json');
      const items = await adapter.getItems();
      expect(items).toEqual(INITIAL_ITEMS);
    });
  });

  describe('saveItems', () => {
    it('writes items to localStorage under the correct key', async () => {
      const items = [{ id: '1', name: 'Savings', amount: 500, category: 'savings' }];
      await adapter.saveItems(items);
      const raw = localStorage.getItem('finance_items_v3');
      expect(JSON.parse(raw!)).toEqual(items);
    });

    it('ignores the optional userId parameter', async () => {
      const items = [{ id: '1', name: 'Test', amount: 100, category: 'debt' }];
      await adapter.saveItems(items, 'user-123');
      expect(JSON.parse(localStorage.getItem('finance_items_v3')!)).toEqual(items);
    });
  });

  describe('deleteItem', () => {
    it('removes the item with the given id', async () => {
      const items = [
        { id: '1', name: 'A', amount: 100, category: 'debt' },
        { id: '2', name: 'B', amount: 200, category: 'savings' },
      ];
      localStorage.setItem('finance_items_v3', JSON.stringify(items));
      await adapter.deleteItem('1');
      const remaining = await adapter.getItems();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('2');
    });

    it('is a no-op when the id does not exist', async () => {
      const items = [{ id: '1', name: 'A', amount: 100, category: 'debt' }];
      localStorage.setItem('finance_items_v3', JSON.stringify(items));
      await adapter.deleteItem('nonexistent');
      const remaining = await adapter.getItems();
      expect(remaining).toHaveLength(1);
    });
  });

  describe('getItemHistory', () => {
    it('always returns an empty array (not tracked in LocalStorage)', async () => {
      expect(await adapter.getItemHistory('any-id')).toEqual([]);
    });
  });

  // ── History ────────────────────────────────────────────────────────────────

  describe('getHistory', () => {
    it('returns INITIAL_HISTORY when storage is empty', async () => {
      const history = await adapter.getHistory();
      expect(history).toEqual(INITIAL_HISTORY);
    });

    it('returns modern ISO-date entries as-is', async () => {
      const modern = [
        {
          id: '1',
          date: '2024-01-01T00:00:00.000Z',
          savings: 1000,
          debt: 0,
          balance: 1000,
          retirement: 0,
        },
      ];
      localStorage.setItem('finance_history_v3', JSON.stringify(modern));
      const history = await adapter.getHistory();
      expect(history[0].date).toBe('2024-01-01T00:00:00.000Z');
    });

    it('migrates legacy year/month entries to ISO date strings', async () => {
      const legacy = [
        {
          id: '1',
          year: 2023,
          month: 'January',
          savings: 1000,
          debt: 0,
          balance: 1000,
          retirement: 0,
        },
      ];
      localStorage.setItem('finance_history_v3', JSON.stringify(legacy));
      const history = await adapter.getHistory();
      expect(history[0].date).toBeDefined();
      expect(typeof history[0].date).toBe('string');
      // Legacy year/month fields should be stripped
      expect((history[0] as any).year).toBeUndefined();
      expect((history[0] as any).month).toBeUndefined();
    });

    it('returns INITIAL_HISTORY when stored JSON is corrupted', async () => {
      localStorage.setItem('finance_history_v3', '{bad-json');
      const history = await adapter.getHistory();
      expect(history).toEqual(INITIAL_HISTORY);
    });
  });

  describe('saveHistory', () => {
    it('writes history to localStorage', async () => {
      const entry = {
        id: '1',
        date: '2024-06-01T00:00:00.000Z',
        savings: 5000,
        debt: 1000,
        balance: 4000,
        retirement: 500,
      };
      await adapter.saveHistory([entry]);
      const raw = localStorage.getItem('finance_history_v3');
      expect(JSON.parse(raw!)).toHaveLength(1);
    });
  });

  describe('deleteHistoryItem', () => {
    it('removes the history entry with the given id', async () => {
      const entries = [
        {
          id: '1',
          date: '2024-01-01T00:00:00.000Z',
          savings: 1000,
          debt: 0,
          balance: 1000,
          retirement: 0,
        },
        {
          id: '2',
          date: '2024-02-01T00:00:00.000Z',
          savings: 2000,
          debt: 0,
          balance: 2000,
          retirement: 0,
        },
      ];
      localStorage.setItem('finance_history_v3', JSON.stringify(entries));
      await adapter.deleteHistoryItem('1');
      const remaining = await adapter.getHistory();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('2');
    });
  });

  // ── Categories ─────────────────────────────────────────────────────────────

  describe('getCategories', () => {
    it('returns an empty array when storage is empty', async () => {
      const categories = await adapter.getCategories();
      expect(categories).toEqual([]);
    });

    it('returns parsed categories from localStorage', async () => {
      const cats = [{ id: 'debt', name: 'Debt', effect: BalanceEffect.NEGATIVE, order: 0 }];
      localStorage.setItem('finance_categories_v1', JSON.stringify(cats));
      const categories = await adapter.getCategories();
      expect(categories).toEqual(cats);
    });
  });

  describe('saveCategories', () => {
    it('writes categories to localStorage', async () => {
      const cats = [{ id: 'savings', name: 'Savings', effect: BalanceEffect.POSITIVE, order: 0 }];
      await adapter.saveCategories(cats);
      const raw = localStorage.getItem('finance_categories_v1');
      expect(JSON.parse(raw!)).toEqual(cats);
    });
  });

  // ── Sharing stubs ──────────────────────────────────────────────────────────

  describe('sharing stubs', () => {
    it('getMyShares returns an empty array', async () => {
      expect(await adapter.getMyShares()).toEqual([]);
    });

    it('getSharedWithMe returns an empty array', async () => {
      expect(await adapter.getSharedWithMe()).toEqual([]);
    });

    it('createShare resolves without throwing', async () => {
      await expect(adapter.createShare('user-xyz')).resolves.toBeUndefined();
    });

    it('deleteShare resolves without throwing', async () => {
      await expect(adapter.deleteShare('user-xyz')).resolves.toBeUndefined();
    });
  });
});
