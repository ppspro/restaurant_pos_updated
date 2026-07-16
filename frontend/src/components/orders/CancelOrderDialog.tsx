import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useCancelOrder } from '../../api/orders.api';
import { useNotification } from '../ui/GlobalNotificationProvider';

interface CancelOrderDialogProps {
  orderId: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelOrderDialog({ orderId, orderNumber, isOpen, onClose, onSuccess }: CancelOrderDialogProps) {
  const [reason, setReason] = useState('');
  const cancelMutation = useCancelOrder();
  const { notify } = useNotification();

  const handleCancel = async () => {
    if (!reason.trim()) {
      notify('error', 'Please provide a cancellation reason');
      return;
    }

    try {
      await cancelMutation.mutateAsync({ id: orderId, reason });
      notify('success', 'Order cancelled successfully');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      notify('error', error.response?.data?.error || 'Failed to cancel order');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Order #{orderNumber}</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action requires an admin audit log and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-right">
              Cancellation Reason
            </Label>
            <Input
              id="reason"
              placeholder="e.g., Customer requested refund, duplicate order..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={cancelMutation.isPending}>
            Keep Order
          </Button>
          <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600" onClick={handleCancel} disabled={cancelMutation.isPending || !reason.trim()}>
            {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
