import React from 'react';
import { Button } from '../ui/button';
import { Ticket, Printer, RefreshCw } from 'lucide-react';

interface TokenPopupProps {
  isOpen: boolean;
  tokenNumber: number;
  onClose: () => void;
  onReprint: () => void;
}

export const TokenPopup = ({ isOpen, tokenNumber, onClose, onReprint }: TokenPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl shadow-2xl text-center space-y-6 animate-scale-in">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full mb-3">
            <Ticket className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Prepaid Order Committed</h2>
          <p className="text-xs text-gray-500 mt-1">Receipts and KOT routed to print buffers</p>
        </div>

        {/* Large Token display */}
        <div className="py-6 px-4 bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <span className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Order Token</span>
          <span className="block text-6xl font-black text-blue-600 dark:text-blue-400 tracking-tight my-2">
            #{String(tokenNumber).padStart(3, '0')}
          </span>
          <span className="text-[10px] text-gray-400 block font-mono">Date: {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onReprint}
            variant="outline"
            className="h-11 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Reprint Bill
          </Button>
          <Button
            onClick={onClose}
            className="h-11 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white"
          >
            Done (F2)
          </Button>
        </div>
      </div>
    </div>
  );
};
export default TokenPopup;
