import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface OpenShiftDialogProps {
  isOpen: boolean;
  onOpenShift: (openingCash: number) => void;
}

export const OpenShiftDialog = ({ isOpen, onOpenShift }: OpenShiftDialogProps) => {
  const [openingCash, setOpeningCash] = useState<string>('0.00');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenShift(Number(openingCash));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Open Cashier Shift</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter the starting drawer cash balance to open your register and begin taking prepaid orders.
        </p>

        <div className="mt-4 space-y-2">
          <Label htmlFor="openingCash">Opening Drawer Cash (INR)</Label>
          <Input
            id="openingCash"
            type="number"
            step="0.01"
            min="0"
            required
            value={openingCash}
            onChange={(e) => setOpeningCash(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="submit" className="w-full">
            Start Cashier Shift
          </Button>
        </div>
      </form>
    </div>
  );
};

interface CloseShiftDialogProps {
  isOpen: boolean;
  onCloseShift: (closingCash: number, notes?: string) => void;
  onCancel: () => void;
}

export const CloseShiftDialog = ({ isOpen, onCloseShift, onCancel }: CloseShiftDialogProps) => {
  const [closingCash, setClosingCash] = useState<string>('0.00');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseShift(Number(closingCash), notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Close Cashier Shift</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Reconcile your final drawer cash. Any discrepancies from expected sales will be recorded.
        </p>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="closingCash">Closing Cash Balance (INR)</Label>
            <Input
              id="closingCash"
              type="number"
              step="0.01"
              min="0"
              required
              value={closingCash}
              onChange={(e) => setClosingCash(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Discrepancy Notes / Comments</Label>
            <Input
              id="notes"
              type="text"
              placeholder="e.g. Returned change to drawer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Close Shift & Release
          </Button>
        </div>
      </form>
    </div>
  );
};
