import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { FinanceItem, HistoryEntry, Category, ShareInvite, DEFAULT_CATEGORIES } from '../types';
import { FinanceRepository } from '../domain/ports';
import { queryKeys } from '../hooks/queryKeys';

const STABLE_EMPTY_ARRAY: never[] = [];

interface UseFinanceQueriesParams {
  repository: FinanceRepository;
  isLoggedIn: boolean;
  viewAs: string | null;
  onMutationError?: (message: string) => void;
}

/**
 * Application layer — all TanStack Query hooks (reads + writes).
 * Knows about the port (FinanceRepository) and query keys,
 * but has no direct dependency on infrastructure adapters.
 */
export const useFinanceQueries = ({
  repository,
  isLoggedIn,
  viewAs,
  onMutationError,
}: UseFinanceQueriesParams) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.username || null;

  // ─── Queries ────────────────────────────────────────────────────────────────

  const {
    data: items = STABLE_EMPTY_ARRAY as FinanceItem[],
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: queryKeys.items(isLoggedIn, viewAs, userId),
    queryFn: async () => {
      const fetched = await repository.getItems(viewAs || undefined);
      return fetched.map((item) => ({ ...item, amount: Number(item.amount) || 0 }));
    },
    enabled: isLoggedIn,
  });

  const {
    data: rawCategories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: queryKeys.categories(isLoggedIn, viewAs, userId),
    queryFn: () => repository.getCategories(viewAs || undefined),
    enabled: isLoggedIn,
  });

  const categories = useMemo(
    () =>
      rawCategories
        .map((cat, idx) => ({ ...cat, order: cat.order ?? idx }))
        .sort((a, b) => a.order! - b.order!),
    [rawCategories]
  );

  const {
    data: history = STABLE_EMPTY_ARRAY as HistoryEntry[],
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: queryKeys.history(isLoggedIn, viewAs, userId),
    queryFn: async () => {
      const fetched = await repository.getHistory(viewAs || undefined);
      return fetched
        .map((entry) => ({
          ...entry,
          debt: Number(entry.debt) || 0,
          savings: Number(entry.savings) || 0,
          balance: Number(entry.balance) || 0,
          retirement: Number(entry.retirement) || 0,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: isLoggedIn,
  });

  const { data: shares = STABLE_EMPTY_ARRAY as ShareInvite[] } = useQuery({
    queryKey: queryKeys.shares(isLoggedIn, userId),
    queryFn: () => repository.getMyShares(),
    enabled: isLoggedIn,
  });

  const { data: sharedWithMe = STABLE_EMPTY_ARRAY as ShareInvite[] } = useQuery({
    queryKey: queryKeys.sharedWithMe(isLoggedIn, userId),
    queryFn: () => repository.getSharedWithMe(),
    enabled: isLoggedIn,
  });

  // ─── Mutations ───────────────────────────────────────────────────────────────

  const saveItemsMutation = useMutation({
    mutationFn: (newItems: FinanceItem[]) => {
      if (viewAs) throw new Error('Cannot save items in read-only shared view');
      return repository.saveItems(newItems);
    },
    onMutate: async (newItems) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.items(isLoggedIn, viewAs, userId) });
      const previousItems = queryClient.getQueryData<FinanceItem[]>(
        queryKeys.items(isLoggedIn, viewAs, userId)
      );
      queryClient.setQueryData(queryKeys.items(isLoggedIn, viewAs, userId), newItems);
      return { previousItems };
    },
    onError: (err: any, _newItems: any, context: any) => {
      console.error('Failed to save items', err);
      onMutationError?.('Could not save changes. Please try again.');
      if (context?.previousItems)
        queryClient.setQueryData(
          queryKeys.items(isLoggedIn, viewAs, userId),
          context.previousItems
        );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items(isLoggedIn, viewAs, userId) });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => {
      if (viewAs) throw new Error('Cannot delete items in read-only shared view');
      return repository.deleteItem(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.items(isLoggedIn, viewAs, userId) });
      const previousItems = queryClient.getQueryData<FinanceItem[]>(
        queryKeys.items(isLoggedIn, viewAs, userId)
      );
      if (previousItems)
        queryClient.setQueryData(
          queryKeys.items(isLoggedIn, viewAs, userId),
          previousItems.filter((i) => i.id !== id)
        );
      return { previousItems };
    },
    onError: (err: any, _id: any, context: any) => {
      console.error('Failed to delete item', err);
      onMutationError?.('Could not delete item. Please try again.');
      if (context?.previousItems)
        queryClient.setQueryData(
          queryKeys.items(isLoggedIn, viewAs, userId),
          context.previousItems
        );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.items(isLoggedIn, viewAs, userId) }),
  });

  const saveHistoryMutation = useMutation({
    mutationFn: (historyEntries: HistoryEntry[]) => {
      if (viewAs) throw new Error('Cannot save history in read-only shared view');
      return repository.saveHistory(historyEntries);
    },
    onMutate: async (newHistory) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.history(isLoggedIn, viewAs, userId) });
      const previousHistory = queryClient.getQueryData<HistoryEntry[]>(
        queryKeys.history(isLoggedIn, viewAs, userId)
      );
      queryClient.setQueryData(queryKeys.history(isLoggedIn, viewAs, userId), newHistory);
      return { previousHistory };
    },
    onError: (err: any, _newHistory: any, context: any) => {
      console.error('Failed to save history', err);
      onMutationError?.('Could not save snapshot. Please try again.');
      if (context?.previousHistory)
        queryClient.setQueryData(
          queryKeys.history(isLoggedIn, viewAs, userId),
          context.previousHistory
        );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.history(isLoggedIn, viewAs, userId) }),
  });

  const saveCategoriesMutation = useMutation({
    mutationFn: (cats: Category[]) => {
      if (viewAs) throw new Error('Cannot save categories in read-only shared view');
      return repository.saveCategories(cats);
    },
    onMutate: async (newCats) => {
      if (import.meta.env.DEV) console.log('[useFinanceQueries] Mutating categories:', newCats);
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories(isLoggedIn, viewAs, userId),
      });
      const prev = queryClient.getQueryData<Category[]>(
        queryKeys.categories(isLoggedIn, viewAs, userId)
      );
      queryClient.setQueryData(queryKeys.categories(isLoggedIn, viewAs, userId), newCats);
      return { prev };
    },
    onError: (err: any, _newCats: any, context: any) => {
      console.error('Failed to save categories', err);
      onMutationError?.('Could not save categories. Please try again.');
      if (context?.prev)
        queryClient.setQueryData(queryKeys.categories(isLoggedIn, viewAs, userId), context.prev);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.categories(isLoggedIn, viewAs, userId) }),
  });

  const deleteHistoryItemMutation = useMutation({
    mutationFn: (id: string) => {
      if (viewAs) throw new Error('Cannot delete history items in read-only shared view');
      return repository.deleteHistoryItem(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.history(isLoggedIn, viewAs, userId) });
      const previousHistory = queryClient.getQueryData<HistoryEntry[]>(
        queryKeys.history(isLoggedIn, viewAs, userId)
      );
      if (previousHistory)
        queryClient.setQueryData(
          queryKeys.history(isLoggedIn, viewAs, userId),
          previousHistory.filter((i) => i.id !== id)
        );
      return { previousHistory };
    },
    onError: (err: any, _id: any, context: any) => {
      console.error('Failed to delete history item', err);
      onMutationError?.('Could not delete history entry. Please try again.');
      if (context?.previousHistory)
        queryClient.setQueryData(
          queryKeys.history(isLoggedIn, viewAs, userId),
          context.previousHistory
        );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.history(isLoggedIn, viewAs, userId) }),
  });

  const inviteUserMutation = useMutation({
    mutationFn: (sharedWithId: string) => repository.createShare(sharedWithId),
    onError: (err: any) => {
      console.error('Failed to invite user', err);
      onMutationError?.('Could not invite user. Please check the username and try again.');
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.shares(isLoggedIn, userId) }),
  });

  const revokeShareMutation = useMutation({
    mutationFn: (sharedWithId: string) => repository.deleteShare(sharedWithId),
    onError: (err: any) => {
      console.error('Failed to revoke share', err);
      onMutationError?.('Could not revoke access. Please try again.');
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.shares(isLoggedIn, userId) }),
  });

  // ─── Derived State ───────────────────────────────────────────────────────────

  const loading = (isLoadingItems || isLoadingHistory || isLoadingCategories) && isLoggedIn;
  const errorObj = itemsError || historyError || categoriesError;

  return {
    // Read data
    items,
    categories,
    history,
    shares,
    sharedWithMe,
    loading,
    errorObj,
    // Mutations (exposed so useFinanceActions can delegate writes)
    saveItemsMutation,
    deleteItemMutation,
    saveHistoryMutation,
    saveCategoriesMutation,
    deleteHistoryItemMutation,
    inviteUserMutation,
    revokeShareMutation,
  };
};
