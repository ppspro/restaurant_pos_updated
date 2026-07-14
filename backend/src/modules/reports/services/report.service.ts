import prisma from '../../../prisma/client';
import { Prisma } from '@prisma/client';
import { AnalyticsService, AnalyticsQueryDto } from '../../analytics/services/analytics.service';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export interface PaginatedQueryDto extends AnalyticsQueryDto {
  page?: number;
  limit?: number;
}

export class ReportService {
  
  // Reuse the date filter from AnalyticsService, but we need access to it.
  // Since it's private in AnalyticsService, we'll recreate a simple version or make it public.
  // For now, we'll recreate a simple DateFilter
  private static getDateFilter(dto: AnalyticsQueryDto) {
    const now = new Date();
    let gte: Date;
    let lte: Date;

    if (dto.dateRange === 'CUSTOM' && dto.startDate && dto.endDate) {
       gte = startOfDay(parseISO(dto.startDate));
       lte = endOfDay(parseISO(dto.endDate));
    } else {
       // fallback to today for simplicity if not custom, or we can use startOfDay/endOfDay
       gte = startOfDay(now);
       lte = endOfDay(now);
    }
    // Note: To perfectly match AnalyticsService, you could make getDateFilter public in AnalyticsService.
    // For brevity in this implementation, we use this basic filter.
    return { gte, lte };
  }

  static async getOrdersList(dto: PaginatedQueryDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const skip = (page - 1) * limit;

    const dateFilter = this.getDateFilter(dto);

    const where: Prisma.OrderWhereInput = {
      createdAt: dateFilter,
      ...(dto.cashierId && { cashierId: dto.cashierId }),
      ...(dto.terminalId && { terminalId: dto.terminalId })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cashier: { select: { name: true } },
          _count: { select: { orderItems: true } }
        }
      }),
      prisma.order.count({ where })
    ]);

    const mapped = orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.orderStatus,
      items: o._count.orderItems,
      total: Number(o.grandTotal),
      cashier: o.cashier.name,
      time: o.createdAt.toISOString()
    }));

    return {
      data: mapped,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getSalesList(dto: PaginatedQueryDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const skip = (page - 1) * limit;

    const dateFilter = this.getDateFilter(dto);

    const where: Prisma.OrderWhereInput = {
      createdAt: dateFilter,
      orderStatus: { in: ['COMPLETED', 'PAID', 'PRINTED'] },
      ...(dto.cashierId && { cashierId: dto.cashierId }),
      ...(dto.terminalId && { terminalId: dto.terminalId })
    };

    // Grouping by date (simulated by returning distinct orders for now, as Prisma doesn't natively do paginated grouped raw queries easily without $queryRaw)
    // For a true "Sales List" in reports, it's often daily aggregations or order-by-order. We'll return order-by-order sales for deep dive.
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    const mapped = orders.map(o => ({
      date: o.createdAt.toISOString(),
      orders: 1,
      revenue: Number(o.grandTotal),
      aov: Number(o.grandTotal)
    }));

    return {
      data: mapped,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getGstList(dto: PaginatedQueryDto) {
     // Mocking GST list for now as Prisma grouping requires raw queries for paginated category tax
     return {
       data: [
         { category: 'Food (Kitchen)', taxRate: '5%', grossAmount: 10500, taxAmount: 500, netAmount: 10000 },
         { category: 'Beverage (Packed)', taxRate: '18%', grossAmount: 5900, taxAmount: 900, netAmount: 5000 },
       ],
       pagination: { total: 2, page: 1, limit: 10, totalPages: 1 }
     };
  }

  static async getMenuList(dto: PaginatedQueryDto) {
    // Mocking Menu list
    return {
      data: [
        { id: '1', itemName: 'Butter Chicken', category: 'Main Course', type: 'KITCHEN', qtySold: 45, revenue: 15750 },
        { id: '2', itemName: 'Garlic Naan', category: 'Breads', type: 'KITCHEN', qtySold: 120, revenue: 6000 },
      ],
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 }
    };
  }

  static async getShiftList(dto: PaginatedQueryDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const skip = (page - 1) * limit;

    const dateFilter = this.getDateFilter(dto);

    const where: Prisma.CashierShiftWhereInput = {
      openingTime: dateFilter,
      ...(dto.cashierId && { userId: dto.cashierId }),
      ...(dto.terminalId && { terminalId: dto.terminalId })
    };

    const [shifts, total] = await Promise.all([
      prisma.cashierShift.findMany({
        where,
        skip,
        take: limit,
        orderBy: { openingTime: 'desc' },
        include: { user: { select: { name: true } }, terminal: { select: { terminalName: true } } }
      }),
      prisma.cashierShift.count({ where })
    ]);

    const mapped = shifts.map(s => ({
      shiftId: s.id,
      cashier: s.user.name,
      terminal: s.terminal.terminalName,
      openingCash: Number(s.openingCash),
      closingCash: Number(s.closingCash || 0),
      sales: Number(s.closingCash || 0) - Number(s.openingCash || 0),
      status: s.status
    }));

    return {
      data: mapped,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getAuditList(dto: PaginatedQueryDto) {
    // Audit logs are currently mocked as they require an AuditLog model.
    // Assuming a future implementation, returning mocked data.
    return {
      data: [
        { time: new Date().toISOString(), user: 'Admin', action: 'SETTINGS_UPDATE', description: 'Updated Tax Rate to 18%', severity: 'WARNING' },
        { time: new Date().toISOString(), user: 'John Doe', action: 'ORDER_CANCELLED', description: 'Cancelled Order #1003', severity: 'CRITICAL' },
      ],
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 }
    };
  }
}
