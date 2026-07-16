import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, STALE_TIMES } from '../lib/queryClient';
import { menuApi } from '../api/menu.api';
import type { MenuItem } from '../store/billing.store';

/**
 * Fetches all available menu items from the backend.
 * Cached for 5 minutes — re-fetches automatically after stale time elapses.
 *
 * Uses the shared interceptored axios client (auth token attached, 401 handled).
 * Falls back gracefully: if the API is unavailable (offline) the last
 * cached response is returned from the query cache without throwing.
 */
export const useMenuItems = () => {
  return useQuery<MenuItem[]>({
    queryKey: QUERY_KEYS.menuItems,
    staleTime: STALE_TIMES.menuItems,
    queryFn: async () => {
      const response = await menuApi.getMenuItems();
      // Backend returns { success: true, data: [...] }
      return response.data?.data ?? response.data ?? [];
    },
    // If the API call fails, return empty array rather than crashing the UI
    placeholderData: [],
  });
};
