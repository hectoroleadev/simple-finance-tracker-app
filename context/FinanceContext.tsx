import { createContext, useContext } from 'react';
import { FinanceContextType } from '../types';

/**
 * Presentation layer — React context for finance data.
 *
 * Kept separate from the application hooks so that:
 * - Components only need to import from context/, not from hooks/
 * - The context definition is not coupled to the hook implementation
 */
export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinanceContext = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceContext must be used within a FinanceProvider (RootLayout)');
  }
  return context;
};
