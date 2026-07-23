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
  printerName: z.string().min(1, 'Printer Name is required'),
  printerType: z.enum(['Receipt Printer', 'Kitchen KOT Printer', 'Label Printer', 'Barcode Printer']),
  ipAddress: z.string().optional(),
  port: z.number().min(1).max(65535).optional(),
  paperWidth: z.enum(['58mm', '80mm']),
  location: z.enum(['Front Counter', 'Kitchen', 'Billing Counter', 'Packing Area']),
  status: z.enum(['ONLINE', 'OFFLINE']),
}).refine(data => {
  if (data.ipAddress) {
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

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PrinterFormValues>({
    resolver: zodResolver(printerSchema) as any,
    defaultValues: {
      printerName: '',
      printerType: 'Receipt Printer',
      ipAddress: '',
      port: 9100,
      paperWidth: '80mm',
      location: 'Front Counter',
      status: 'ONLINE',
    }
  });

  useEffect(() => {
    if (printer) {
      reset({
        printerName: printer.printerName,
        printerType: printer.printerType as any,
        ipAddress: printer.ipAddress || '',
        port: printer.port || 9100,
        paperWidth: printer.paperWidth as any,
        location: printer.location as any,
        status: printer.status as any,
      });
    } else {
      reset({
        printerName: '',
        printerType: 'Receipt Printer',
        ipAddress: '',
        port: 9100,
        paperWidth: '80mm',
        location: 'Front Counter',
        status: 'ONLINE',
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
                {...register('printerName')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Kitchen Main"
              />
              {errors.printerName && <span className="text-red-500 text-xs mt-1 block">{errors.printerName.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select {...register('printerType')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Receipt Printer">Receipt Printer</option>
                <option value="Kitchen KOT Printer">Kitchen KOT Printer</option>
                <option value="Label Printer">Label Printer</option>
                <option value="Barcode Printer">Barcode Printer</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 border-b pb-2">
              Connection Settings
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
              <input {...register('ipAddress')} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="192.168.1.100" />
              {errors.ipAddress && <span className="text-red-500 text-xs mt-1 block">{errors.ipAddress.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Port</label>
              <input type="number" {...register('port', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
              {errors.port && <span className="text-red-500 text-xs mt-1 block">{errors.port.message}</span>}
            </div>



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
                <option value="ONLINE">ONLINE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
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
