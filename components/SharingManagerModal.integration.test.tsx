/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SharingManagerModal from './SharingManagerModal';
import { FinanceContext } from '../context/FinanceContext';
import { LanguageProvider } from '../context/LanguageContext';

const mockActions = {
  inviteUser: vi.fn().mockResolvedValue(undefined),
  revokeShare: vi.fn().mockResolvedValue(undefined),
} as any;

const renderWithContext = (ui: React.ReactElement) => {
  const mockContextValue = {
    items: [],
    categories: [],
    totals: { income: 0, expenses: 0, balance: 0, informative: 0 },
    history: [],
    chartData: [],
    loading: false,
    error: null,
    viewAs: null,
    isReadOnly: false,
    shares: [
      { ownerId: '1', sharedWithId: 'user-a', status: 'ACTIVE', permissions: 'READ', createdAt: '2025-01-01' }
    ],
    sharedWithMe: [],
    actions: mockActions
  };

  return render(
    <LanguageProvider>
      <FinanceContext.Provider value={mockContextValue as any}>
        {ui}
      </FinanceContext.Provider>
    </LanguageProvider>
  );
};

describe('SharingManagerModal Integration', () => {
  it('renders correctly and shows active shares', () => {
    renderWithContext(<SharingManagerModal isOpen={true} onClose={vi.fn()} />);
    
    // The sharedWithId user-a should be visible in the list
    expect(screen.getByText('user-a')).toBeDefined();
  });
});
