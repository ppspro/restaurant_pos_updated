import { api } from './axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  status?: string;
  search?: string;
}

export interface PaginatedOrders {
  success: boolean;
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ordersApi = {
  getHistory: async (params: OrderFilterParams) => {
    const { data } = await api.get<PaginatedOrders>('/orders/history', { params });
    return data;
  },
  getDetails: async (id: string) => {
    const { data } = await api.get(`/orders/${id}`);
    return data.data;
  },
  cancelOrder: async ({ id, reason }: { id: string; reason: string }) => {
    const { data } = await api.post(`/orders/${id}/cancel`, { reason });
    return data;
  },
  reprintOrder: async ({ id, type }: { id: string; type: 'RECEIPT' | 'KOT' }) => {
    const { data } = await api.post(`/orders/${id}/reprint`, { type });
    return data;
  }
};

// Hooks
export const useOrderHistory = (params: OrderFilterParams) => {
  return useQuery({
    queryKey: ['orders', 'history', params],
    queryFn: () => ordersApi.getHistory(params),
    staleTime: 30000,
  });
};

export const useOrderDetails = (id: string, enabled = false) => {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => ordersApi.getDetails(id),
    enabled,
    staleTime: 60000,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
};

export const useReprintOrder = () => {
  return useMutation({
    mutationFn: ordersApi.reprintOrder,
  });
};
