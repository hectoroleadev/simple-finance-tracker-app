/**
 * Centralized TanStack Query key factory.
 * Using functions ensures keys are consistent across queries,
 * mutations (cancelQueries / setQueryData / invalidateQueries)
 * and test assertions.
 */
export const queryKeys = {
  items: (loggedIn: boolean, viewAs: string | null) =>
    ['items', loggedIn, viewAs] as const,

  history: (loggedIn: boolean, viewAs: string | null) =>
    ['history', loggedIn, viewAs] as const,

  categories: (loggedIn: boolean, viewAs: string | null) =>
    ['categories', loggedIn, viewAs] as const,

  shares: (loggedIn: boolean) =>
    ['shares', loggedIn] as const,

  sharedWithMe: (loggedIn: boolean) =>
    ['sharedWithMe', loggedIn] as const,

  itemHistory: (id: string) =>
    ['itemHistory', id] as const,
};
