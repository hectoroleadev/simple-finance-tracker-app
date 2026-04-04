
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';
import { FinanceContext } from '../context/FinanceContext';
import { LanguageProvider } from '../context/LanguageContext';
import { DEFAULT_CATEGORIES } from '../types';

// Mock context values
const mockTotals = {
    income: 6500,
    expenses: 200,
    balance: 6300,
    informative: 1500
};

const mockActions = {
    addItem: vi.fn().mockReturnValue({ id: 'new-id', name: 'New Item', amount: 0, category: 'debt' }),
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
    actions: mockActions
};

const renderWithContext = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            <FinanceContext.Provider value={mockContextValue}>
                {ui}
            </FinanceContext.Provider>
        </LanguageProvider>
    );
};

describe('DashboardPage Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders stats cards with correct totals', () => {
        renderWithContext(<DashboardPage />);

        // Check if balance, income and retirement are visible (formatted)
        // Use getAllByText and check that at least one is present
        expect(screen.getAllByText(/6,300/)[0]).toBeDefined();
        expect(screen.getAllByText(/6,500/)[0]).toBeDefined();
        expect(screen.getAllByText(/1,500/)[0]).toBeDefined();
    });

    it('triggers addItem action when "+" button is clicked', () => {
        renderWithContext(<DashboardPage />);

        // Get all "add" buttons (plus icons)
        const addButtons = screen.getAllByRole('button');
        fireEvent.click(addButtons[0]);

        expect(mockActions.addItem).toHaveBeenCalled();
    });

    it('triggers snapshotHistory when "Save state" button is clicked', () => {
        renderWithContext(<DashboardPage />);

        // The button text is "Record Snapshot" or "Registrar Snapshot" depending on locale (default en here)
        const snapshotButton = screen.queryByText(/Record Snapshot/i) || screen.queryByText(/Registrar Snapshot/i);
        if (!snapshotButton) {
            throw new Error('Snapshot button not found');
        }
        fireEvent.click(snapshotButton);

        expect(mockActions.snapshotHistory).toHaveBeenCalled();
    });
});
