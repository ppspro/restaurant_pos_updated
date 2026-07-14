import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  terminalId?: string;
}

export const reportsApi = {
  getSalesList: async (params: ReportQueryParams) => {
    const { data } = await api.get<PaginatedResponse<any>>('/reports/sales/list', { params });
    return data;
  },
  getOrdersList: async (params: ReportQueryParams) => {
    const { data } = await api.get<PaginatedResponse<any>>('/reports/orders/list', { params });
    return data;
  },
  getGstList: async (params: ReportQueryParams) => {
    const { data } = await api.get<PaginatedResponse<any>>('/reports/gst/list', { params });
    return data;
  },
  getMenuList: async (params: ReportQueryParams) => {
    const { data } = await api.get<PaginatedResponse<any>>('/reports/menu/list', { params });
    return data;
  },
  getShiftsList: async (params: ReportQueryParams) => {
    const { data } = await api.get<PaginatedResponse<any>>('/reports/shifts/list', { params });
    return data;
  },
  getAuditList: async (params: ReportQueryParams) => {
    const { data } = await api.get<PaginatedResponse<any>>('/reports/audit/list', { params });
    return data;
  },
  exportSales: async (params: ReportQueryParams & { format: 'csv' | 'xlsx' | 'pdf' }) => {
    // For exports, we generally want to trigger a download
    const response = await api.get('/reports/export/sales', {
      params,
      responseType: 'blob', // Important for file downloads
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Attempt to extract filename from header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `sales_report.${params.format}`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match && match.length === 2) filename = match[1];
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

// React Query Hooks
export const useSalesList = (params: ReportQueryParams) => {
  return useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: () => reportsApi.getSalesList(params),
    staleTime: 60000,
  });
};

export const useOrdersList = (params: ReportQueryParams) => {
  return useQuery({
    queryKey: ['reports', 'orders', params],
    queryFn: () => reportsApi.getOrdersList(params),
    staleTime: 60000,
  });
};

// ... More hooks can be defined similarly
