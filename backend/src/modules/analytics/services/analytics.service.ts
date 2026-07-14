import prisma from '../../../prisma/client';
import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, subDays } from 'date-fns';

export interface AnalyticsQueryDto {
  dateRange: 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  paymentMethod?: string;
  categoryId?: string;
  terminalId?: string;
}

export class AnalyticsService {
  private static getDateFilter(dto: AnalyticsQueryDto) {
    const now = new Date();
    let gte: Date;
    let lte: Date;

    switch (dto.dateRange) {
      case 'TODAY':
        gte = startOfDay(now);
        lte = endOfDay(now);
        break;
      case 'YESTERDAY':
        const yesterday = subDays(now, 1);
        gte = startOfDay(yesterday);
        lte = endOfDay(yesterday);
        break;
      case 'THIS_WEEK':
        gte = startOfWeek(now, { weekStartsOn: 1 });
        lte = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'THIS_MONTH':
        gte = startOfMonth(now);
        lte = endOfMonth(now);
        break;
      case 'THIS_YEAR':
        gte = startOfYear(now);
        lte = endOfYear(now);
        break;
      case 'CUSTOM':
        if (!dto.startDate || !dto.endDate) throw new Error('CUSTOM date range requires startDate and endDate');
        gte = startOfDay(parseISO(dto.startDate));
        lte = endOfDay(parseISO(dto.endDate));
        break;
      default:
        gte = startOfDay(now);
        lte = endOfDay(now);
    }

    return { gte, lte };
  }

  private static getPreviousDateFilter(dto: AnalyticsQueryDto) {
    const now = new Date();
    let gte: Date;
    let lte: Date;

    switch (dto.dateRange) {
      case 'TODAY':
        const yesterday = subDays(now, 1);
        gte = startOfDay(yesterday);
        lte = endOfDay(yesterday);
        break;
      case 'YESTERDAY':
        const dayBefore = subDays(now, 2);
        gte = startOfDay(dayBefore);
        lte = endOfDay(dayBefore);
        break;
      case 'THIS_WEEK':
        const lastWeek = subDays(now, 7);
        gte = startOfWeek(lastWeek, { weekStartsOn: 1 });
        lte = endOfWeek(lastWeek, { weekStartsOn: 1 });
        break;
      case 'THIS_MONTH':
        const lastMonth = subDays(startOfMonth(now), 1);
        gte = startOfMonth(lastMonth);
        lte = endOfMonth(lastMonth);
        break;
      case 'THIS_YEAR':
        const lastYear = subDays(startOfYear(now), 1);
        gte = startOfYear(lastYear);
        lte = endOfYear(lastYear);
        break;
      default:
        gte = startOfDay(now);
        lte = endOfDay(now);
    }

    return { gte, lte };
  }

  static async getSummary(dto: AnalyticsQueryDto) {
    const dateFilter = this.getDateFilter(dto);
    const orderWhere: Prisma.OrderWhereInput = {
      createdAt: dateFilter,
      ...(dto.cashierId && { cashierId: dto.cashierId }),
      ...(dto.terminalId && { terminalId: dto.terminalId }),
      ...(dto.paymentMethod && { payment: { paymentMethod: dto.paymentMethod as any } }),
      orderStatus: { in: ['COMPLETED', 'PAID', 'PRINTED'] } // Count valid orders
    };

    const cancelledWhere: Prisma.OrderWhereInput = {
      ...orderWhere,
      orderStatus: 'CANCELLED'
    };

    // Get basic aggregations
    const aggregations = await prisma.order.aggregate({
      where: orderWhere,
      _sum: { grandTotal: true },
      _count: { id: true },
    });

    const cancelledCount = await prisma.order.count({ where: cancelledWhere });

    const totalSales = aggregations._sum.grandTotal ? Number(aggregations._sum.grandTotal) : 0;
    const totalOrders = aggregations._count.id;
    const aov = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Item Types (Kitchen vs Packed)
    const orderItemWhere: Prisma.OrderItemWhereInput = {
      order: orderWhere,
    };

    const itemTypes = await prisma.orderItem.groupBy({
      by: ['itemType'],
      where: orderItemWhere,
      _sum: { quantity: true }
    });

    let kitchenOrders = 0;
    let packedOrders = 0;
    itemTypes.forEach((t: any) => {
      if (t.itemType === 'KITCHEN') kitchenOrders = t._sum.quantity || 0;
      if (t.itemType === 'PACKED') packedOrders = t._sum.quantity || 0;
    });

    // Get System Health (Always real-time, independent of date filter)
    const activeCashiers = await prisma.cashierShift.count({ where: { status: 'OPEN' } });
    const currentShift = await prisma.cashierShift.findFirst({ where: { status: 'OPEN' }, orderBy: { createdAt: 'desc' } });
    const businessDay = await prisma.businessDay.findFirst({ orderBy: { businessDate: 'desc' } });

    return {
      todaySales: totalSales,
      todayOrders: totalOrders,
      averageOrderValue: aov,
      kitchenOrders,
      packedOrders,
      cancelledOrders: cancelledCount,
      activeCashiers,
      currentShiftStatus: currentShift?.status || 'CLOSED',
      businessDayStatus: businessDay?.status || 'CLOSED'
    };
  }

