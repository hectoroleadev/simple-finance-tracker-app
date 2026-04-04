/**
 * Centralized TanStack Query key factory.
 * Using functions ensures keys are consistent across queries,
 * mutations (cancelQueries / setQueryData / invalidateQueries)
 * and test assertions.
 */
export const queryKeys = {
  items: (loggedIn: boolean, viewAs: string | null, userId: string | null) =>
    ['items', loggedIn, viewAs, userId] as const,

  history: (loggedIn: boolean, viewAs: string | null, userId: string | null) =>
    ['history', loggedIn, viewAs, userId] as const,

  categories: (loggedIn: boolean, viewAs: string | null, userId: string | null) =>
    ['categories', loggedIn, viewAs, userId] as const,

  shares: (loggedIn: boolean, userId: string | null) =>
    ['shares', loggedIn, userId] as const,

  sharedWithMe: (loggedIn: boolean, userId: string | null) =>
    ['sharedWithMe', loggedIn, userId] as const,

  itemHistory: (id: string) =>
    ['itemHistory', id] as const,
};
