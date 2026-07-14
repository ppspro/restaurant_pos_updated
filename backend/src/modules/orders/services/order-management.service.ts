import prisma from '../../../prisma/client';
import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export interface OrderFilterDto {
  page?: number;
  limit?: number;
  dateRange?: string; // 'TODAY', 'YESTERDAY', 'THIS_WEEK', 'THIS_MONTH', 'CUSTOM'
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  terminalId?: string;
  status?: string; // 'COMPLETED', 'CANCELLED', 'PENDING'
  search?: string; // Token or Order Number
}

export class OrderManagementService {
  
  private static getDateFilter(dto: OrderFilterDto) {
    const now = new Date();
    let gte: Date;
    let lte: Date;

    if (dto.dateRange === 'CUSTOM' && dto.startDate && dto.endDate) {
       gte = startOfDay(parseISO(dto.startDate));
       lte = endOfDay(parseISO(dto.endDate));
    } else {
       gte = startOfDay(now);
       lte = endOfDay(now);
    }
    return { gte, lte };
  }

  static async getOrderHistory(dto: OrderFilterDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 20;
    const skip = (page - 1) * limit;

    const dateFilter = this.getDateFilter(dto);

    const where: Prisma.OrderWhereInput = {
      createdAt: dateFilter,
      ...(dto.cashierId && { cashierId: dto.cashierId }),
      ...(dto.status && { orderStatus: dto.status as any }),
      ...(dto.search && {
        OR: [
          { tokenNumber: { contains: dto.search, mode: 'insensitive' } },
          { orderNumber: { contains: dto.search, mode: 'insensitive' } }
        ]
      })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cashier: { select: { name: true } },
          payment: { select: { status: true, paymentMethod: true } },
          _count: { select: { orderItems: true } }
        }
      }),
      prisma.order.count({ where })
    ]);

    return {
      data: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        tokenNumber: o.tokenNumber,
        status: o.orderStatus,
        paymentStatus: o.payment?.status,
        paymentMethod: o.payment?.paymentMethod,
        items: o._count.orderItems,
        total: Number(o.grandTotal),
        cashier: o.cashier.name,
        time: o.createdAt.toISOString()
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getOrderDetails(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        cashier: { select: { name: true } },
        payment: true,
        orderItems: {
          include: {
            menuItem: { select: { name: true, categoryId: true } }
          }
        },
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  static async cancelOrder(id: string, reason: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { payment: true } });
      if (!order) throw new Error('Order not found');
      if (order.orderStatus === 'CANCELLED') throw new Error('Order is already cancelled');

      // Update Order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          orderStatus: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      // Update Payment if exists
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: 'REFUNDED' }
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CANCEL',
          entity: 'ORDER',
          entityId: order.id,
          description: `Order cancelled. Reason: ${reason}`
        }
      });

      return updatedOrder;
    });
  }

  static async reprintOrder(id: string, type: 'RECEIPT' | 'KOT', userId: string) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error('Order not found');

    // In a real system, we would push to a Redis/RabbitMQ queue here.
    // For now, we simulate the audit and successful print.

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PRINT',
        entity: 'ORDER',
        entityId: order.id,
        description: `Reprinted ${type} for Order #${order.orderNumber}`
      }
    });

    return { success: true, message: `${type} sent to printer` };
  }
}
