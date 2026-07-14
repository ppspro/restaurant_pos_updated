import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Printer, printerApi } from '../../../api/printer.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../ui/GlobalNotificationProvider';
import { Button } from '../../ui/button';
import { X, Save } from 'lucide-react';

const printerSchema = z.object({
  name: z.string().min(1, 'Printer Name is required'),
  type: z.enum(['Receipt Printer', 'Kitchen KOT Printer', 'Label Printer', 'Barcode Printer']),
  brand: z.string().optional(),
  model: z.string().optional(),
  connectionType: z.enum(['USB', 'Network', 'Bluetooth']),
  ipAddress: z.string().optional(),
  port: z.number().min(1).max(65535).optional(),
  paperWidth: z.enum(['58mm', '80mm']),
  location: z.enum(['Front Counter', 'Kitchen', 'Billing Counter', 'Packing Area']),
  terminalId: z.string().optional(),
  status: z.enum(['Online', 'Offline']),
  autoPrint: z.boolean().default(true),
  printReceipt: z.boolean().default(true),
  printKOT: z.boolean().default(true),
  printInvoice: z.boolean().default(false),
  notes: z.string().optional(),
}).refine(data => {
  if (data.connectionType === 'Network' && !data.ipAddress) return false;
  return true;
}, {
  message: 'IP Address is required for Network printers',
  path: ['ipAddress'],
}).refine(data => {
  if (data.connectionType === 'Network' && data.ipAddress) {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(data.ipAddress);
  }
  return true;
}, {
  message: 'Must be a valid IPv4 address',
  path: ['ipAddress'],
});

type PrinterFormValues = z.infer<typeof printerSchema>;

interface PrinterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  printer?: Printer | null;
}

export default function PrinterFormModal({ isOpen, onClose, printer }: PrinterFormModalProps) {
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<PrinterFormValues>({
    resolver: zodResolver(printerSchema) as any,
    defaultValues: {
      name: '',
      type: 'Receipt Printer',
      brand: '',
      model: '',
      connectionType: 'USB',
      ipAddress: '',
      port: 9100,
      paperWidth: '80mm',
      location: 'Front Counter',
      terminalId: '',
      status: 'Online',
      autoPrint: true,
      printReceipt: true,
      printKOT: true,
      printInvoice: false,
      notes: '',
    }
  });

  const connectionType = watch('connectionType');

  useEffect(() => {
    if (printer) {
      reset({
        name: printer.name,
        type: printer.type as any,
        brand: printer.brand || '',
        model: printer.model || '',
        connectionType: printer.connectionType as any,
        ipAddress: printer.ipAddress || '',
        port: printer.port || 9100,
        paperWidth: printer.paperWidth as any,
        location: printer.location as any,
        terminalId: printer.terminalId || '',
        status: printer.status as any,
        autoPrint: printer.autoPrint,
        printReceipt: printer.printReceipt,
        printKOT: printer.printKOT,
        printInvoice: printer.printInvoice,
        notes: printer.notes || '',
      });
    } else {
      reset({
        name: '',
        type: 'Receipt Printer',
        brand: '',
        model: '',
        connectionType: 'USB',
        ipAddress: '',
        port: 9100,
        paperWidth: '80mm',
        location: 'Front Counter',
        terminalId: '',
        status: 'Online',
        autoPrint: true,
        printReceipt: true,
        printKOT: true,
        printInvoice: false,
        notes: '',
      });
    }
  }, [printer, reset, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Printer>) => printerApi.createPrinter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      notify('success', 'Printer added successfully.');
      onClose();
    },
    onError: (error: any) => {
      notify('error', error.response?.data?.message || 'Failed to add printer');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Printer>) => printerApi.updatePrinter(printer!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      notify('success', 'Printer updated successfully.');
      onClose();
    },
    onError: (error: any) => {
      notify('error', error.response?.data?.message || 'Failed to update printer');
    }
  });

  const onSubmit = (data: PrinterFormValues) => {
    const payload = { ...data };
    if (payload.connectionType !== 'Network') {
      payload.ipAddress = undefined;
      payload.port = undefined;
    }
    
    if (printer) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100 dark:border-gray-800 my-8">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-800 sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {printer ? 'Edit Printer' : 'Add Printer'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Details */}
            <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b pb-2">
              Basic Details
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Printer Name *</label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Kitchen Main"
              />
              {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select {...register('type')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Receipt Printer">Receipt Printer</option>
                <option value="Kitchen KOT Printer">Kitchen KOT Printer</option>
                <option value="Label Printer">Label Printer</option>
                <option value="Barcode Printer">Barcode Printer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Brand</label>
              <input {...register('brand')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Epson" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Model</label>
              <input {...register('model')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. TM-T82" />
            </div>

            {/* Connection Details */}
            <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 border-b pb-2">
              Connection Settings
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Connection Type *</label>
              <select {...register('connectionType')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="USB">USB</option>
                <option value="Network">Network</option>
                <option value="Bluetooth">Bluetooth</option>
              </select>
            </div>

            {connectionType === 'Network' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">IP Address *</label>
                  <input {...register('ipAddress')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="192.168.1.100" />
                  {errors.ipAddress && <span className="text-red-500 text-xs mt-1 block">{errors.ipAddress.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Port</label>
                  <input type="number" {...register('port', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                  {errors.port && <span className="text-red-500 text-xs mt-1 block">{errors.port.message}</span>}
                </div>
              </>
            )}

            {/* Configuration */}
            <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 border-b pb-2">
              Configuration
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Paper Width</label>
              <select {...register('paperWidth')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <select {...register('location')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Front Counter">Front Counter</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Billing Counter">Billing Counter</option>
                <option value="Packing Area">Packing Area</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select {...register('status')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Print Options */}
            <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 border-b pb-2">
              Print Options
            </div>
            
            <div className="col-span-1 md:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('autoPrint')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Print</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('printReceipt')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Print Receipt</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('printKOT')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Print KOT</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('printInvoice')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Print Invoice</span>
              </label>
            </div>

            <div className="col-span-1 md:col-span-2 mt-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea {...register('notes')} rows={2} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Any additional details..." />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t dark:border-gray-800 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Printer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
