import prisma from '../../../prisma/client';
import { BadRequestError } from '../../../shared/errors/badRequestError';

export class BusinessDayService {
  static async getActiveBusinessDay() {
    return prisma.businessDay.findFirst({
      where: { status: 'OPEN' },
    });
  }

  static async openBusinessDay(userId: string) {
    const active = await this.getActiveBusinessDay();
    if (active) {
      throw new BadRequestError(`Cannot open a new business day. Date ${active.businessDate.toDateString()} is already open.`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.businessDay.create({
      data: {
        businessDate: today,
        openedBy: userId,
        status: 'OPEN',
      },
    });
  }

  static async closeBusinessDay(userId: string) {
    const active = await this.getActiveBusinessDay();
    if (!active) {
      throw new BadRequestError('No active business day is currently open to close.');
    }

    // Check if there are any open cashier shifts left
    const openShifts = await prisma.cashierShift.count({
      where: { status: 'OPEN' },
    });

    if (openShifts > 0) {
      throw new BadRequestError('Cannot close the business day while cashier shifts are still open.');
    }

    return prisma.businessDay.update({
      where: { id: active.id },
      data: {
        status: 'CLOSED',
        closedBy: userId,
        closedAt: new Date(),
      },
    });
  }
}
