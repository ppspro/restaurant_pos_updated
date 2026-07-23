import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, STALE_TIMES } from '../lib/queryClient';
import { categoryApi } from '../api/category.api';
import type { Category } from '../store/billing.store';

/**
 * Fetches all active categories from the backend.
 * Cached for 10 minutes — categories rarely change during a shift.
 *
 * Uses the shared interceptored axios client (auth token attached, 401 handled).
 */
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: QUERY_KEYS.categories,
    staleTime: STALE_TIMES.categories,
    queryFn: async () => {
      const response = await categoryApi.getCategories();
      // Backend returns { success: true, data: [...] }
      return response.data?.data ?? response.data ?? [];
    },
    placeholderData: [],
  });
};
