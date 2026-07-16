import prisma from '../../../prisma/client';
import { BadRequestError } from '../../../shared/errors/badRequestError';
import { Prisma } from '@prisma/client';

export class DrawerService {
  static async getDrawerByTerminal(terminalId: string) {
    return prisma.cashDrawer.findUnique({
      where: { terminalId },
    });
  }

  static async openDrawer(drawerId: string, userId: string, reason: string = 'Manual Open') {
    const drawer = await prisma.cashDrawer.findUnique({ where: { id: drawerId } });
    if (!drawer) throw new BadRequestError('Cash drawer not found');

    await prisma.cashDrawer.update({
      where: { id: drawerId },
      data: { status: 'OPEN' },
    });

    await prisma.cashDrawerEvent.create({
      data: {
        cashDrawerId: drawerId,
        userId,
        eventType: 'MANUAL_OPEN',
        reason,
      },
    });
  }

  static async closeDrawer(drawerId: string) {
    const drawer = await prisma.cashDrawer.findUnique({ where: { id: drawerId } });
    if (!drawer) throw new BadRequestError('Cash drawer not found');

    await prisma.cashDrawer.update({
      where: { id: drawerId },
      data: { status: 'CLOSED' },
    });

    await prisma.cashDrawerEvent.create({
      data: {
        cashDrawerId: drawerId,
        eventType: 'CLOSE',
        reason: 'Drawer closed physically',
      },
    });
  }

  static async adjustCash(drawerId: string, userId: string, amount: number, type: 'ADD_CASH' | 'REMOVE_CASH', reason?: string) {
    const drawer = await prisma.cashDrawer.findUnique({ where: { id: drawerId } });
    if (!drawer) throw new BadRequestError('Cash drawer not found');

    const value = new Prisma.Decimal(amount);
    const newBalance = type === 'ADD_CASH' 
      ? drawer.currentBalance.plus(value) 
      : drawer.currentBalance.minus(value);

    if (newBalance.lessThan(0)) {
      throw new BadRequestError('Cannot adjust cash below 0.00');
    }

    await prisma.cashDrawer.update({
      where: { id: drawerId },
      data: { currentBalance: newBalance },
    });

    await prisma.cashDrawerEvent.create({
      data: {
        cashDrawerId: drawerId,
        userId,
        eventType: type,
        amount: value,
        reason,
      },
    });
  }
}
