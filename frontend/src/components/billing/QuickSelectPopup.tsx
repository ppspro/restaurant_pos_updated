import React from 'react';
import type { MenuItem } from '../../store/billing.store';
import { ChefHat, Package } from 'lucide-react';

interface QuickSelectPopupProps {
  isOpen: boolean;
  buffer: string;
  selectedItem: MenuItem | null;
}

export const QuickSelectPopup = ({ isOpen, buffer, selectedItem }: QuickSelectPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[2px]">
      <div 
        className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-[400px] max-w-[90vw] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 pointer-events-auto"
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Quick Select</div>
          <div className="font-mono text-xl font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg">
            #{buffer}
          </div>
        </div>

        <div className="p-6">
          {selectedItem ? (
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-slate-400 font-mono text-sm font-bold tracking-widest uppercase">
                {selectedItem.itemNumber}
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">
                {selectedItem.name}
              </h2>
              
              <div className="flex items-center gap-3 pt-2">
                <span className="text-2xl font-black text-green-400">
                  ₹{selectedItem.price.toFixed(2)}
                </span>
                
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-2.5 py-1 rounded-lg ${
                  selectedItem.itemType === 'KITCHEN' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-orange-500/20 text-orange-300'
                }`}>
                  {selectedItem.itemType === 'KITCHEN' ? <ChefHat className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                  {selectedItem.itemType}
                </span>
              </div>

              {!selectedItem.isAvailable && (
                <div className="mt-4 text-red-400 font-bold bg-red-500/10 px-4 py-2 rounded-lg w-full text-sm">
                  Item Currently Unavailable
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-2 py-6">
              <div className="text-slate-500 text-lg">No matching item found</div>
              <div className="text-slate-600 text-sm">Verify the reference number</div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs font-medium text-slate-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">ESC</kbd> Close</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">⌫</kbd> Edit</span>
          </div>
          {selectedItem?.isAvailable && (
            <span className="flex items-center gap-1.5 text-blue-400 font-bold">
              <kbd className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-300 font-mono">ENTER</kbd> Add
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
