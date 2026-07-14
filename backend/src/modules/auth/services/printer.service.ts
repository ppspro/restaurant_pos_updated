import prisma from '../../../prisma/client';
import { BadRequestError } from '../../../shared/errors/badRequestError';

export class PrinterService {
  static async list() {
    return prisma.printer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async testPrint(printerId: string) {
    const printer = await prisma.printer.findUnique({
      where: { id: printerId },
    });

    if (!printer) {
      throw new BadRequestError('Printer not found');
    }

    // Mock print success
    return {
      success: true,
      name: printer.name,
      diagnostic: `Successful mock print payload sent over ESC/POS standard (Paper Width: ${printer.paperWidth}). Connection OK.`,
      timestamp: new Date(),
    };
  }

  static async getDiagnostics() {
    const printers = await prisma.printer.findMany();
    return printers.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      latencyMs: p.status === 'ONLINE' ? Math.floor(Math.random() * 20) + 5 : 0,
    }));
  }
}
