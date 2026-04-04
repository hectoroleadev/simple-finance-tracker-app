
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryTable from './HistoryTable';
import { Category, HistoryEntry } from '../types';
import { LanguageProvider } from '../context/LanguageContext';

const mockHistory: HistoryEntry[] = [
    { id: '1', date: '2024-02-14T12:00:00Z', savings: 313013, debt: 10700, balance: 302313, retirement: 760610 },
    { id: '2', date: '2024-01-30T12:00:00Z', savings: 307482, debt: 20377, balance: 287105, retirement: 755994 },
];

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('HistoryTable Integration', () => {
    it('renders history entries correctly', () => {
        renderWithProvider(<HistoryTable history={mockHistory} onDelete={() => { }} />);

        // The date is rendered both for mobile and desktop, so use getAllByText
        expect(screen.getAllByText(/14/)[0]).toBeDefined();
        expect(screen.getAllByText(/30/)[0]).toBeDefined();
    });

    it('opens confirmation dialog when delete is clicked', () => {
        const onDelete = vi.fn();
        renderWithProvider(<HistoryTable history={mockHistory} onDelete={onDelete} />);

        // Find delete buttons (trash icons)
        const deleteButtons = screen.getAllByRole('button');
        // Click the first one
        fireEvent.click(deleteButtons[0]);

        // Check if dialog text appears (using actual translation keys)
        // en: "Delete History Record" / es: "Eliminar registro histórico"
        expect(screen.getByText(/Delete History Record/i) || screen.getByText(/Eliminar registro histórico/i)).toBeDefined();
    });

    it('calls onDelete when confirmed in dialog', () => {
        const onDelete = vi.fn();
        renderWithProvider(<HistoryTable history={mockHistory} onDelete={onDelete} />);

        const deleteButtons = screen.getAllByRole('button');
        fireEvent.click(deleteButtons[0]);

        // Click "Delete" in the dialog
        const confirmButton = screen.queryByText(/^Delete$/i) || screen.queryByText(/^Eliminar$/i);
        if (!confirmButton) {
            throw new Error('Confirm button not found');
        }
        fireEvent.click(confirmButton);

        expect(onDelete).toHaveBeenCalledWith('1');
    });
});
