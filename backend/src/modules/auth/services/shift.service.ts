import prisma from '../../../prisma/client';
import { BadRequestError } from '../../../shared/errors/badRequestError';
import { BusinessDayService } from './businessDay.service';
import { TerminalService } from './terminal.service';
import { Prisma, PaymentStatus } from '@prisma/client';

export class ShiftService {
  static async getCurrentShift(userId: string) {
    return prisma.cashierShift.findFirst({
      where: { userId, status: 'OPEN' },
      include: { terminal: true },
    });
  }

  static async openShift(userId: string, terminalId: string, openingCash: number) {
    // 1. Ensure business day is open
    const activeDay = await BusinessDayService.getActiveBusinessDay();
    if (!activeDay) {
      throw new BadRequestError('Cannot open shift: No active Business Day is currently open.');
    }

    // 2. Ensure user doesn't already have an open shift
    const existingUserShift = await this.getCurrentShift(userId);
    if (existingUserShift) {
      throw new BadRequestError('You already have an active open cashier shift.');
    }

    // 3. Claim Terminal (verifies that terminal is not busy)
    await TerminalService.claimTerminal(terminalId);

    const shift = await prisma.cashierShift.create({
      data: {
        userId,
        terminalId,
        openingCash: new Prisma.Decimal(openingCash),
        status: 'OPEN',
      },
      include: { terminal: true },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'cashier_shift',
          entityId: shift.id,
          userId,
          description: `Cashier "${user.username}" opened shift on Terminal "${shift.terminal.terminalCode}" with ${openingCash} opening cash`,
        },
      });
    }

    return shift;
  }

  static async closeShift(userId: string, closingCash: number, notes?: string) {
    const shift = await prisma.cashierShift.findFirst({
      where: { userId, status: 'OPEN' },
      include: { terminal: true },
    });

    if (!shift) {
      throw new BadRequestError('No active cashier shift found to close.');
    }

    // Compute sales in this shift
    const orders = await prisma.order.findMany({
      where: { cashierShiftId: shift.id, paymentStatus: PaymentStatus.SUCCESS },
      select: { grandTotal: true },
    });

    const salesAmount = orders.reduce((sum, order) => sum + Number(order.grandTotal), 0);
    const expectedCash = Number(shift.openingCash) + salesAmount;
    const difference = closingCash - expectedCash;

    const closedShift = await prisma.cashierShift.update({
      where: { id: shift.id },
      data: {
        status: 'CLOSED',
        closingCash: new Prisma.Decimal(closingCash),
        cashDifference: new Prisma.Decimal(difference),
        closingTime: new Date(),
        notes,
      },
    });

    // Release terminal status
    await TerminalService.releaseTerminal(shift.terminalId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entity: 'cashier_shift',
          entityId: shift.id,
          userId,
          description: `Cashier "${user.username}" closed shift. Cash difference: ${difference}`,
        },
      });
    }

    return closedShift;
  }
}
