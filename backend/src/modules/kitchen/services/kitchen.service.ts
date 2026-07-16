import prisma from '../../../prisma/client';
import { OrderStatus } from '@prisma/client';

export class KitchenService {
  /**
   * Fetch all active orders that contain at least one KITCHEN item.
   * Excludes completed or cancelled orders.
   */
  static async getActiveQueue() {
    const orders = await prisma.order.findMany({
      where: {
        orderStatus: {
          in: [OrderStatus.PAID, OrderStatus.PREPARING, OrderStatus.READY]
        },
        orderItems: {
          some: {
            itemType: 'KITCHEN'
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Oldest orders first
      },
      include: {
        orderItems: {
          where: {
            itemType: 'KITCHEN' // Only return kitchen items to the frontend
          },
          select: {
            id: true,
            itemName: true,
            quantity: true,
            notes: true,
          }
        }
      }
    });

    return orders.map(order => ({
      id: order.id,
      tokenNumber: order.tokenNumber,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      createdAt: order.createdAt,
      items: order.orderItems
    }));
  }

  /**
   * Update the status of an order from the KDS.
   */
  static async updateOrderStatus(id: string, status: OrderStatus, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new Error('Order not found');

      const dataToUpdate: any = { orderStatus: status };
      
      if (status === OrderStatus.COMPLETED) {
        dataToUpdate.completedAt = new Date();
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: dataToUpdate
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'ORDER',
          entityId: id,
          description: `KDS marked order ${order.tokenNumber} as ${status}`
        }
      });

      return updatedOrder;
    });
  }

  /**
   * Get basic kitchen performance analytics.
   */
  static async getKitchenAnalytics() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const completedOrders = await prisma.order.findMany({
      where: {
        orderStatus: OrderStatus.COMPLETED,
        createdAt: { gte: startOfToday },
        completedAt: { not: null },
        orderItems: { some: { itemType: 'KITCHEN' } }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    let totalPrepTimeMs = 0;
    completedOrders.forEach(order => {
      if (order.completedAt) {
        totalPrepTimeMs += (order.completedAt.getTime() - order.createdAt.getTime());
      }
    });

    const averagePrepTimeMs = completedOrders.length > 0 ? (totalPrepTimeMs / completedOrders.length) : 0;
    const averagePrepTimeMinutes = Math.round(averagePrepTimeMs / 60000);

    return {
      completedToday: completedOrders.length,
      averagePrepTimeMinutes
    };
  }
}
