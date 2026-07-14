import React, { useState } from 'react';
import { useBillingStore } from '../../store/billing.store';
import type { CompletedOrder } from '../../store/billing.store';
import { ReceiptPreview } from './ReceiptPreview';
import { Button } from '../ui/button';
import { Clock, Coins, Landmark, CreditCard, Printer, X, AlertTriangle } from 'lucide-react';

const CASHIER_ID = 'demo-cashier-001'; // Will be replaced by auth context

export const OrderHistory = () => {
  const { completedOrders } = useBillingStore();

  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [reprintOpen, setReprintOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<CompletedOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const paymentIcon = (method: string) => {
    if (method === 'CASH') return <Coins className="h-3 w-3 text-amber-500" />;
    if (method === 'UPI') return <Landmark className="h-3 w-3 text-blue-500" />;
    return <CreditCard className="h-3 w-3 text-green-500" />;
  };

  const handleReprint = (order: CompletedOrder) => {
    setSelectedOrder(order);
    setReprintOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    setCancelling(true);
    setCancelError('');

    try {
      const res = await fetch(`/api/billing/orders/${cancelTarget.orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason, userId: CASHIER_ID }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setCancelTarget(null);
      setCancelReason('');
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  if (completedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-16 text-gray-400 space-y-2">
        <Clock className="h-10 w-10 text-gray-200 dark:text-gray-700" />
        <p className="text-xs font-medium">No orders yet today</p>
        <p className="text-[10px] text-gray-400">Completed orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          Today's Orders ({completedOrders.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {completedOrders.map((order) => (
          <div
            key={order.orderId}
            className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:border-blue-200 dark:hover:border-blue-800 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  #{String(order.tokenNumber).padStart(3, '0')}
                </span>
                <div>
                  <span className="block text-[10px] font-mono text-gray-500">{order.orderNumber}</span>
                  <span className="block text-[9px] text-gray-400">{order.completedAt}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-extrabold text-gray-900 dark:text-white">
                  INR {order.grandTotal.toFixed(2)}
                </span>
                <span className="flex items-center justify-end gap-1 text-[10px] text-gray-500 uppercase font-semibold">
                  {paymentIcon(order.paymentMethod)}
                  {order.paymentMethod}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleReprint(order)}
                variant="outline"
                className="flex-1 h-7 text-[10px] flex items-center gap-1"
              >
                <Printer className="h-3 w-3" /> Reprint
              </Button>
              <Button
                onClick={() => setCancelTarget(order)}
                variant="outline"
                className="flex-1 h-7 text-[10px] text-red-500 hover:text-red-600 border-red-100 hover:border-red-200 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Cancel
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Reprint dialog */}
      {selectedOrder && selectedOrder.receiptBundle && (
        <ReceiptPreview
          isOpen={reprintOpen}
          onClose={() => { setReprintOpen(false); setSelectedOrder(null); }}
          customerReceipt={selectedOrder.receiptBundle.customerReceipt}
          restaurantCopy={selectedOrder.receiptBundle.restaurantCopy}
          kot={selectedOrder.receiptBundle.kot}
        />
      )}

      {/* Cancel confirmation dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Cancel Order</h3>
                <p className="text-[10px] text-gray-500">Token #{String(cancelTarget.tokenNumber).padStart(3, '0')} — {cancelTarget.orderNumber}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Cancellation Reason</label>
              <input
                type="text"
                placeholder="Enter reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-9 text-xs px-3 border rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                autoFocus
              />
            </div>
            {cancelError && (
              <p className="text-xs text-red-500">{cancelError}</p>
            )}
            <div className="flex gap-3">
              <Button onClick={() => { setCancelTarget(null); setCancelReason(''); setCancelError(''); }} variant="outline" className="flex-1 h-9 text-xs" disabled={cancelling}>
                Keep Order
              </Button>
              <Button
                onClick={handleCancelConfirm}
                disabled={!cancelReason.trim() || cancelling}
                className="flex-1 h-9 text-xs bg-red-500 hover:bg-red-600 text-white"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrderHistory;
