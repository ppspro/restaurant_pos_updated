import { useQuery } from '@tanstack/react-query';
import { AnalyticsApi } from '../lib/analytics.api';
import type { AnalyticsFilters, DateRange } from '../lib/analytics.api';

export type { AnalyticsFilters, DateRange };

const defaultQueryConfig = {
  staleTime: 60 * 1000 * 5, // 5 minutes fresh
  gcTime: 60 * 1000 * 10,   // 10 minutes garbage collection
  retry: 2,                 // Retry twice on failure
  refetchOnWindowFocus: false,
};

export const useAnalyticsSummary = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'summary', filters],
    queryFn: () => AnalyticsApi.getSummary(filters),
    ...defaultQueryConfig,
  });
};

export const useSalesMetrics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'sales', filters],
    queryFn: () => AnalyticsApi.getSalesMetrics(filters),
    ...defaultQueryConfig,
  });
};

export const useAnalyticsTrends = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'trends', filters],
    queryFn: () => AnalyticsApi.getAnalyticsTrends(filters),
    ...defaultQueryConfig,
  });
};

export const usePeakHours = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'peakHours', filters],
    queryFn: () => AnalyticsApi.getPeakHours(filters),
    ...defaultQueryConfig,
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['analytics', 'systemHealth'],
    queryFn: () => AnalyticsApi.getSystemHealth(),
    refetchInterval: 10000, // Background refresh every 10 seconds for real-time health
    staleTime: 5000,        // Stale quickly to ensure fresh status
    retry: 3,
  });
};

export const useOrderMetrics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'orders', filters],
    queryFn: () => AnalyticsApi.getOrderMetrics(filters),
    ...defaultQueryConfig,
  });
};

export const useMenuPerformance = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'menu', filters],
    queryFn: () => AnalyticsApi.getMenuPerformance(filters),
    ...defaultQueryConfig,
  });
};

export const useCashierAnalytics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'cashiers', filters],
    queryFn: () => AnalyticsApi.getCashierPerformance(filters),
    ...defaultQueryConfig,
  });
};

export const usePaymentAnalytics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'payments', filters],
    queryFn: () => AnalyticsApi.getPaymentMetrics(filters),
    ...defaultQueryConfig,
  });
};
