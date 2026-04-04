import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FinanceItem, HistoryEntry, Category, FinanceTotals } from '../types';
import { FinanceRepository } from '../domain/ports';
import { FinanceService } from '../domain/finance.service';
import { queryKeys } from '../hooks/queryKeys';

// Narrow mutation interfaces: only the methods useFinanceActions needs
interface MutationWithMutate<TVar> { mutate: (v: TVar) => void; }
interface MutationWithMutateAsync<TVar> { mutateAsync: (v: TVar) => Promise<void>; }

interface UseFinanceActionsParams {
  repository: FinanceRepository;
  isLoggedIn: boolean;
  viewAs: string | null;
  userId: string | null;
  items: FinanceItem[];
  categories: Category[];
  totals: FinanceTotals;
  saveItemsMutation: MutationWithMutate<FinanceItem[]>;
  deleteItemMutation: MutationWithMutate<string>;
  saveHistoryMutation: MutationWithMutate<HistoryEntry[]>;
  saveCategoriesMutation: MutationWithMutateAsync<Category[]>;
  deleteHistoryItemMutation: MutationWithMutate<string>;
  inviteUserMutation: MutationWithMutateAsync<string>;
  revokeShareMutation: MutationWithMutateAsync<string>;
}

/**
 * Application layer — use cases / business actions.
 * Delegates pure business logic to FinanceService (domain layer).
 * Delegates persistence to mutation objects from useFinanceQueries.
 * No direct dependency on infrastructure adapters.
 */
export const useFinanceActions = ({
  repository,
  isLoggedIn,
  viewAs,
  userId,
  items,
  categories,
  totals,
  saveItemsMutation,
  deleteItemMutation,
  saveHistoryMutation,
  saveCategoriesMutation,
  deleteHistoryItemMutation,
  inviteUserMutation,
  revokeShareMutation,
}: UseFinanceActionsParams) => {
  const queryClient = useQueryClient();

  return useMemo(() => ({
    updateItem: (id: string, name: string, amount: number) => {
      const current = queryClient.getQueryData<FinanceItem[]>(queryKeys.items(isLoggedIn, viewAs, userId)) || [];
      saveItemsMutation.mutate(FinanceService.updateItem(current, id, name, amount));
    },

    deleteItem: (id: string) => {
      deleteItemMutation.mutate(id);
    },

    addItem: (categoryId: string): FinanceItem => {
      const current = queryClient.getQueryData<FinanceItem[]>(queryKeys.items(isLoggedIn, viewAs, userId)) || [];
      const { items: newItems, newItem } = FinanceService.addItem(current, categoryId);
      saveItemsMutation.mutate(newItems);
      return newItem;
    },

    snapshotHistory: (): boolean => {
      const current = queryClient.getQueryData<HistoryEntry[]>(queryKeys.history(isLoggedIn, viewAs, userId)) || [];
      saveHistoryMutation.mutate(FinanceService.createSnapshot(totals, current));
      return true;
    },

    deleteHistoryItem: (id: string) => {
      deleteHistoryItemMutation.mutate(id);
    },

    getItemHistory: (id: string) =>
      queryClient.fetchQuery({
        queryKey: queryKeys.itemHistory(id),
        queryFn: () => repository.getItemHistory(id),
        staleTime: 1000 * 60,
      }),

    addCategory: async (category: Category): Promise<void> => {
      await saveCategoriesMutation.mutateAsync(FinanceService.addCategory(categories, items, category));
    },

    updateCategory: async (category: Category): Promise<void> => {
      await saveCategoriesMutation.mutateAsync(FinanceService.updateCategory(categories, category));
    },

    deleteCategory: async (id: string): Promise<void> => {
      await saveCategoriesMutation.mutateAsync(FinanceService.removeCategory(categories, id));
    },

    reorderCategories: async (reordered: Category[]): Promise<void> => {
      await saveCategoriesMutation.mutateAsync(FinanceService.reorderCategories(reordered));
    },

    inviteUser: async (sharedWithId: string): Promise<void> => {
      await inviteUserMutation.mutateAsync(sharedWithId);
    },

    revokeShare: async (sharedWithId: string): Promise<void> => {
      await revokeShareMutation.mutateAsync(sharedWithId);
    },
  }), [
    queryClient, isLoggedIn, viewAs, userId, repository, items, categories, totals,
    saveItemsMutation, deleteItemMutation, saveHistoryMutation,
    saveCategoriesMutation, deleteHistoryItemMutation,
    inviteUserMutation, revokeShareMutation
  ]);
};
