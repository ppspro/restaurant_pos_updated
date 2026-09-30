import React, { useState } from 'react';
import type { ReceiptData } from '../../types/receipt.types';
import { Button } from '../ui/button';
import { Printer, X } from 'lucide-react';
import './receipt.css';

interface ReceiptPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  customerReceipt: ReceiptData;
  restaurantCopy: ReceiptData;
  kot: ReceiptData | null;
}

type Tab = 'customer' | 'restaurant' | 'kot';

const ReceiptSheet = ({ data }: { data: ReceiptData }) => {
  const isKOT = data.receiptType === 'KOT';

  return (
    <div
      className="receipt-print-area mx-auto font-mono text-black bg-white"
      style={{ width: '80mm', minHeight: '120px', padding: '8px', fontSize: '11px', lineHeight: '1.5' }}
    >
      {/* Header */}
      <div className="text-center pb-2 mb-2">
        <div className="text-base font-extrabold">{data.restaurantName}</div>
        {isKOT ? (
          <div className="text-sm font-bold mt-0.5">*** KITCHEN ORDER TICKET ***</div>
        ) : (
          <div className="text-xs text-gray-800 mt-0.5">
            {data.receiptType === 'RESTAURANT' ? 'Restaurant Copy' : 'Customer Copy'}
          </div>
        )}
      </div>

      <div className="border-t border-b border-dashed border-gray-400 py-1.5 mb-2 text-xs text-left space-y-0.5">
        <div>Date: {data.transactionDate}</div>
        <div>Time: {data.orderTime}</div>
        <div>Cashier: {data.cashierName}</div>
        <div className="font-bold">Token: #{String(data.tokenNumber).padStart(3, '0')}</div>
      </div>

      {/* Items */}
      <table className="w-full text-[10px] mb-2">
        <thead>
          <tr className="border-b border-dashed border-gray-300">
            <th className="text-left font-bold pb-0.5">Item</th>
            <th className="text-right font-bold">Qty</th>
            {!isKOT && <th className="text-right font-bold">Price</th>}
            {!isKOT && <th className="text-right font-bold">Total</th>}
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <React.Fragment key={i}>
              <tr>
                <td className="text-left py-0.5"><span className="font-bold mr-1">{item.itemNumber}</span> {item.name}</td>
                <td className="text-right">{item.quantity}</td>
                {!isKOT && <td className="text-right">{item.unitPrice.toFixed(2)}</td>}
                {!isKOT && <td className="text-right">{item.lineTotal.toFixed(2)}</td>}
              </tr>
              {isKOT && item.instructions && (
                <tr>
                  <td colSpan={2} className="text-[9px] italic text-gray-500 pl-2">
                    ↳ {item.instructions}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Totals – non-KOT only */}
      {!isKOT && (
        <div className="border-t border-dashed border-gray-400 pt-1.5 space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>INR {(data.subtotal ?? 0).toFixed(2)}</span>
          </div>
          {(data.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount {data.discountLabel ? `(${data.discountLabel})` : ''}</span>
              <span>- INR {(data.discountAmount ?? 0).toFixed(2)}</span>
            </div>
          )}
          {/* GST row removed per client request */}
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-400 pt-1 mt-1">
            <span>GRAND TOTAL</span>
            <span>INR {(data.grandTotal ?? 0).toFixed(2)}</span>
          </div>
        </div>
      )}


      {/* Payment – non-KOT only */}
      {!isKOT && (
        <div className="mt-1.5 border-t border-dashed border-gray-400 pt-1 text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>Payment Mode</span>
            <span className="uppercase font-bold">{data.paymentMethod}</span>
          </div>
          {data.paymentMethod === 'CASH' && (
            <>
              <div className="flex justify-between">
                <span>Cash Received</span>
                <span>INR {(data.receivedCash ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Change Return</span>
                <span>INR {(data.changeDue ?? 0).toFixed(2)}</span>
              </div>
            </>
          )}
          {data.paymentMethod !== 'CASH' && data.transactionRef && (
            <div className="flex justify-between">
              <span>Txn Ref</span>
              <span className="font-mono text-[9px]">{data.transactionRef}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 border-t border-dashed border-gray-400 pt-2 text-center text-[9px] text-gray-500">
        {isKOT ? (
          <span>** KITCHEN COPY — NOT FOR SALE **</span>
        ) : (
          <>
            <div>Thank you for dining with us!</div>
            <div>This is a computer-generated receipt</div>
          </>
        )}
      </div>
    </div>
  );
};

export const ReceiptPreview = ({
  isOpen,
  onClose,
  customerReceipt,
  restaurantCopy,
  kot,
}: ReceiptPreviewProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('customer');

  if (!isOpen) return null;

  const handlePrint = () => window.print();

  const activeData =
    activeTab === 'customer'
      ? customerReceipt
      : activeTab === 'restaurant'
      ? restaurantCopy
      : kot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Dialog header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Receipt Preview</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 text-xs">
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-2.5 font-semibold transition-colors ${activeTab === 'customer' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            Customer Copy
          </button>
          <button
            onClick={() => setActiveTab('restaurant')}
            className={`flex-1 py-2.5 font-semibold transition-colors ${activeTab === 'restaurant' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            Restaurant Copy
          </button>
          <button
            onClick={() => kot && setActiveTab('kot')}
            disabled={!kot}
            className={`flex-1 py-2.5 font-semibold transition-colors ${!kot ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : activeTab === 'kot' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            KOT {!kot && <span className="text-[9px] font-normal block">(No Kitchen Items)</span>}
          </button>
        </div>

        {/* Preview area */}
        <div className="overflow-y-auto max-h-[440px] p-4 bg-gray-100 dark:bg-gray-950 flex justify-center">
          {activeData ? (
            <div id="receipt-print-root" className="shadow-lg border border-gray-200">
              <ReceiptSheet data={activeData} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <div className="text-4xl mb-3">🚫</div>
              <p className="text-xs font-medium">KOT not applicable</p>
              <p className="text-[10px] mt-1">This order contains only packed items — no KOT is required</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-100 dark:border-gray-800">
          <Button onClick={onClose} variant="outline" className="flex-1 h-10 text-xs">
            Close
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!activeData}
            className="flex-1 h-10 text-xs font-bold flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print {activeTab === 'kot' ? 'KOT' : activeTab === 'restaurant' ? 'Restaurant Copy' : 'Receipt'}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ReceiptPreview;
