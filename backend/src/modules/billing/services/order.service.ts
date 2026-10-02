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
  idempotencyKey?: string;
}

export interface CreatedOrderResult {
  orderId: string;
  orderNumber: string;
  tokenNumber: number;
  grandTotal: number;
  paymentMethod: string;
  businessDate: string;
  orderTime: string;
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
    if (input.idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { payment: true }
      });
      if (existingOrder) {
        return {
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          tokenNumber: parseInt(existingOrder.tokenNumber, 10),
          grandTotal: Number(existingOrder.grandTotal),
          paymentMethod: existingOrder.payment?.paymentMethod || 'CASH',
          businessDate: existingOrder.businessDate.toISOString().slice(0, 10),
          orderTime: existingOrder.createdAt.toISOString(),
        };
      }
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Find active BusinessDay
      const now = new Date();
      const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

      const businessDay = input.businessDayId
        ? await tx.businessDay.findUnique({ where: { id: input.businessDayId } })
        : await tx.businessDay.findFirst({
            where: { status: 'OPEN' },
            orderBy: { openedAt: 'desc' },
          });

      if (!businessDay || businessDay.status !== 'OPEN') {
        throw new Error('No active Business Day found. Please open a business day before creating orders.');
      }

      // 2. Increment TokenCounter atomically with row-level lock (FOR UPDATE)
      let counter: { id: string; businessDate: Date; currentToken: number } | null = null;
      
      const rawCounters = await tx.$queryRaw<Array<{ id: string; businessDate: Date; currentToken: number }>>`
        SELECT "id", "businessDate", "currentToken" 
        FROM "token_counters" 
        WHERE "businessDate" = ${businessDay.businessDate} 
        LIMIT 1 
        FOR UPDATE
      `;
      counter = rawCounters[0] || null;

      if (!counter) {
        // Attempt to create. Since table has @@unique([businessDate]), concurrent inserts will serialize or fail gracefully.
        try {
          counter = await tx.tokenCounter.create({
            data: { businessDate: businessDay.businessDate, currentToken: 0 },
          });
          // Re-lock the newly created row
          await tx.$executeRaw`
            SELECT "id" FROM "token_counters" WHERE "id" = ${counter.id}::uuid FOR UPDATE
          `;
        } catch (e) {
          // If a race occurred and row was inserted, fetch and lock it
          const rawReload = await tx.$queryRaw<Array<{ id: string; businessDate: Date; currentToken: number }>>`
            SELECT "id", "businessDate", "currentToken" 
            FROM "token_counters" 
            WHERE "businessDate" = ${businessDay.businessDate} 
            LIMIT 1 
            FOR UPDATE
          `;
          counter = rawReload[0];
        }
      }

      const tokenNumber = counter.currentToken + 1;
      await tx.tokenCounter.update({
        where: { id: counter.id },
        data: { currentToken: tokenNumber },
      });


      // 3. Build order identifiers
      const paddedToken = String(tokenNumber).padStart(3, '0');
      const dateStr = todayUTC.toISOString().slice(0, 10).replace(/-/g, '');
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
          idempotencyKey: input.idempotencyKey ?? null,
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

      // Format the businessDate in Asia/Kolkata timezone to avoid UTC date shifting
      const tzBusinessDate = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Kolkata', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).format(businessDay.businessDate);

      return {
        orderId: order.id,
        orderNumber,
        tokenNumber,
        grandTotal: input.grandTotal,
        paymentMethod: input.paymentMethod,
        businessDate: tzBusinessDate,
        orderTime: order.createdAt.toISOString(),
      };
    });
  }
}
