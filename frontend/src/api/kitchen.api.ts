import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const kitchenApi = {
  getQueue: async () => {
    const { data } = await api.get('/kitchen/queue');
    return data.data; // Return the actual queue array
  },
  
  updateStatus: async ({ id, status }: { id: string; status: string }) => {
    const { data } = await api.patch(`/kitchen/orders/${id}/status`, { status });
    return data;
  },

  getAnalytics: async () => {
    const { data } = await api.get('/kitchen/analytics');
    return data.data;
  }
};

// React Query Hooks

/**
 * Aggressive polling hook for the KDS live queue.
 * Refetches every 5 seconds.
 */
export const useKitchenQueue = () => {
  return useQuery({
    queryKey: ['kitchen', 'queue'],
    queryFn: kitchenApi.getQueue,
    refetchInterval: 5000, // Poll every 5 seconds for "real-time" feel
    staleTime: 2000,
  });
};

export const useUpdateKitchenStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: kitchenApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen', 'queue'] });
      // Optionally trigger sound notification here
    }
  });
};
