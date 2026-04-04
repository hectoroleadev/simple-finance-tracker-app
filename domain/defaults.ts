import { Category } from '../types';
import { BalanceEffect } from './balanceEffect';

/**
 * Domain defaults — seed data that belongs in the domain layer, not in types.ts.
 *
 * These categories are used to:
 * 1. Seed the UI when a user has no categories yet
 * 2. Ensure backward compatibility when items reference categories no longer stored
 *
 * Re-exported from types.ts for backward compatibility.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'investments',      name: 'Investments',      effect: BalanceEffect.POSITIVE,         color: 'green',  order: 0 },
  { id: 'liquid_cash',      name: 'Liquid Cash',      effect: BalanceEffect.POSITIVE,         color: 'blue',   order: 1 },
  { id: 'pending_payments', name: 'Pending Payments', effect: BalanceEffect.POSITIVE,         color: 'yellow', order: 2 },
  { id: 'debt',             name: 'Debt',             effect: BalanceEffect.NEGATIVE,         color: 'red',    order: 3 },
  { id: 'retirement',       name: 'Retirement',       effect: BalanceEffect.INFORMATIVE_STAT, color: 'purple', order: 4 },
];
