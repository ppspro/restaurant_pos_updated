import { api } from './axios';

export interface Printer {
  id: string;
  printerName: string;
  printerType: string;
  ipAddress?: string;
  port?: number;
  paperWidth: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Backend mounts printer routes at /api/v1/printing (not /printers)
export const printerApi = {
  getPrinters: () => api.get('/printing'),
  getPrinterById: (id: string) => api.get(`/printing/${id}`),
  createPrinter: (data: Partial<Printer>) => api.post('/printing', data),
  updatePrinter: (id: string, data: Partial<Printer>) => api.put(`/printing/${id}`, data),
  deletePrinter: (id: string) => api.delete(`/printing/${id}`),
  testPrint: (id: string) => api.post(`/printing/${id}/test`),
};
