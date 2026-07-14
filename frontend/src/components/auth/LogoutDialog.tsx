import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, LogOut, AlertTriangle, Calculator } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../api/axios';
import { useNotification } from '../ui/GlobalNotificationProvider';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'LOADING' | 'NO_SHIFT' | 'ACTIVE_SHIFT' | 'SHIFT_SUMMARY' | 'CLOSING_SHIFT';

export function LogoutDialog({ isOpen, onClose }: LogoutDialogProps) {
  const { logout } = useAuth();
  const { notify } = useNotification();

  const [modalState, setModalState] = useState<ModalState>('LOADING');
  const [activeShift, setActiveShift] = useState<any>(null);
  const [shiftSummary, setShiftSummary] = useState<any>(null);

  const [closingCash, setClosingCash] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setModalState('LOADING');
      checkActiveShift();
    } else {
      setModalState('LOADING');
      setActiveShift(null);
      setShiftSummary(null);
      setClosingCash('');
      setNotes('');
    }
  }, [isOpen]);

  const checkActiveShift = async () => {
    try {
      const res = await api.get('/auth/shifts/current');
      const shift = res.data?.data;
      if (shift && shift.status === 'OPEN') {
        setActiveShift(shift);
        setModalState('ACTIVE_SHIFT');
      } else {
        setModalState('NO_SHIFT');
      }
    } catch (error: any) {
      setModalState('NO_SHIFT');
    }
  };

  const handleStandardLogout = () => {
    logout('Standard Logout');
    onClose();
  };

  const handleContinueShiftLogout = () => {
    logout('Shift Continued');
    onClose();
  };

  const handleGoToSummary = async () => {
    setModalState('LOADING');
    try {
      const res = await api.get(`/auth/shifts/${activeShift.id}/summary`);
      setShiftSummary(res.data.data);
      setModalState('SHIFT_SUMMARY');
    } catch (error: any) {
      notify('error', 'Failed to load shift summary');
      setModalState('ACTIVE_SHIFT');
    }
  };

  const handleCloseShift = async () => {
    if (!closingCash || isNaN(Number(closingCash))) {
      notify('error', 'Please enter a valid closing cash amount');
      return;
    }

    setModalState('CLOSING_SHIFT');
    try {
      await api.post('/auth/shifts/close', {
        closingCash: Number(closingCash),
        notes,
      });
      notify('success', 'Shift closed successfully');
      logout('Shift Closed');
      onClose();
    } catch (error: any) {
      notify('error', error.response?.data?.errors?.[0]?.message || 'Failed to close shift');
      setModalState('SHIFT_SUMMARY');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {modalState === 'LOADING' || modalState === 'CLOSING_SHIFT' ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-muted-foreground">
              {modalState === 'LOADING' ? 'Checking shift status...' : 'Closing shift...'}
            </p>
          </div>
        ) : modalState === 'NO_SHIFT' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-rose-500" />
                Confirm Sign Out
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to sign out? You can sign back in at any time.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleStandardLogout}>
                Sign Out
              </Button>
            </DialogFooter>
          </>
        ) : modalState === 'ACTIVE_SHIFT' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Active Shift Detected
              </DialogTitle>
              <DialogDescription>
                You have an open shift on Terminal <strong>{activeShift?.terminal?.terminalCode || 'Unknown'}</strong>. What would you like to do?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-3 mt-4">
              <Button variant="outline" onClick={handleContinueShiftLogout} className="justify-start">
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Continue Shift & Sign Out</span>
                  <span className="text-xs text-muted-foreground font-normal">Session ends, but terminal remains assigned to you.</span>
                </div>
              </Button>
              <Button onClick={handleGoToSummary} className="justify-start bg-blue-600 hover:bg-blue-700 text-white">
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">Close Shift & Sign Out</span>
                  <span className="text-xs text-blue-100 font-normal">Reconcile cash and release the terminal.</span>
                </div>
              </Button>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : modalState === 'SHIFT_SUMMARY' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-500" />
                Shift Summary & Reconciliation
              </DialogTitle>
              <DialogDescription>
                Please review your shift totals and enter your actual closing cash.
              </DialogDescription>
            </DialogHeader>
            
            {shiftSummary && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-900">
                    <p className="text-muted-foreground text-xs">Expected Cash</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${shiftSummary.expectedClosingCash?.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-900">
                    <p className="text-muted-foreground text-xs">Total Card Sales</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${shiftSummary.cardSales?.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-900">
                    <p className="text-muted-foreground text-xs">Total UPI Sales</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${shiftSummary.upiSales?.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-900">
                    <p className="text-muted-foreground text-xs">Cash Sales</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${shiftSummary.cashSales?.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <Label htmlFor="closingCash">Actual Cash in Drawer *</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <Input
                        id="closingCash"
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-7"
                        placeholder="0.00"
                        value={closingCash}
                        onChange={(e) => setClosingCash(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {closingCash && !isNaN(Number(closingCash)) && (
                    <div className={`p-2 rounded-md text-sm border ${Number(closingCash) === shiftSummary.expectedClosingCash ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                      Difference: ${(Number(closingCash) - shiftSummary.expectedClosingCash).toFixed(2)}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      className="mt-1"
                      placeholder="Add any remarks about discrepancies..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setModalState('ACTIVE_SHIFT')}>
                Back
              </Button>
              <Button onClick={handleCloseShift} className="bg-blue-600 hover:bg-blue-700 text-white">
                Confirm & Close Shift
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
