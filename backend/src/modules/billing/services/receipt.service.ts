import prisma from '../../../prisma/client';
import { AuditAction } from '@prisma/client';

export type PaperSize = '58mm' | '80mm' | 'A4';

export interface ReceiptItem {
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
  businessDate: string;
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
  kot: ReceiptData | null; // null when no kitchen items present
}

export class ReceiptService {
  /**
   * Builds all three receipt types for a given order snapshot.
   * KOT is null when order contains no Kitchen items.
   */
  static buildReceiptBundle(
    orderItems: ReceiptItem[],
    meta: {
      restaurantName: string;
      businessDate: string;
      tokenNumber: number;
      cashierName: string;
      subtotal: number;
      discountAmount: number;
      discountLabel: string;
      gstAmount: number;
      grandTotal: number;
      paymentMethod: string;
      receivedCash: number;
      changeDue: number;
      transactionRef: string;
      paperSize?: PaperSize;
    }
  ): ReceiptBundle {
    const paperSize = meta.paperSize ?? '80mm';
    const orderTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const kitchenItems = orderItems.filter((i) => i.itemType === 'KITCHEN');
    const hasKOT = kitchenItems.length > 0;

    const base = {
      restaurantName: meta.restaurantName,
      businessDate: meta.businessDate,
      tokenNumber: meta.tokenNumber,
      orderTime,
      cashierName: meta.cashierName,
      paperSize,
      hasKOT,
    };

    const customerReceipt: ReceiptData = {
      ...base,
      receiptType: 'CUSTOMER',
      items: orderItems,
      subtotal: meta.subtotal,
      discountLabel: meta.discountLabel,
      discountAmount: meta.discountAmount,
      gstAmount: meta.gstAmount,
      grandTotal: meta.grandTotal,
      paymentMethod: meta.paymentMethod,
      receivedCash: meta.receivedCash,
      changeDue: meta.changeDue,
      transactionRef: meta.transactionRef,
    };

    const restaurantCopy: ReceiptData = {
      ...customerReceipt,
      receiptType: 'RESTAURANT',
    };

    const kot: ReceiptData | null = hasKOT
      ? {
          ...base,
          receiptType: 'KOT',
          items: kitchenItems,
        }
      : null;

    return { customerReceipt, restaurantCopy, kot };
  }

  /**
   * Logs a receipt audit entry for traceability.
   */
  static async logReceiptAudit(
    orderId: string,
    receiptType: string,
    tokenNumber: number,
    userId?: string
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId ?? null,
          action: AuditAction.UPDATE,
          entity: 'Receipt',
          entityId: orderId,
          description: `Receipt printed: ${receiptType} for Token #${tokenNumber}`,
        },
      });
    } catch {
      // Non-blocking – receipt printing must not fail due to audit errors
    }
  }
}
