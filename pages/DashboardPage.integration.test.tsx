
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';
import { FinanceContext } from '../hooks/useFinanceData';
import { LanguageProvider } from '../context/LanguageContext';
import { DEFAULT_CATEGORIES } from '../types';

// Mock context values
const mockTotals = {
    income: 6500,
    expenses: 200,
    balance: 6300
};

const mockActions = {
    addItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    snapshotHistory: vi.fn(),
    addCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
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
    actions: mockActions,
    onSnapshot: vi.fn()
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

        // Check if balance and income are visible (formatted)
        expect(screen.getByText(/6,300/)).toBeDefined();
        expect(screen.getByText(/6,500/)).toBeDefined();
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

        const snapshotButton = screen.getByText(/Guardar estado actual/i) || screen.getByText(/Snapshot/i);
        fireEvent.click(snapshotButton);

        expect(mockActions.snapshotHistory).toHaveBeenCalled();
    });
});
