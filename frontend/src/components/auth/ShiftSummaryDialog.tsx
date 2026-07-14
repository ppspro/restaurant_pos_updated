import React from 'react';
import { Button } from '../ui/button';
import { FileText, TrendingUp, AlertTriangle, Printer } from 'lucide-react';

interface ShiftSummaryData {
  shiftId: string;
  terminalCode: string;
  openingTime: string;
  closingTime: string | null;
  totalOrders: number;
  cancelledOrders: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  refunds: number;
  openingCash: number;
  expectedClosingCash: number;
  status: string;
}

interface ShiftSummaryDialogProps {
  isOpen: boolean;
  summary: ShiftSummaryData | null;
  actualCashEntered: number;
  difference: number;
  onPrintSummary: () => void;
  onClose: () => void;
}

export const ShiftSummaryDialog = ({
  isOpen,
  summary,
  actualCashEntered,
  difference,
  onPrintSummary,
  onClose,
}: ShiftSummaryDialogProps) => {
  if (!isOpen || !summary) return null;

  const totalSales = summary.cashSales + summary.upiSales + summary.cardSales;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl">
        <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Shift Reconciliation Report
          </h3>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          {/* Header parameters */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 border-b pb-3 border-gray-100 dark:border-gray-800">
            <span>Terminal: <strong>{summary.terminalCode}</strong></span>
            <span>Status: <strong>{summary.status}</strong></span>
            <span>Opened: <strong>{new Date(summary.openingTime).toLocaleTimeString()}</strong></span>
            {summary.closingTime && (
              <span>Closed: <strong>{new Date(summary.closingTime).toLocaleTimeString()}</strong></span>
            )}
          </div>

          {/* Sales metrics */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Orders:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{summary.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Cancelled Orders:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{summary.cancelledOrders}</span>
            </div>

            <div className="border-t my-2 border-dashed border-gray-200 dark:border-gray-800"></div>

            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Cash Sales (+):</span>
              <span className="font-medium text-gray-900 dark:text-white">INR {summary.cashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">UPI Payments:</span>
              <span className="font-medium text-gray-900 dark:text-white">INR {summary.upiSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Card Payments:</span>
              <span className="font-medium text-gray-900 dark:text-white">INR {summary.cardSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-red-500">
              <span>Refunds Issued (-):</span>
              <span className="font-medium">- INR {summary.refunds.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-semibold text-gray-900 dark:text-white mt-1">
              <span>Total Shift Sales:</span>
              <span>INR {totalSales.toFixed(2)}</span>
            </div>
          </div>

          {/* Drawer Reconciliation */}
          <div className="p-3 bg-gray-50 dark:bg-gray-950/40 rounded-lg space-y-2 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Opening Cash Balance:</span>
              <span>INR {summary.openingCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Expected Drawer Cash:</span>
              <span>INR {summary.expectedClosingCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>Actual Closing Drawer:</span>
              <span>INR {actualCashEntered.toFixed(2)}</span>
            </div>

            <div className="border-t my-1 border-gray-200 dark:border-gray-800"></div>

            <div className="flex justify-between font-bold">
              <span>Cash Discrepancy:</span>
              <span className={difference === 0 ? 'text-green-500' : 'text-red-500'}>
                {difference >= 0 ? '+' : ''}INR {difference.toFixed(2)}
              </span>
            </div>
          </div>

          {difference !== 0 && (
            <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/30">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Discrepancy detected. Please double check all card receipts and cash draw bills before releasing.
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={onPrintSummary} variant="outline" className="w-full flex items-center justify-center gap-2">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ShiftSummaryDialog;
