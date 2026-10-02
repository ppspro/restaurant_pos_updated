import React, { useState } from 'react';
import { useBillingStore } from '../../store/billing.store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Coins, Landmark, CreditCard, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPaymentSuccess: () => void;
}

export const PaymentDialog = ({ isOpen, onClose, total, onPaymentSuccess }: PaymentDialogProps) => {
  const { setPaymentState } = useBillingStore();

  const [method, setMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [refNumber, setRefNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const numCashReceived = Number(cashReceived) || 0;
  const changeDue = numCashReceived - total;

  const handleProcessPayment = () => {
    setError('');
    setLoading(true);

    // Validations
    if (method === 'CASH') {
      if (numCashReceived < total) {
        setError('Received cash is less than total bill amount');
        setLoading(false);
        return;
      }
    } else {
      if (!refNumber.trim()) {
        setError('Transaction reference ID is required for audit verification');
        setLoading(false);
        return;
      }
    }

    // Simulate Payment Gateway delay
    setTimeout(() => {
      // Simulate 10% chance of validation failure to test Retry mechanisms
      const simulatedFailure = method !== 'CASH' && Math.random() < 0.15;

      if (simulatedFailure) {
        setError('Payment Gateway Timeout: Transaction verification failed.');
        setLoading(false);
      } else {
        setPaymentState({
          paymentMethod: method,
          receivedCashAmount: method === 'CASH' ? numCashReceived : total,
          changeReturnAmount: method === 'CASH' ? Math.max(0, changeDue) : 0,
          transactionReference: method !== 'CASH' ? refNumber : 'CASH_TRANS',
          paymentStatus: 'SUCCESS',
        });
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setCashReceived('');
          setRefNumber('');
          onPaymentSuccess();
          onClose();
        }, 1200);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl space-y-4">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <CheckCircle className="h-12 w-12 text-green-500 animate-pulse" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Verified</h3>
            <p className="text-xs text-gray-500">Printing copies and token routing...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
              <h3 className="text-md font-bold text-gray-900 dark:text-white">Verify Prepaid Payment</h3>
              <span className="text-sm font-extrabold text-blue-500">Total: INR {total.toFixed(2)}</span>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Button
                variant={method === 'CASH' ? 'default' : 'outline'}
                onClick={() => { setMethod('CASH'); setError(''); }}
                className="h-11 flex flex-col items-center justify-center gap-0.5"
              >
                <Coins className="h-4 w-4" />
                CASH
              </Button>
              <Button
                variant={method === 'UPI' ? 'default' : 'outline'}
                onClick={() => { setMethod('UPI'); setError(''); }}
                className="h-11 flex flex-col items-center justify-center gap-0.5"
              >
                <Landmark className="h-4 w-4" />
                UPI QR
              </Button>
              <Button
                variant={method === 'CARD' ? 'default' : 'outline'}
                onClick={() => { setMethod('CARD'); setError(''); }}
                className="h-11 flex flex-col items-center justify-center gap-0.5"
              >
                <CreditCard className="h-4 w-4" />
                CARD
              </Button>
            </div>

            {/* Inputs based on tab choice */}
            {method === 'CASH' ? (
              <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-950/40 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Cash Tendered</label>
                  <Input
                    type="number"
                    placeholder="Enter cash amount..."
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="h-10 text-sm"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {numCashReceived > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-dashed border-gray-200 dark:border-gray-800">
                    <span className="text-gray-500">Change Due:</span>
                    <span className={changeDue >= 0 ? 'text-green-600 text-sm font-extrabold' : 'text-red-500'}>
                      {changeDue >= 0 ? `INR ${changeDue.toFixed(2)}` : `Need INR ${Math.abs(changeDue).toFixed(2)} more`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-950/40 rounded-lg border border-gray-150 dark:border-gray-800">
                {method === 'UPI' && (
                  <div className="flex flex-col items-center p-3 bg-white border border-gray-100 rounded-lg shadow-inner max-w-[140px] mx-auto">
                    {/* Real UPI QR */}
                    <div className="h-24 w-24 flex items-center justify-center">
                      <QRCodeSVG 
                        value={`upi://pay?pa=restaurant@upi&pn=Shree%20Krishna&am=${total.toFixed(2)}&cu=INR`}
                        size={96}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 font-semibold">Scan to Pay</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 font-mono">
                    {method} Transaction Reference ID
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter txn ID..."
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="h-10 text-xs font-mono"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-xs text-red-800 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={onClose} variant="outline" className="w-full h-10 text-xs" disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleProcessPayment} className="w-full h-10 text-xs font-bold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5 mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default PaymentDialog;
