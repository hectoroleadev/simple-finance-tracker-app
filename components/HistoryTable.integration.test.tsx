
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryTable from './HistoryTable';
import { CategoryType, HistoryEntry } from '../types';
import { LanguageProvider } from '../context/LanguageContext';

const mockHistory: HistoryEntry[] = [
    { id: '1', date: '2024-02-14T00:00:00Z', savings: 313013, debt: 10700, balance: 302313, retirement: 760610 },
    { id: '2', date: '2024-01-30T00:00:00Z', savings: 307482, debt: 20377, balance: 287105, retirement: 755994 },
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

        // Check for specific dates formatted (assuming ES locale default in the provider if not specified)
        // "14 de febrero" or "February 14" depending on locale
        expect(screen.getByText(/14/)).toBeDefined();
        expect(screen.getByText(/30/)).toBeDefined();
    });

    it('opens confirmation dialog when delete is clicked', () => {
        const onDelete = vi.fn();
        renderWithProvider(<HistoryTable history={mockHistory} onDelete={onDelete} />);

        // Find all delete buttons (trash icons)
        const deleteButtons = screen.getAllByRole('button');
        // The first few buttons are the trash icons
        fireEvent.click(deleteButtons[0]);

        // Check if dialog text appears
        expect(screen.getByText(/Confirmar borrado/i) || screen.getByText(/Confirm Delete/i)).toBeDefined();
    });

    it('calls onDelete when confirmed in dialog', () => {
        const onDelete = vi.fn();
        renderWithProvider(<HistoryTable history={mockHistory} onDelete={onDelete} />);

        const deleteButtons = screen.getAllByRole('button');
        fireEvent.click(deleteButtons[0]);

        // Click "Delete" in the dialog
        const confirmButton = screen.getByText(/Eliminar/i) || screen.getByText(/Delete/i);
        fireEvent.click(confirmButton);

        expect(onDelete).toHaveBeenCalledWith('1');
    });
});
