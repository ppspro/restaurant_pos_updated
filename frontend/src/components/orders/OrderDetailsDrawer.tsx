import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { useOrderDetails, useReprintOrder } from '../../api/orders.api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Printer, ShieldAlert } from 'lucide-react';
import { useNotification } from '../ui/GlobalNotificationProvider';
import { CancelOrderDialog } from './CancelOrderDialog';

interface OrderDetailsDrawerProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsDrawer({ orderId, isOpen, onClose }: OrderDetailsDrawerProps) {
  const { data: order, isLoading } = useOrderDetails(orderId as string, isOpen && !!orderId);
  const reprintMutation = useReprintOrder();
  const { notify } = useNotification();
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const handleReprint = async (type: 'RECEIPT' | 'KOT') => {
    if (!orderId) return;
    try {
      await reprintMutation.mutateAsync({ id: orderId, type });
      notify('success', `${type} sent to printer successfully`);
    } catch (error: any) {
      notify('error', error.response?.data?.error || 'Failed to reprint');
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col">
          <SheetHeader className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <SheetTitle>Order Details</SheetTitle>
                <SheetDescription>
                  {order?.orderNumber || 'Loading...'}
                </SheetDescription>
              </div>
              {order && (
                <Badge variant={order.orderStatus === 'CANCELLED' ? 'destructive' : order.orderStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                  {order.orderStatus}
                </Badge>
              )}
            </div>
          </SheetHeader>

          {isLoading || !order ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <span className="text-muted-foreground">Loading order details...</span>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 py-4">
                <div className="space-y-6 px-1">
                  
                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Token</p>
                      <p className="font-medium">{order.tokenNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cashier</p>
                      <p className="font-medium">{order.cashier.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <p className="font-medium capitalize">{order.payment?.paymentMethod?.toLowerCase() || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <p className="font-medium">{item.quantity}x {item.itemName}</p>
                            <p className="text-xs text-muted-foreground">₹{Number(item.unitPrice).toFixed(2)} / ea</p>
                          </div>
                          <p className="font-medium">₹{Number(item.totalPrice).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{Number(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST Amount</span>
                      <span>₹{Number(order.gstAmount).toFixed(2)}</span>
                    </div>
                    {Number(order.discount) > 0 && (
                      <div className="flex justify-between text-destructive">
                        <span>Discount</span>
                        <span>-₹{Number(order.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Grand Total</span>
                      <span>₹{Number(order.grandTotal).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="border-t pt-4 pb-2 mt-auto flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => handleReprint('RECEIPT')} disabled={reprintMutation.isPending}>
                    <Printer className="w-4 h-4 mr-2" />
                    Receipt
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleReprint('KOT')} disabled={reprintMutation.isPending}>
                    <Printer className="w-4 h-4 mr-2" />
                    KOT
                  </Button>
                </div>
                {order.orderStatus !== 'CANCELLED' && (
                  <Button variant="outline" className="w-full bg-red-500 text-white hover:bg-red-600" onClick={() => setIsCancelOpen(true)}>
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {orderId && order && (
        <CancelOrderDialog
          orderId={orderId}
          orderNumber={order.orderNumber}
          isOpen={isCancelOpen}
          onClose={() => setIsCancelOpen(false)}
          onSuccess={onClose}
        />
      )}
    </>
  );
}
