
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryTable from './CategoryTable';
import { LanguageProvider } from '../context/LanguageContext';
import { FinanceContext } from '../context/FinanceContext';
import { FinanceItem } from '../types';

const mockItems: FinanceItem[] = [
  { id: '1', name: 'Groceries', amount: 300, category: 'food' },
  { id: '2', name: 'Rent', amount: 1500, category: 'housing' }
];

const mockActions = {
  addItem: vi.fn().mockReturnValue({ id: 'new-id', name: '', amount: 0, category: 'cat-expenses' }),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  snapshotHistory: vi.fn(),
  addCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  reorderCategories: vi.fn(),
  deleteHistoryItem: vi.fn(),
  setViewAs: vi.fn(),
  inviteUser: vi.fn().mockResolvedValue(undefined),
  revokeShare: vi.fn().mockResolvedValue(undefined),
  getItemHistory: vi.fn().mockResolvedValue([]),
};

const mockContextValue = {
  items: mockItems,
  categories: [],
  history: [],
  totals: { income: 0, expenses: 1800, balance: -1800, informative: 0 },
  chartData: [],
  loading: false,
  error: null,
  viewAs: null,
  isReadOnly: false,
  shares: [],
  sharedWithMe: [],
  actions: mockActions
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <FinanceContext.Provider value={mockContextValue}>
        {ui}
      </FinanceContext.Provider>
    </LanguageProvider>
  );
};

describe('CategoryTable Integration', () => {
  it('renders items and total correctly', () => {
    renderWithProvider(
      <CategoryTable
        title="Expenses"
        categoryId="cat-expenses"
        items={mockItems}
        color="red"
        onUpdateItem={vi.fn()}
        onDeleteItem={vi.fn()}
        onAddItem={vi.fn()}
      />
    );

    expect(screen.getByText('Groceries')).toBeDefined();
    expect(screen.getByText('Rent')).toBeDefined();
    expect(screen.getByText(/1,800/)).toBeDefined(); // Total sum
  });

  it('triggers onAddItem when plus button is clicked', () => {
    const onAddItem = vi.fn().mockReturnValue({ id: 'new-id', name: '', amount: 0, category: 'cat-expenses' });
    renderWithProvider(
      <CategoryTable
        title="Expenses"
        categoryId="cat-expenses"
        items={mockItems}
        color="red"
        onUpdateItem={vi.fn()}
        onDeleteItem={vi.fn()}
        onAddItem={onAddItem}
      />
    );

    // Click the "+" button in the table header
    const addButtons = screen.getAllByRole('button');
    fireEvent.click(addButtons[0]);

    expect(onAddItem).toHaveBeenCalledWith('cat-expenses');
  });
});

