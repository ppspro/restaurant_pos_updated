import { api } from './axios';

export interface Printer {
  id: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  connectionType: string;
  ipAddress?: string;
  port?: number;
  paperWidth: string;
  location: string;
  terminalId?: string;
  status: string;
  autoPrint: boolean;
  printReceipt: boolean;
  printKOT: boolean;
  printInvoice: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const printerApi = {
  getPrinters: () => api.get('/printers'),
  getPrinterById: (id: string) => api.get(`/printers/${id}`),
  createPrinter: (data: Partial<Printer>) => api.post('/printers', data),
  updatePrinter: (id: string, data: Partial<Printer>) => api.put(`/printers/${id}`, data),
  deletePrinter: (id: string) => api.delete(`/printers/${id}`),
  testPrint: (id: string) => api.post(`/printers/${id}/test`),
};
