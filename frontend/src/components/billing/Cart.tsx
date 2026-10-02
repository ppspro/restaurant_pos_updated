import React, { useState, useEffect } from 'react';
import { useBillingStore } from '../../store/billing.store';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../api/axios';
import { Button } from '../ui/button';
import {
  ShoppingCart, Trash2, Plus, Minus, CreditCard, Landmark,
  Coins, Percent, RefreshCw, MessageSquare, Loader2, ArrowRight,
  Sparkles, ShieldCheck
} from 'lucide-react';
import { DiscountDialog } from './DiscountDialog';
import { PaymentDialog } from './PaymentDialog';
import { ReceiptPreview } from './ReceiptPreview';
import { offlineQueue } from '../../services/offlineQueue.service';
import type { ReceiptBundle, ReceiptItem } from '../../types/receipt.types';
import { queryClient } from '../../lib/queryClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const Cart = () => {
  const cashierId = useAuthStore.getState().user?.id ?? '';
  const {
    cart,
    discountType,
    discountValue,
    discountReason,
    updateQuantity,
    removeFromCart,
    clearCart,
    lastRemovedItem,
    undoLastRemove,
    updateInstructions,
    paymentMethod,
    changeReturnAmount,
    receivedCashAmount,
    transactionReference,
    addCompletedOrder,
    setPaymentState,
    setSearchQuery,
    setPaymentMethod
  } = useBillingStore();

  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [tokenNumber, setTokenNumber] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptBundle, setReceiptBundle] = useState<ReceiptBundle | null>(null);
  const [apiError, setApiError] = useState<string>('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Math totals — GST removed per client request
  const subtotal = cart.reduce((acc, c) => acc + c.price * c.quantity, 0);
  const discountAmount = discountType === 'PERCENTAGE' ? (subtotal * discountValue) / 100 : discountValue;
  const gstAmount = 0; // GST disabled
  const total = subtotal - discountAmount; // No GST applied

  const kitchenItemsCount = cart.filter(c => c.itemType === 'KITCHEN').reduce((acc, c) => acc + c.quantity, 0);
  const packedItemsCount = cart.filter(c => c.itemType === 'PACKED').reduce((acc, c) => acc + c.quantity, 0);

  // Keyboard Shortcuts (F1-F5, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          // Focus search bar
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
          break;
        case 'F2':
          e.preventDefault();
          if (cart.length > 0) {
            setPaymentMethod('CASH');
            setPaymentOpen(true);
          }
          break;
        case 'F3':
          e.preventDefault();
          if (cart.length > 0) {
            setPaymentMethod('UPI');
            setPaymentOpen(true);
          }
          break;
        case 'F4':
          e.preventDefault();
          if (cart.length > 0) {
            setPaymentMethod('CARD');
            setPaymentOpen(true);
          }
          break;
        case 'F5':
          e.preventDefault();
          if (receiptBundle) {
            setReceiptOpen(true);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (paymentOpen) setPaymentOpen(false);
          if (discountOpen) setDiscountOpen(false);
          if (receiptOpen) setReceiptOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, receiptBundle, paymentOpen, discountOpen, receiptOpen, setPaymentMethod]);

  const handlePaymentSuccess = async () => {
    setCreatingOrder(true);
    setApiError('');

    try {
      const payload = {
        cashierId,
        items: cart.map(c => ({
          menuItemId: c.id,
          itemName: c.name,
          quantity: c.quantity,
          unitPrice: c.price,
          gst: c.gstPercentage,
          itemType: c.itemType,
          notes: c.instructions || undefined,
        })),
        subtotal,
        gstAmount,
        discount: discountAmount,
        grandTotal: total,
        paymentMethod: paymentMethod ?? 'CASH',
        receivedCash: receivedCashAmount || undefined,
        transactionReference: transactionReference || undefined,
        idempotencyKey: crypto.randomUUID(),
      };

      let apiToken: number;
      let apiOrderNumber: string;
      let businessDate: string | undefined;
      let apiOrderTime: string | undefined;
      let orderId: string;

      if (!navigator.onLine) {
        // Enqueue for offline sync
        const offlineId = await offlineQueue.enqueueOrder(payload);
        
        // Generate mock data for local print
        apiToken = Math.floor(Math.random() * 900) + 100;
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        apiOrderNumber = `OFF-${dateStr}-${apiToken}`;
        orderId = offlineId;
      } else {
        // Call the real Order Creation API via interceptored axios client
        const response = await api.post('/billing/orders', payload);
        const result = response.data;
        if (!result.success) {
          throw new Error(result.message || 'Order creation failed');
        }
        apiToken = result.data.tokenNumber;
        apiOrderNumber = result.data.orderNumber;
        businessDate = result.data.businessDate;
        apiOrderTime = result.data.orderTime;
        orderId = result.data.orderId;
      }

      setTokenNumber(apiToken);
      setOrderNumber(apiOrderNumber);

      // Build receipt bundle from current cart state
      // lineTotal = price * quantity (no GST per client request)
      const receiptItems: ReceiptItem[] = cart.map(c => ({
        itemNumber: c.itemNumber,
        name: c.name,
        quantity: c.quantity,
        unitPrice: c.price,
        lineTotal: c.price * c.quantity,
        itemType: c.itemType,
        instructions: c.instructions
      }));

      // Use Intl.DateTimeFormat for Asia/Kolkata timezone
      const orderDateObj = apiOrderTime ? new Date(apiOrderTime) : new Date();
      const today = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).format(orderDateObj);
      const orderTime = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(orderDateObj).toUpperCase();
      const kitchenItems = receiptItems.filter(i => i.itemType === 'KITCHEN');
      const hasKOT = kitchenItems.length > 0;

      const baseData = {
        restaurantName: 'Shree Krishna',
        transactionDate: today,
        tokenNumber: apiToken,
        orderTime,
        cashierName: 'Cashier User',
        paperSize: '80mm' as const,
        hasKOT,
      };

      const bundle: ReceiptBundle = {
        customerReceipt: {
          ...baseData, receiptType: 'CUSTOMER', items: receiptItems,
          subtotal, discountLabel: discountReason || undefined, discountAmount,
          gstAmount: 0, grandTotal: total, paymentMethod: paymentMethod ?? 'CASH',
          receivedCash: receivedCashAmount, changeDue: changeReturnAmount,
          transactionRef: transactionReference || undefined,
        },
        restaurantCopy: {
          ...baseData, receiptType: 'RESTAURANT', items: receiptItems,
          subtotal, discountLabel: discountReason || undefined, discountAmount,
          gstAmount: 0, grandTotal: total, paymentMethod: paymentMethod ?? 'CASH',
          receivedCash: receivedCashAmount, changeDue: changeReturnAmount,
          transactionRef: transactionReference || undefined,
        },
        kot: hasKOT ? { ...baseData, receiptType: 'KOT', items: kitchenItems } : null,
      };

      setReceiptBundle(bundle);

      // Save to order history
      addCompletedOrder({
        orderId,
        orderNumber: apiOrderNumber,
        tokenNumber: apiToken,
        grandTotal: total,
        paymentMethod: paymentMethod ?? 'CASH',
        businessDate: businessDate ?? today,
        completedAt: new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).format(orderDateObj).toUpperCase(),
        receiptBundle: bundle,
      });

      // Invalidate analytics queries to update Daily Sales report
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      setReceiptOpen(true);
      setCheckoutComplete(true);

    } catch (err: any) {
      let msg = 'Order creation failed';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setApiError(msg);
      // Reset payment state so cashier can retry
      setPaymentState({ paymentStatus: 'FAILED' });
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleReset = () => {
    clearCart();
    setCheckoutComplete(false);
    setTokenNumber(null);
    setOrderNumber('');
    setReceiptBundle(null);
    setApiError('');
  };

  const handleFastPay = (method: 'CASH' | 'UPI' | 'CARD') => {
    setPaymentState({ paymentMethod: method });
    setPaymentOpen(true);
  };

  if (creatingOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Creating Order...</p>
        <p className="text-xs text-gray-400">Generating token and KOT printing sequence</p>
      </div>
    );
  }

  if (apiError && !checkoutComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 gap-4 text-center bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="text-4xl text-rose-500">⚠️</div>
        <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Order Creation Failed</h3>
        <p className="text-xs text-gray-500">{apiError}</p>
        <Button onClick={() => setApiError('')} className="h-10 text-xs w-full bg-blue-600 hover:bg-blue-700">
          Try Again
        </Button>
      </div>
    );
  }

  if (checkoutComplete && tokenNumber) {
    return (
      <div className="flex flex-col justify-between p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-lg h-full text-center space-y-4">
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div className="h-14 w-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto border border-emerald-500/20 shadow-sm">
            ✓
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Order Saved Successfully</h3>
          <p className="text-[10px] font-mono text-gray-400">{orderNumber}</p>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl w-full space-y-1">
            <span className="block text-[10px] text-blue-500 uppercase tracking-widest font-extrabold">Queue Token</span>
            <span className="block text-4xl font-black text-blue-600 dark:text-blue-400">
              #{String(tokenNumber).padStart(3, '0')}
            </span>
            {paymentMethod === 'CASH' && changeReturnAmount > 0 && (
              <span className="block text-xs text-emerald-600 font-semibold mt-2">
                Return Change: ₹{changeReturnAmount.toFixed(2)}
              </span>
            )}
          </div>

          {kitchenItemsCount > 0 ? (
            <div className="p-3 bg-gray-50 dark:bg-slate-950/40 rounded-xl w-full text-left text-xs border font-mono">
              <span className="block border-b pb-1 font-bold text-gray-700 dark:text-gray-300">Kitchen KOT</span>
              {cart.filter(c => c.itemType === 'KITCHEN').map(c => (
                <div key={c.id} className="flex justify-between mt-1">
                  <span>{c.itemNumber} {c.name} x{c.quantity}</span>
                  <span className="text-gray-400 text-[10px] italic">{c.instructions || ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-amber-500/5 rounded-xl w-full text-left text-xs border border-amber-500/10 text-amber-600">
              <span className="font-semibold block">No Kitchen KOT ticket required</span>
              <span className="text-gray-400 block mt-0.5">Packed goods / beverages only.</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full shrink-0">
          {receiptBundle && (
            <Button onClick={() => setReceiptOpen(true)} variant="outline" className="h-11 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
              🖨️ Print Receipt (F5)
            </Button>
          )}
          <Button onClick={handleReset} className={`${receiptBundle ? '' : 'col-span-2'} h-11 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700`}>
            Next Order <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {receiptBundle && (
          <ReceiptPreview
            isOpen={receiptOpen}
            onClose={() => setReceiptOpen(false)}
            customerReceipt={receiptBundle.customerReceipt}
            restaurantCopy={receiptBundle.restaurantCopy}
            kot={receiptBundle.kot}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm h-full overflow-hidden select-none">
      {/* Cart Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-gray-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingCart className="h-4.5 w-4.5 text-blue-500" />
          Cart Summary ({cart.reduce((acc, c) => acc + c.quantity, 0)})
        </h3>
        {cart.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCart} className="h-8 px-2.5 text-red-500 hover:bg-red-500/10 rounded-lg">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[160px]">
        {lastRemovedItem && (
          <div className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs">
            <span className="text-amber-600 dark:text-amber-400">Removed {lastRemovedItem.name}</span>
            <Button size="sm" variant="ghost" onClick={undoLastRemove} className="h-7 text-[10px] text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Undo Action
            </Button>
          </div>
        )}
        
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-16 space-y-2">
            <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-full">
              <ShoppingCart className="h-10 w-10 text-gray-200 dark:text-gray-700" />
            </div>
            <p className="text-xs font-semibold">Cart is currently empty</p>
            <p className="text-[10px] text-gray-400 max-w-[180px]">Add items from catalog or scan barcode to checkout</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="p-3 border border-gray-150 dark:border-gray-800 rounded-xl space-y-2.5 bg-slate-50/20 dark:bg-slate-950/10 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-2 items-center flex-1 min-w-0">
                  <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <img 
                      src={item.image ? `${API_BASE_URL}${item.image}` : '/images/default-food.png'} 
                      alt={item.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[10px] font-black tracking-wider text-slate-500">{item.itemNumber}</span>
                    <span className="block text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">₹{item.price.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Modern Quantity Stepper */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-0.5">
                  <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-6 w-6 rounded-md">
                    <Minus className="h-3 w-3 text-gray-500" />
                  </Button>
                  <span className="text-xs font-extrabold w-5 text-center text-gray-800 dark:text-gray-200">{item.quantity}</span>
                  <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-6 w-6 rounded-md">
                    <Plus className="h-3 w-3 text-gray-500" />
                  </Button>
                </div>

                <div className="text-right">
                  <span className="block text-xs font-extrabold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500 font-semibold hover:underline mt-1">Remove</button>
                </div>
              </div>

              {/* Special Instructions */}
              {activeNoteId === item.id ? (
                <input
                  type="text"
                  placeholder="Instructions (e.g. Extra spicy, no onion)..."
                  defaultValue={item.instructions || ''}
                  autoFocus
                  onBlur={(e) => { updateInstructions(item.id, e.target.value); setActiveNoteId(null); }}
                  className="w-full h-8 text-[11px] px-2.5 border rounded-lg border-gray-200 bg-white dark:bg-slate-950 focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setActiveNoteId(item.id)}
                  className="h-6 px-2 justify-start text-[10px] text-gray-400 hover:text-blue-500 hover:bg-blue-500/5 flex items-center gap-1 rounded-lg"
                >
                  <MessageSquare className="h-3 w-3" />
                  {item.instructions || '+ Add Instructions'}
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Actions */}
      <div className="p-4 border-t border-gray-150 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-4 shrink-0">
        {cart.length > 0 && (
          <div className="flex justify-between text-[10px] text-gray-400 font-bold tracking-wider uppercase font-mono">
            <span className="flex items-center gap-1">🍳 Kitchen KOTs: <strong>{kitchenItemsCount}</strong></span>
            <span className="flex items-center gap-1">📦 Packed Bags: <strong>{packedItemsCount}</strong></span>
          </div>
        )}
        
        <Button
          onClick={() => setDiscountOpen(true)}
          disabled={cart.length === 0}
          variant="outline"
          className="w-full h-10 text-xs font-semibold flex items-center gap-2 rounded-xl border-gray-250 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Percent className="h-4 w-4 text-blue-500" />
          {discountValue > 0
            ? `Applied Discount: ${discountType === 'PERCENTAGE' ? `${discountValue}%` : `INR ${discountValue}`}`
            : 'Apply Discount / Coupon'}
        </Button>

        {/* Price Breakdown */}
        <div className="space-y-2 text-xs font-semibold">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal:</span>
            <span className="text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-rose-500 bg-rose-500/5 px-2 py-1 rounded-lg">
              <span>Coupon Discount {discountReason && <span className="text-[9px] italic font-normal">({discountReason})</span>}:</span>
              <span>- ₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {/* GST row removed per client request */}
          
          <div className="flex justify-between font-black text-base pt-2.5 border-t border-dashed border-gray-200 dark:border-gray-800">
            <span className="text-gray-900 dark:text-white">Grand Total:</span>
            <span className="text-blue-600 dark:text-blue-400">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Colorful Payment Options */}
        <div className="grid grid-cols-3 gap-2.5">
          <Button
            key="CASH"
            onClick={() => handleFastPay('CASH')}
            disabled={cart.length === 0}
            className="h-12 text-[10px] font-bold flex flex-col items-center justify-center p-0.5 rounded-xl border bg-amber-500/5 text-amber-600 border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
          >
            <Coins className="h-4 w-4 mb-0.5" />
            CASH (F2)
          </Button>

          <Button
            key="UPI"
            onClick={() => handleFastPay('UPI')}
            disabled={cart.length === 0}
            className="h-12 text-[10px] font-bold flex flex-col items-center justify-center p-0.5 rounded-xl border bg-blue-500/5 text-blue-600 border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <Landmark className="h-4 w-4 mb-0.5" />
            UPI QR (F3)
          </Button>

          <Button
            key="CARD"
            onClick={() => handleFastPay('CARD')}
            disabled={cart.length === 0}
            className="h-12 text-[10px] font-bold flex flex-col items-center justify-center p-0.5 rounded-xl border bg-emerald-500/5 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
          >
            <CreditCard className="h-4 w-4 mb-0.5" />
            CARD (F4)
          </Button>
        </div>
      </div>

      <DiscountDialog isOpen={discountOpen} onClose={() => setDiscountOpen(false)} subtotal={subtotal} />
      <PaymentDialog isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} total={total} onPaymentSuccess={handlePaymentSuccess} />
    </div>
  );
};
export default Cart;
