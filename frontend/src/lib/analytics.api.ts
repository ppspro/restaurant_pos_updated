import api from './api';

export type DateRange = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM';

export interface AnalyticsFilters {
  dateRange: DateRange;
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  terminalId?: string;
  paymentMethod?: string;
  categoryId?: string;
}

export const AnalyticsApi = {
  getSystemHealth: async () => {
    const { data } = await api.get('/analytics/system/health');
    return data.data;
  },

  getSummary: async (filters: AnalyticsFilters) => {
    const { data } = await api.get('/analytics/summary', { params: filters });
    return data.data;
  },

  getSalesMetrics: async (filters: AnalyticsFilters) => {
    const { data } = await api.get('/analytics/sales', { params: filters });
    return data.data;
  },

  getAnalyticsTrends: async (filters: AnalyticsFilters) => {
    const { data } = await api.get('/analytics/sales/trends', { params: filters });
    return data.data;
  },

  getPeakHours: async (filters: AnalyticsFilters) => {
    const { data } = await api.get('/analytics/orders/peak-hours', { params: filters });
    return data.data;
  },

  getOrderMetrics: async (filters: AnalyticsFilters) => {
    const { data } = await api.get('/analytics/orders/metrics', { params: filters });
    return data.data;
  },

  getMenuPerformance: async (filters: AnalyticsFilters) => {
    const { data } = await api.get('/analytics/menu/performance', { params: filters });
    return data.data;
  },

  getCashierPerformance: async (filters: AnalyticsFilters) => {
    const { data } = await api.get('/analytics/cashiers/performance', { params: filters });
    return data.data;
  },

  getPaymentMetrics: async (filters: AnalyticsFilters) => {
    const { data } = await api.get('/analytics/payments/metrics', { params: filters });
    return data.data;
  }
};
