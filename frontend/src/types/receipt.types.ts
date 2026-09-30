// Shared receipt types (mirrors backend/src/modules/billing/services/receipt.service.ts)
export type PaperSize = '58mm' | '80mm' | 'A4';

export interface ReceiptItem {
  itemNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  itemType: 'KITCHEN' | 'PACKED';
  instructions?: string;
}

export interface ReceiptData {
  receiptType: 'CUSTOMER' | 'RESTAURANT' | 'KOT';
  paperSize: PaperSize;
  restaurantName: string;
  transactionDate: string;
  tokenNumber: number;
  orderTime: string;
  cashierName: string;
  items: ReceiptItem[];
  subtotal?: number;
  discountLabel?: string;
  discountAmount?: number;
  gstAmount?: number;
  grandTotal?: number;
  paymentMethod?: string;
  receivedCash?: number;
  changeDue?: number;
  transactionRef?: string;
  hasKOT: boolean;
}

export interface ReceiptBundle {
  customerReceipt: ReceiptData;
  restaurantCopy: ReceiptData;
  kot: ReceiptData | null;
}
