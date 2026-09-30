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
  // Helper to get a Date object representing the current time in IST but mapped as local time
  // This allows date-fns startOfDay/endOfDay (which use local time, i.e. UTC on server) to work as if the server was in IST.
  private static getISTDate(date: Date = new Date()): Date {
    const istString = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(date); // MM/DD/YYYY, HH:mm:ss
    
    // Parse it back into a local date
    const [datePart, timePart] = istString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hour, min, sec] = timePart.split(':');
    
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min), Number(sec));
  }

  // Convert a local date (which pretends to be IST) back to a real UTC Date object that represents that exact IST moment
  private static toRealUTCDate(fakeISTDate: Date): Date {
    const year = fakeISTDate.getFullYear();
    const month = fakeISTDate.getMonth();
    const day = fakeISTDate.getDate();
    const hour = fakeISTDate.getHours();
    const min = fakeISTDate.getMinutes();
    const sec = fakeISTDate.getSeconds();
    const ms = fakeISTDate.getMilliseconds();
    
    // We have the exact year, month, day, hour, min, sec in IST.
    // IST is UTC+5:30. So we just subtract 5 hours and 30 mins to get the UTC time.
    return new Date(Date.UTC(year, month, day, hour - 5, min - 30, sec, ms));
  }

  public static getDateFilter(dto: AnalyticsQueryDto) {
    const nowIST = this.getISTDate();
    let gteFake: Date;
    let lteFake: Date;

    switch (dto.dateRange) {
      case 'TODAY':
        gteFake = startOfDay(nowIST);
        lteFake = endOfDay(nowIST);
        break;
      case 'YESTERDAY':
        const yesterday = subDays(nowIST, 1);
        gteFake = startOfDay(yesterday);
        lteFake = endOfDay(yesterday);
        break;
      case 'THIS_WEEK':
        gteFake = startOfWeek(nowIST, { weekStartsOn: 1 });
        lteFake = endOfWeek(nowIST, { weekStartsOn: 1 });
        break;
      case 'THIS_MONTH':
        gteFake = startOfMonth(nowIST);
        lteFake = endOfMonth(nowIST);
        break;
      case 'THIS_YEAR':
        gteFake = startOfYear(nowIST);
        lteFake = endOfYear(nowIST);
        break;
      case 'CUSTOM':
        if (!dto.startDate || !dto.endDate) throw new Error('CUSTOM date range requires startDate and endDate');
        // Parse the input YYYY-MM-DD strings directly as local time to mimic IST bounds
        const [sYear, sMonth, sDay] = dto.startDate.split('-').map(Number);
        const [eYear, eMonth, eDay] = dto.endDate.split('-').map(Number);
        gteFake = startOfDay(new Date(sYear, sMonth - 1, sDay));
        lteFake = endOfDay(new Date(eYear, eMonth - 1, eDay));
        break;
      default:
        gteFake = startOfDay(nowIST);
        lteFake = endOfDay(nowIST);
    }

    return { 
      gte: this.toRealUTCDate(gteFake), 
      lte: this.toRealUTCDate(lteFake) 
    };
  }

  private static getPreviousDateFilter(dto: AnalyticsQueryDto) {
    const nowIST = this.getISTDate();
    let gteFake: Date;
    let lteFake: Date;

    switch (dto.dateRange) {
      case 'TODAY':
        const yesterday = subDays(nowIST, 1);
        gteFake = startOfDay(yesterday);
        lteFake = endOfDay(yesterday);
        break;
      case 'YESTERDAY':
        const dayBefore = subDays(nowIST, 2);
        gteFake = startOfDay(dayBefore);
        lteFake = endOfDay(dayBefore);
        break;
      case 'THIS_WEEK':
        const lastWeek = subDays(nowIST, 7);
        gteFake = startOfWeek(lastWeek, { weekStartsOn: 1 });
        lteFake = endOfWeek(lastWeek, { weekStartsOn: 1 });
        break;
      case 'THIS_MONTH':
        const lastMonth = subDays(startOfMonth(nowIST), 1);
        gteFake = startOfMonth(lastMonth);
        lteFake = endOfMonth(lastMonth);
        break;
      case 'THIS_YEAR':
        const lastYear = subDays(startOfYear(nowIST), 1);
        gteFake = startOfYear(lastYear);
        lteFake = endOfYear(lastYear);
        break;
      default:
        gteFake = startOfDay(nowIST);
        lteFake = endOfDay(nowIST);
    }

    return { 
      gte: this.toRealUTCDate(gteFake), 
      lte: this.toRealUTCDate(lteFake) 
    };
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
      const istDate = this.getISTDate(o.createdAt);
      const h = istDate.getHours().toString().padStart(2, '0') + ':00';
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
      const istDate = this.getISTDate(o.createdAt);
      const h = istDate.getHours().toString().padStart(2, '0') + ':00';
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
      const istDate = this.getISTDate(p.createdAt);
      if (dto.dateRange === 'TODAY' || dto.dateRange === 'YESTERDAY') {
        trendKey = istDate.getHours().toString().padStart(2, '0') + ':00';
      } else {
        // Build YYYY-MM-DD from istDate
        const y = istDate.getFullYear();
        const m = (istDate.getMonth() + 1).toString().padStart(2, '0');
        const d = istDate.getDate().toString().padStart(2, '0');
        trendKey = `${y}-${m}-${d}`;
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
      
      const printers = await prisma.printer.findMany({ select: { id: true, printerName: true, status: true, location: true } });
      const terminals = await prisma.terminal.findMany({ select: { id: true, terminalName: true, status: true } });
      const cashDrawers = await prisma.cashDrawer.findMany({ select: { id: true, drawerCode: true, status: true, currentBalance: true } });
      const activeShifts = await prisma.cashierShift.findMany({ 
        where: { status: 'OPEN' }, 
        select: { id: true, openingTime: true, terminal: { select: { terminalName: true } }, user: { select: { name: true } } } 
      });
      
      // Get today's token info
      const today = this.toRealUTCDate(startOfDay(this.getISTDate()));
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