  static async getSalesTrends(dto: AnalyticsQueryDto) {
    // For simplicity, we fetch all valid orders in range and group in memory by hour
    // A more complex query could use raw SQL DATE_TRUNC, but in-memory is fine for daily ranges
    const dateFilter = this.getDateFilter(dto);
    const orders = await prisma.order.findMany({
      where: {
        createdAt: dateFilter,
        ...(dto.cashierId && { cashierId: dto.cashierId }),
        orderStatus: { in: ['COMPLETED', 'PAID', 'PRINTED'] }
      },
      select: { createdAt: true, grandTotal: true }
    });

    // Grouping by hour
    const hourlyData: Record<string, { sales: number, orders: number }> = {};
    for (let i = 0; i < 24; i++) {
      const hourStr = i.toString().padStart(2, '0') + ':00';
      hourlyData[hourStr] = { sales: 0, orders: 0 };
    }

    orders.forEach((o: any) => {
      const h = o.createdAt.getHours().toString().padStart(2, '0') + ':00';
      hourlyData[h].sales += Number(o.grandTotal);
      hourlyData[h].orders += 1;
    });

    return Object.keys(hourlyData).map(k => ({
      label: k,
      sales: hourlyData[k].sales,
      orders: hourlyData[k].orders
    }));
  }

