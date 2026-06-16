/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SnapshotConfirmDialog from './SnapshotConfirmDialog';
import { FinanceContext } from '../context/FinanceContext';
import { LanguageProvider } from '../context/LanguageContext';
import { DEFAULT_CATEGORIES } from '../types';

const mockTotals = {
  income: 6500,
  expenses: 200,
  balance: 6300,
  informative: 1500,
};

const mockActions = {
  addItem: vi.fn(),
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
  items: [],
  categories: DEFAULT_CATEGORIES,
  history: [],
  totals: mockTotals,
  chartData: [],
  loading: false,
  error: null,
  viewAs: null,
  isReadOnly: false,
  shares: [],
  sharedWithMe: [],
  actions: mockActions,
};

const renderDialog = (props: { isOpen: boolean; onClose: () => void }) =>
  render(
    <LanguageProvider>
      <FinanceContext.Provider value={mockContextValue}>
        <SnapshotConfirmDialog {...props} />
      </FinanceContext.Provider>
    </LanguageProvider>
  );

describe('SnapshotConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the value preview when open', () => {
    renderDialog({ isOpen: true, onClose: vi.fn() });
    expect(screen.getAllByText(/6,500/)[0]).toBeDefined();
    expect(screen.getAllByText(/6,300/)[0]).toBeDefined();
    expect(screen.getAllByText(/1,500/)[0]).toBeDefined();
  });

  it('triggers snapshotHistory and closes after confirming', () => {
    const onClose = vi.fn();
    renderDialog({ isOpen: true, onClose });

    const confirmButton = screen.queryByText(/^Save$/) || screen.queryByText(/^Guardar$/);
    if (!confirmButton) throw new Error('Confirm button not found');
    fireEvent.click(confirmButton);

    expect(mockActions.snapshotHistory).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not trigger snapshotHistory when cancelled', () => {
    const onClose = vi.fn();
    renderDialog({ isOpen: true, onClose });

    const cancelButton = screen.queryByText(/^Cancel$/) || screen.queryByText(/^Cancelar$/);
    if (!cancelButton) throw new Error('Cancel button not found');
    fireEvent.click(cancelButton);

    expect(mockActions.snapshotHistory).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
