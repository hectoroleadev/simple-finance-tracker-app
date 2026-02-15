
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';
import { FinanceContext } from '../hooks/useFinanceData';
import { LanguageProvider } from '../context/LanguageContext';
import { CategoryType } from '../types';

// Mock context values
const mockTotals = {
    liquid: 1000,
    investments: 5000,
    pending: 500,
    debt: 200,
    retirement: 10000,
    savings: 6500,
    balance: 6300
};

const mockActions = {
    addItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    snapshotHistory: vi.fn(),
};

const mockContextValue = {
    items: [],
    history: [],
    totals: mockTotals,
    chartData: [],
    loading: false,
    error: null,
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

        // Check if balance and savings are visible (formatted)
        expect(screen.getByText(/6,300/)).toBeDefined();
        expect(screen.getByText(/6,500/)).toBeDefined();
    });

    it('triggers addItem action when "+" button is clicked', () => {
        renderWithContext(<DashboardPage />);

        // Get all "add" buttons (plus icons)
        const addButtons = screen.getAllByRole('button');
        // Usually the ones with plus icons. Let's filter by those that have plus icon or just click the first one if we can't distinguish easily in test
        // Better: Filter by those that are in a category section.
        fireEvent.click(addButtons[0]);

        expect(mockActions.addItem).toHaveBeenCalled();
    });

    it('triggers snapshotHistory when "Save state" button is clicked', () => {
        renderWithContext(<DashboardPage />);

        const snapshotButton = screen.getByText(/Guardar estado actual/i) || screen.getByText(/Save current state/i);
        fireEvent.click(snapshotButton);

        expect(mockActions.snapshotHistory).toHaveBeenCalled();
    });
});