  static async getOrderDistribution(dto: AnalyticsQueryDto) {
    const dateFilter = this.getDateFilter(dto);
    
    // Payments grouping
    const payments = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: dateFilter,
        status: 'SUCCESS',
        order: { ...(dto.cashierId && { cashierId: dto.cashierId }) }
      },
      _sum: { amount: true }
    });

    const paymentMap: Record<string, number> = { CASH: 0, UPI: 0, CARD: 0 };
    payments.forEach((p: any) => {
      paymentMap[p.paymentMethod] = Number(p._sum.amount || 0);
    });

    // Item types distribution
    const items = await prisma.orderItem.groupBy({
      by: ['itemType'],
      where: {
        createdAt: dateFilter,
        order: {
          orderStatus: { in: ['COMPLETED', 'PAID', 'PRINTED'] },
          ...(dto.cashierId && { cashierId: dto.cashierId })
        }
      },
      _sum: { quantity: true }
    });

    const typeMap: Record<string, number> = { KITCHEN: 0, PACKED: 0 };
    items.forEach((i: any) => {
      typeMap[i.itemType] = Number(i._sum.quantity || 0);
    });

    return { payments: paymentMap, types: typeMap };
  }

  static async getMenuPerformance(dto: AnalyticsQueryDto) {
    const dateFilter = this.getDateFilter(dto);
    
    // Group by item
    const itemStats = await prisma.orderItem.groupBy({
      by: ['menuItemId', 'itemName', 'itemType'],
      where: {
        createdAt: dateFilter,
        order: {
          orderStatus: { in: ['COMPLETED', 'PAID', 'PRINTED'] },
          ...(dto.cashierId && { cashierId: dto.cashierId })
        }
      },
      _sum: { quantity: true, totalPrice: true },
    });

    // Fetch all menu items to get categories
    const menuItems = await prisma.menuItem.findMany({
      select: { id: true, category: { select: { name: true } } }
    });
    
    const categoryMap: Record<string, string> = {};
    menuItems.forEach((m: any) => categoryMap[m.id] = m.category.name);

    const formatted = itemStats.map((s: any) => ({
      id: s.menuItemId,
      name: s.itemName,
      itemType: s.itemType,
      category: categoryMap[s.menuItemId] || 'Unknown',
      qty: s._sum.quantity || 0,
      revenue: Number(s._sum.totalPrice || 0)
    }));

    // Sort by quantity for top/least
    const byQty = [...formatted].sort((a, b) => b.qty - a.qty);
    // Sort by revenue
    const byRev = [...formatted].sort((a, b) => b.revenue - a.revenue);

    // Group by category
    const catStats: Record<string, { qty: number, revenue: number }> = {};
    formatted.forEach((f: any) => {
      if (!catStats[f.category]) catStats[f.category] = { qty: 0, revenue: 0 };
      catStats[f.category].qty += f.qty;
      catStats[f.category].revenue += f.revenue;
    });

    const categoryPerformance = Object.keys(catStats).map(k => ({
      name: k,
      qty: catStats[k].qty,
      revenue: catStats[k].revenue
    })).sort((a, b) => b.revenue - a.revenue);

    return {
      all: formatted,
      topItems: byQty.slice(0, 10),
      leastItems: [...byQty].reverse().slice(0, 10).filter(i => i.qty > 0), // Only items that sold at least 1, otherwise it's just 0s
      highestRevenue: byRev.slice(0, 10),
      categoryPerformance
    };
  }

  static async getSalesMetrics(dto: AnalyticsQueryDto) {
    const currentRange = this.getDateFilter(dto);
    const prevRange = this.getPreviousDateFilter(dto);

    const getStats = async (range: { gte: Date, lte: Date }) => {
      const agg = await prisma.order.aggregate({
        where: {
          createdAt: range,
          ...(dto.cashierId && { cashierId: dto.cashierId }),
          orderStatus: { in: ['COMPLETED', 'PAID', 'PRINTED'] }
        },
        _sum: { grandTotal: true },
        _count: { id: true }
      });
      const sales = agg._sum.grandTotal ? Number(agg._sum.grandTotal) : 0;
      const orders = agg._count.id;
      return { sales, orders, aov: orders > 0 ? sales / orders : 0 };
    };

    const [current, prev] = await Promise.all([
      getStats(currentRange),
      getStats(prevRange)
    ]);

    const calculateTrend = (curr: number, prior: number) => {
      if (prior === 0) return { value: curr > 0 ? 100 : 0, isPositive: curr >= 0 };
      const diff = curr - prior;
      const pct = (diff / prior) * 100;
      return { value: Number(Math.abs(pct).toFixed(1)), isPositive: pct >= 0 };
    };

    return {
      sales: { current: current.sales, trend: calculateTrend(current.sales, prev.sales) },
      orders: { current: current.orders, trend: calculateTrend(current.orders, prev.orders) },
      aov: { current: current.aov, trend: calculateTrend(current.aov, prev.aov) }
    };
  }

  static async getPeakHours(dto: AnalyticsQueryDto) {
    const dateFilter = this.getDateFilter(dto);
    const orders = await prisma.order.findMany({
      where: {
        createdAt: dateFilter,
        ...(dto.cashierId && { cashierId: dto.cashierId }),
        orderStatus: { in: ['COMPLETED', 'PAID', 'PRINTED'] }
      },
      select: { createdAt: true }
    });

    const hourlyCounts: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyCounts[i.toString().padStart(2, '0') + ':00'] = 0;
    }

    orders.forEach((o: any) => {
      const h = o.createdAt.getHours().toString().padStart(2, '0') + ':00';
      hourlyCounts[h]++;
    });

    return Object.keys(hourlyCounts).map(k => ({
      hour: k,
      orders: hourlyCounts[k]
    }));
  }

  static async getOrderMetrics(dto: AnalyticsQueryDto) {
    const dateFilter = this.getDateFilter(dto);
    const orderWhere: Prisma.OrderWhereInput = {
      createdAt: dateFilter,
      ...(dto.cashierId && { cashierId: dto.cashierId }),
    };

    const orders = await prisma.order.findMany({
      where: orderWhere,
      select: {
        id: true,
        orderStatus: true,
        createdAt: true,
        completedAt: true,
        orderItems: { select: { itemType: true, quantity: true } }
      }
    });

    let total = orders.length;
    let completed = 0;
    let cancelled = 0;
    let kitchenItems = 0;
    let packedItems = 0;
    let totalPrepTimeMs = 0; // mocked via completedAt - createdAt for now

    orders.forEach((o: any) => {
      if (o.orderStatus === 'COMPLETED' || o.orderStatus === 'PAID') completed++;
      if (o.orderStatus === 'CANCELLED') cancelled++;
      
      o.orderItems.forEach((i: any) => {
        if (i.itemType === 'KITCHEN') kitchenItems += i.quantity;
        if (i.itemType === 'PACKED') packedItems += i.quantity;
      });

      if (o.completedAt && o.createdAt) {
        totalPrepTimeMs += (o.completedAt.getTime() - o.createdAt.getTime());
      }
    });

    const avgPrepTimeMin = completed > 0 && totalPrepTimeMs > 0 
      ? (totalPrepTimeMs / completed) / 60000 
      : 0;

    return {
      totalOrders: total,
      completedOrders: completed,
      cancelledOrders: cancelled,
      kitchenItems,
      packedItems,
      avgPrepTimeMin: Number(avgPrepTimeMin.toFixed(1)),
      avgBillingTimeMin: Number(avgPrepTimeMin.toFixed(1)) // Using same for now since we don't have distinct stages logged
    };
  }

  static async getCashierPerformance(dto: AnalyticsQueryDto) {
    const dateFilter = this.getDateFilter(dto);
    
    const orders = await prisma.order.findMany({
      where: {
        createdAt: dateFilter,
        orderStatus: { in: ['COMPLETED', 'PAID', 'PRINTED'] },
        ...(dto.cashierId && { cashierId: dto.cashierId }),
        ...(dto.terminalId && { terminalId: dto.terminalId })
      },
      select: {
        grandTotal: true,
        createdAt: true,
        completedAt: true,
        cashier: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    const cashierMap: Record<string, { id: string; name: string; sales: number; orders: number; prepTimeMs: number }> = {};

    orders.forEach((o: any) => {
      const cid = o.cashier.id;
      if (!cashierMap[cid]) {
        cashierMap[cid] = { id: cid, name: o.cashier.name, sales: 0, orders: 0, prepTimeMs: 0 };
      }
      cashierMap[cid].sales += Number(o.grandTotal || 0);
      cashierMap[cid].orders += 1;
      if (o.completedAt && o.createdAt) {
        cashierMap[cid].prepTimeMs += (o.completedAt.getTime() - o.createdAt.getTime());
      }
    });

    const performance = Object.values(cashierMap).map((c) => {
      const avgBillingTime = c.orders > 0 && c.prepTimeMs > 0 ? (c.prepTimeMs / c.orders) / 60000 : 0;
      const aov = c.orders > 0 ? c.sales / c.orders : 0;
      
      return {
        id: c.id,
        name: c.name,
        ordersProcessed: c.orders,
        salesAmount: c.sales,
        avgBillingTimeMin: Number(avgBillingTime.toFixed(1)),
        avgOrderValue: Number(aov.toFixed(2))
      };
    }).sort((a, b) => b.salesAmount - a.salesAmount);

    return performance;
  }

  static async getPaymentMetrics(dto: AnalyticsQueryDto) {
    const dateFilter = this.getDateFilter(dto);
    
    // Group payments by method for distribution
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: dateFilter,
        status: 'SUCCESS',
        order: { ...(dto.cashierId && { cashierId: dto.cashierId }) }
      },
      select: {
        paymentMethod: true,
        amount: true,
        createdAt: true
      }
    });

    const distributionMap: Record<string, number> = { CASH: 0, UPI: 0, CARD: 0 };
    const trendMap: Record<string, { date: string; CASH: number; UPI: number; CARD: number; total: number }> = {};

    payments.forEach((p: any) => {
      const amount = Number(p.amount);
      const method = p.paymentMethod;
      
      // Update distribution
      if (distributionMap[method] !== undefined) {
        distributionMap[method] += amount;
      }

      // Update trend based on date (format YYYY-MM-DD or simple Date string)
      // For a single day view (TODAY), grouping by Hour is better. For Week/Month, group by Day.
      let trendKey = '';
      if (dto.dateRange === 'TODAY' || dto.dateRange === 'YESTERDAY') {
        trendKey = p.createdAt.getHours().toString().padStart(2, '0') + ':00';
      } else {
        trendKey = p.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      if (!trendMap[trendKey]) {
        trendMap[trendKey] = { date: trendKey, CASH: 0, UPI: 0, CARD: 0, total: 0 };
      }
      
      if (trendMap[trendKey][method as 'CASH' | 'UPI' | 'CARD'] !== undefined) {
        trendMap[trendKey][method as 'CASH' | 'UPI' | 'CARD'] += amount;
      }
      trendMap[trendKey].total += amount;
    });

    const distribution = Object.keys(distributionMap).map(k => ({
      name: k,
      value: distributionMap[k]
    }));

    // For Trend, if TODAY, fill missing hours
    if (dto.dateRange === 'TODAY' || dto.dateRange === 'YESTERDAY') {
      for (let i = 0; i < 24; i++) {
        const h = i.toString().padStart(2, '0') + ':00';
        if (!trendMap[h]) {
          trendMap[h] = { date: h, CASH: 0, UPI: 0, CARD: 0, total: 0 };
        }
      }
    }

    const trend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      distribution,
      trend
    };
  }

  static async getSystemHealth() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const dbStatus = 'UP';
      
      const printers = await prisma.printer.findMany({ select: { id: true, name: true, status: true, location: true } });
      const terminals = await prisma.terminal.findMany({ select: { id: true, terminalName: true, status: true } });
      const cashDrawers = await prisma.cashDrawer.findMany({ select: { id: true, drawerCode: true, status: true, currentBalance: true } });
      const activeShifts = await prisma.cashierShift.findMany({ 
        where: { status: 'OPEN' }, 
        select: { id: true, openingTime: true, terminal: { select: { terminalName: true } }, user: { select: { name: true } } } 
      });
      
      // Get today's token info
      const today = startOfDay(new Date());
      const tokenCounter = await prisma.tokenCounter.findFirst({ where: { businessDate: today } });
      const businessDay = await prisma.businessDay.findFirst({ orderBy: { businessDate: 'desc' } });

      return {
        serverStatus: 'UP',
        dbStatus,
        uptimeSeconds: process.uptime(),
        heartbeat: new Date().toISOString(),
        businessDayStatus: businessDay?.status || 'CLOSED',
        printers,
        terminals,
        cashDrawers,
        activeShifts,
        tokens: {
          current: tokenCounter?.currentToken || 0
        }
      };
    } catch (e) {
      return { 
        serverStatus: 'UP',
        dbStatus: 'DOWN', 
        uptimeSeconds: process.uptime(),
        heartbeat: new Date().toISOString(),
        businessDayStatus: 'UNKNOWN',
        printers: [], 
        terminals: [], 
        cashDrawers: [],
        activeShifts: [],
        tokens: { current: 0 } 
      };
    }
  }
}
