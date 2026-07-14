import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, STALE_TIMES } from '../lib/queryClient';
import type { Category } from '../store/billing.store';

/**
 * Fetches all active categories from the backend.
 * Cached for 10 minutes — categories rarely change during a shift.
 */
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: QUERY_KEYS.categories,
    staleTime: STALE_TIMES.categories,
    queryFn: async () => {
      const response = await fetch('/api/categories?status=ACTIVE');
      if (!response.ok) throw new Error(`Categories fetch failed: ${response.status}`);
      const json = await response.json();
      return json.data ?? json;
    },
    placeholderData: [],
  });
};
