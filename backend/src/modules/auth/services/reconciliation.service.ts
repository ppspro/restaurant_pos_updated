import prisma from '../../../prisma/client';
import { BadRequestError } from '../../../shared/errors/badRequestError';
import { PaymentStatus, OrderStatus } from '@prisma/client';

export class ReconciliationService {
  static async getShiftSummary(shiftId: string) {
    const shift = await prisma.cashierShift.findUnique({
      where: { id: shiftId },
      include: { terminal: true },
    });

    if (!shift) {
      throw new BadRequestError('Cashier shift not found');
    }

    // Orders in this shift
    const orders = await prisma.order.findMany({
      where: { cashierShiftId: shift.id },
      include: { payment: true },
    });

    const activeOrders = orders.filter((o) => o.orderStatus !== OrderStatus.CANCELLED);
    const cancelledOrdersCount = orders.length - activeOrders.length;

    // Sales calculations
    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    let refunds = 0;

    for (const order of orders) {
      if (order.orderStatus === OrderStatus.CANCELLED) continue;

      if (order.paymentStatus === PaymentStatus.SUCCESS && order.payment) {
        const method = order.payment.paymentMethod;
        const amount = Number(order.grandTotal);
        if (method === 'CASH') cashSales += amount;
        else if (method === 'UPI') upiSales += amount;
        else if (method === 'CARD') cardSales += amount;
      } else if (order.paymentStatus === PaymentStatus.REFUNDED) {
        refunds += Number(order.grandTotal);
      }
    }

    const openingCash = Number(shift.openingCash);
    const expectedClosingCash = openingCash + cashSales - refunds;

    return {
      shiftId: shift.id,
      terminalCode: shift.terminal.terminalCode,
      openingTime: shift.openingTime,
      closingTime: shift.closingTime,
      totalOrders: orders.length,
      cancelledOrders: cancelledOrdersCount,
      cashSales,
      upiSales,
      cardSales,
      refunds,
      openingCash,
      expectedClosingCash,
      status: shift.status,
    };
  }
}
