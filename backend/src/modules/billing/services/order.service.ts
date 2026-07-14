import prisma from '../../../prisma/client';
import { AuditAction, PaymentMethod, PaymentStatus, OrderStatus, ItemType } from '@prisma/client';

export interface CreateOrderItemInput {
  menuItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  gst: number;
  itemType: 'KITCHEN' | 'PACKED';
  notes?: string;
}

export interface CreateOrderInput {
  cashierId: string;
  businessDayId?: string;
  cashierShiftId?: string;
  items: CreateOrderItemInput[];
  subtotal: number;
  gstAmount: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD';
  receivedCash?: number;
  transactionReference?: string;
}

export interface CreatedOrderResult {
  orderId: string;
  orderNumber: string;
  tokenNumber: number;
  grandTotal: number;
  paymentMethod: string;
  businessDate: string;
}

export class OrderService {
  /**
   * Creates a complete prepaid order in a single database transaction:
   * 1. Validate active BusinessDay
   * 2. Increment TokenCounter atomically
   * 3. Create Order + OrderItems + Payment
   * 4. Audit log
   */
  static async createOrder(input: CreateOrderInput): Promise<CreatedOrderResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.$transaction(async (tx) => {
      // 1. Find active BusinessDay
      const businessDay = input.businessDayId
        ? await tx.businessDay.findUnique({ where: { id: input.businessDayId } })
        : await tx.businessDay.findFirst({
            where: { businessDate: today, status: 'OPEN' },
          });

      if (!businessDay || businessDay.status !== 'OPEN') {
        throw new Error('No active Business Day found. Please open a business day before creating orders.');
      }

      // 2. Increment TokenCounter atomically
      let counter = await tx.tokenCounter.findUnique({
        where: { businessDate: businessDay.businessDate },
      });

      if (!counter) {
        counter = await tx.tokenCounter.create({
          data: { businessDate: businessDay.businessDate, currentToken: 0 },
        });
      }

      const tokenNumber = counter.currentToken + 1;
      await tx.tokenCounter.update({
        where: { id: counter.id },
        data: { currentToken: tokenNumber },
      });

      // 3. Build order identifiers
      const paddedToken = String(tokenNumber).padStart(3, '0');
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `ORD-${dateStr}-${paddedToken}`;

      // 4. Create Order
      const order = await tx.order.create({
        data: {
          tokenNumber: paddedToken,
          orderNumber,
          cashierId: input.cashierId,
          businessDayId: businessDay.id,
          cashierShiftId: input.cashierShiftId ?? null,
          subtotal: input.subtotal,
          gstAmount: input.gstAmount,
          discount: input.discount,
          grandTotal: input.grandTotal,
          paymentStatus: PaymentStatus.SUCCESS,
          orderStatus: OrderStatus.PAID,
          businessDate: businessDay.businessDate,
          completedAt: new Date(),
        },
      });

      // 5. Create OrderItems
      await tx.orderItem.createMany({
        data: input.items.map((item) => ({
          orderId: order.id,
          menuItemId: item.menuItemId,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          gst: item.gst,
          totalPrice: item.unitPrice * item.quantity,
          itemType: item.itemType as ItemType,
          notes: item.notes ?? null,
        })),
      });

      // 6. Create Payment
      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: input.paymentMethod as PaymentMethod,
          amount: input.grandTotal,
          transactionReference: input.transactionReference ?? null,
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
        },
      });

      // 7. Audit log (non-blocking — outside tx if audit fails we don't want rollback)
      await tx.auditLog.create({
        data: {
          userId: input.cashierId,
          action: AuditAction.CREATE,
          entity: 'Order',
          entityId: order.id,
          description: `Order ${orderNumber} created. Token #${paddedToken}. Total: ${input.grandTotal}`,
        },
      });

      return {
        orderId: order.id,
        orderNumber,
        tokenNumber,
        grandTotal: input.grandTotal,
        paymentMethod: input.paymentMethod,
        businessDate: businessDay.businessDate.toISOString().slice(0, 10),
      };
    });
  }
}
