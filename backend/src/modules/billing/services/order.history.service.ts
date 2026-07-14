import prisma from '../../../prisma/client';
import { AuditAction, OrderStatus } from '@prisma/client';

export class OrderHistoryService {
  /**
   * Returns today's orders for a given cashier (most recent first).
   */
  static async getRecentOrders(cashierId: string, limit = 20) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.order.findMany({
      where: {
        cashierId,
        businessDate: today,
        orderStatus: { not: OrderStatus.CANCELLED },
      },
      include: {
        orderItems: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Returns a single order with all nested details.
   */
  static async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { menuItem: { select: { name: true, itemType: true } } },
        },
        payment: true,
        cashier: { select: { name: true } },
      },
    });

    if (!order) throw new Error(`Order ${orderId} not found`);
    return order;
  }

  /**
   * Cancels an order and logs the action.
   */
  static async cancelOrder(orderId: string, reason: string, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new Error('Order is already cancelled');
    }

    const cancelled = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: AuditAction.CANCEL,
        entity: 'Order',
        entityId: orderId,
        description: `Order ${order.orderNumber} cancelled. Reason: ${reason}`,
      },
    });

    return cancelled;
  }
}
