import React, { useState } from 'react';
import { useBillingStore } from '../../store/billing.store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Percent, Coins, AlertTriangle } from 'lucide-react';

interface DiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
}

export const DiscountDialog = ({ isOpen, onClose, subtotal }: DiscountDialogProps) => {
  const { discountType, discountValue, discountReason, setDiscountDetails } = useBillingStore();

  const [type, setType] = useState<'PERCENTAGE' | 'FLAT'>(discountType);
  const [val, setVal] = useState<string>(String(discountValue));
  const [reason, setReason] = useState<string>(discountReason);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    const num = Number(val) || 0;
    setError('');

    if (num < 0) {
      setError('Discount value cannot be negative');
      return;
    }

    if (type === 'PERCENTAGE' && num > 20) {
      setError('Percentage discount cannot exceed the 20% cap limit');
      return;
    }

    if (type === 'FLAT' && num > subtotal) {
      setError('Flat discount cannot exceed the subtotal amount');
      return;
    }

    setDiscountDetails(type, num, reason);
    onClose();
  };

  const predefinedReasons = [
    'Customer Loyalty Discount',
    'Manager Approved Comp',
    'Item Quality Comp',
    'Promotion Coupon Code',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
          <h3 className="text-md font-bold text-gray-900 dark:text-white">Apply Manual Discount</h3>
        </div>

        {/* Toggle Types */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800 rounded-lg text-xs">
          <button
            onClick={() => { setType('PERCENTAGE'); setError(''); }}
            className={`py-1.5 rounded-md font-bold flex items-center justify-center gap-1.5 ${
              type === 'PERCENTAGE'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Percent className="h-3.5 w-3.5" />
            Percentage (%)
          </button>
          <button
            onClick={() => { setType('FLAT'); setError(''); }}
            className={`py-1.5 rounded-md font-bold flex items-center justify-center gap-1.5 ${
              type === 'FLAT'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            Flat Cash (INR)
          </button>
        </div>

        {/* Value Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Discount Value</label>
          <Input
            type="number"
            placeholder={type === 'PERCENTAGE' ? 'Max 20%' : 'Enter flat amount...'}
            value={val === '0' ? '' : val}
            onChange={(e) => setVal(e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        {/* Reason Fields */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Reason for Adjustment</label>
          <Input
            type="text"
            placeholder="Type custom reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 text-xs"
          />
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {predefinedReasons.map((r, idx) => (
              <button
                key={idx}
                onClick={() => setReason(r)}
                className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 hover:bg-blue-100 hover:text-blue-700 rounded text-[9px] text-gray-500"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-xs text-red-800 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={onClose} variant="outline" className="w-full text-xs h-10">
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full text-xs h-10">
            Apply Discount
          </Button>
        </div>
      </div>
    </div>
  );
};
export default DiscountDialog;
