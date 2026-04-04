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
}

/**
 * Application layer — all TanStack Query hooks (reads + writes).
 * Knows about the port (FinanceRepository) and query keys,
 * but has no direct dependency on infrastructure adapters.
 */
export const useFinanceQueries = ({ repository, isLoggedIn, viewAs }: UseFinanceQueriesParams) => {
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
      return fetched.map(item => ({ ...item, amount: Number(item.amount) || 0 }));
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

  const categories = useMemo(() =>
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
        .map(entry => ({
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
    mutationFn: (newItems: FinanceItem[]) => repository.saveItems(newItems, viewAs || undefined),
    onMutate: async (newItems) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.items(isLoggedIn, viewAs, userId) });
      const previousItems = queryClient.getQueryData<FinanceItem[]>(queryKeys.items(isLoggedIn, viewAs, userId));
      queryClient.setQueryData(queryKeys.items(isLoggedIn, viewAs, userId), newItems);
      return { previousItems };
    },
    onError: (err, _newItems, context: { previousItems: FinanceItem[] | undefined } | undefined) => {
      console.error('Failed to save items', err);
      if (context?.previousItems)
        queryClient.setQueryData(queryKeys.items(isLoggedIn, viewAs, userId), context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items(isLoggedIn, viewAs, userId) });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => repository.deleteItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.items(isLoggedIn, viewAs, userId) });
      const previousItems = queryClient.getQueryData<FinanceItem[]>(queryKeys.items(isLoggedIn, viewAs, userId));
      if (previousItems)
        queryClient.setQueryData(queryKeys.items(isLoggedIn, viewAs, userId), previousItems.filter(i => i.id !== id));
      return { previousItems };
    },
    onError: (err, _id, context: { previousItems: FinanceItem[] | undefined } | undefined) => {
      console.error('Failed to delete item', err);
      if (context?.previousItems)
        queryClient.setQueryData(queryKeys.items(isLoggedIn, viewAs, userId), context.previousItems);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.items(isLoggedIn, viewAs, userId) }),
  });

  const saveHistoryMutation = useMutation({
    mutationFn: (newHistory: HistoryEntry[]) => repository.saveHistory(newHistory, viewAs || undefined),
    onMutate: async (newHistory) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.history(isLoggedIn, viewAs, userId) });
      const previousHistory = queryClient.getQueryData<HistoryEntry[]>(queryKeys.history(isLoggedIn, viewAs, userId));
      queryClient.setQueryData(queryKeys.history(isLoggedIn, viewAs, userId), newHistory);
      return { previousHistory };
    },
    onError: (err, _newHistory, context: { previousHistory: HistoryEntry[] | undefined } | undefined) => {
      console.error('Failed to save history', err);
      if (context?.previousHistory)
        queryClient.setQueryData(queryKeys.history(isLoggedIn, viewAs, userId), context.previousHistory);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.history(isLoggedIn, viewAs, userId) }),
  });

  const saveCategoriesMutation = useMutation({
    mutationFn: (cats: Category[]) => repository.saveCategories(cats, viewAs || undefined),
    onMutate: async (newCats) => {
      if (import.meta.env.DEV) console.log('[useFinanceQueries] Mutating categories:', newCats);
      await queryClient.cancelQueries({ queryKey: queryKeys.categories(isLoggedIn, viewAs, userId) });
      const prev = queryClient.getQueryData<Category[]>(queryKeys.categories(isLoggedIn, viewAs, userId));
      queryClient.setQueryData(queryKeys.categories(isLoggedIn, viewAs, userId), newCats);
      return { prev };
    },
    onError: (err, newCats, context: { prev: Category[] | undefined } | undefined) => {
      console.error('Failed to save categories', err, newCats);
      if (context?.prev)
        queryClient.setQueryData(queryKeys.categories(isLoggedIn, viewAs, userId), context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories(isLoggedIn, viewAs, userId) }),
  });

  const deleteHistoryItemMutation = useMutation({
    mutationFn: (id: string) => repository.deleteHistoryItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.history(isLoggedIn, viewAs, userId) });
      const previousHistory = queryClient.getQueryData<HistoryEntry[]>(queryKeys.history(isLoggedIn, viewAs, userId));
      if (previousHistory)
        queryClient.setQueryData(queryKeys.history(isLoggedIn, viewAs, userId), previousHistory.filter(i => i.id !== id));
      return { previousHistory };
    },
    onError: (err, _id, context: { previousHistory: HistoryEntry[] | undefined } | undefined) => {
      console.error('Failed to delete history item', err);
      if (context?.previousHistory)
        queryClient.setQueryData(queryKeys.history(isLoggedIn, viewAs, userId), context.previousHistory);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.history(isLoggedIn, viewAs, userId) }),
  });

  const inviteUserMutation = useMutation({
    mutationFn: (sharedWithId: string) => repository.createShare(sharedWithId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.shares(isLoggedIn, userId) }),
  });

  const revokeShareMutation = useMutation({
    mutationFn: (sharedWithId: string) => repository.deleteShare(sharedWithId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.shares(isLoggedIn, userId) }),
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
