import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, STALE_TIMES } from '../lib/queryClient';
import type { MenuItem } from '../store/billing.store';

/**
 * Fetches all available menu items from the backend.
 * Cached for 5 minutes — re-fetches automatically after stale time elapses.
 *
 * Falls back gracefully: if the API is unavailable (offline) the last
 * cached response is returned from the query cache without throwing.
 */
export const useMenuItems = () => {
  return useQuery<MenuItem[]>({
    queryKey: QUERY_KEYS.menuItems,
    staleTime: STALE_TIMES.menuItems,
    queryFn: async () => {
      const response = await fetch('/api/menu/items?isAvailable=true');
      if (!response.ok) throw new Error(`Menu fetch failed: ${response.status}`);
      const json = await response.json();
      // Backend returns { success: true, data: [...] }
      return json.data ?? json;
    },
    // If the API call fails, return empty array rather than crashing the UI
    placeholderData: [],
  });
};
