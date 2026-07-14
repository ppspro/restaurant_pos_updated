import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient configured for POS billing performance.
 *
 * Stale time strategy:
 * - Menu items:  5 min  – changes occasionally (price edits, availability toggles)
 * - Categories:  10 min – changes rarely
 * - Settings:    30 min – changes almost never during a shift
 *
 * GC time is set to 2× stale time to keep cached data available for offline reads.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 minutes default
      gcTime: 10 * 60 * 1000,         // 10 minutes garbage collection
      retry: 2,                        // retry twice on network errors
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: false,     // POS does not benefit from focus refetch
      refetchOnReconnect: true,        // re-fetch when network restores
    },
    mutations: {
      retry: 0, // never retry mutations automatically
    },
  },
});

// Per-query key stale time overrides (applied in individual hooks)
export const STALE_TIMES = {
  menuItems: 5 * 60 * 1000,   // 5 min
  categories: 10 * 60 * 1000, // 10 min
  settings: 30 * 60 * 1000,   // 30 min
} as const;

export const QUERY_KEYS = {
  menuItems: ['menu', 'items'] as const,
  categories: ['categories'] as const,
  settings: ['settings', 'restaurant'] as const,
} as const;
