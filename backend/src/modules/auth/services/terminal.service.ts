import prisma from '../../../prisma/client';
import { BadRequestError } from '../../../shared/errors/badRequestError';

export class TerminalService {
  static async list() {
    return prisma.terminal.findMany({
      orderBy: { terminalCode: 'asc' },
    });
  }

  static async claimTerminal(terminalId: string, deviceId?: string) {
    const terminal = await prisma.terminal.findUnique({
      where: { id: terminalId },
    });

    if (!terminal) {
      throw new BadRequestError('Terminal not found');
    }

    // Check if terminal is already claimed by someone else
    const activeShift = await prisma.cashierShift.findFirst({
      where: { terminalId, status: 'OPEN' },
    });

    if (activeShift) {
      throw new BadRequestError('Terminal is currently claimed by another active cashier shift');
    }

    return prisma.terminal.update({
      where: { id: terminalId },
      data: {
        status: 'BUSY',
        deviceId,
        lastHeartbeat: new Date(),
      },
    });
  }

  static async releaseTerminal(terminalId: string) {
    return prisma.terminal.update({
      where: { id: terminalId },
      data: {
        status: 'ONLINE',
        deviceId: null,
      },
    });
  }

  static async updateHeartbeat(terminalId: string) {
    return prisma.terminal.update({
      where: { id: terminalId },
      data: {
        lastHeartbeat: new Date(),
      },
    });
  }
}
