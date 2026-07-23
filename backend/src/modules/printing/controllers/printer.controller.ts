import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../prisma/client';

export const getPrinters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const printers = await prisma.printer.findMany({
      orderBy: { printerName: 'asc' }
    });
    res.json({ success: true, data: printers });
  } catch (error) {
    next(error);
  }
};

export const getPrinterById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const printer = await prisma.printer.findUnique({ where: { id } });
    if (!printer) {
      return res.status(404).json({ success: false, message: 'Printer not found' });
    }
    res.json({ success: true, data: printer });
  } catch (error) {
    next(error);
  }
};

export const createPrinter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      printerName, printerType, ipAddress, port, 
      paperWidth, location, status
    } = req.body;

    // Validate duplicate name
    const existing = await prisma.printer.findFirst({ where: { printerName } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Printer with this name already exists' });
    }

    const printer = await prisma.printer.create({
      data: {
        printerName, printerType, ipAddress, port, 
        paperWidth, location, status
      }
    });

    res.status(201).json({ success: true, data: printer });
  } catch (error) {
    next(error);
  }
};

export const updatePrinter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const {
      printerName, printerType, ipAddress, port, 
      paperWidth, location, status
    } = req.body;

    const existing = await prisma.printer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Printer not found' });
    }

    if (printerName && printerName !== existing.printerName) {
      const duplicate = await prisma.printer.findFirst({ where: { printerName } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Printer with this name already exists' });
      }
    }

    const updated = await prisma.printer.update({
      where: { id },
      data: {
        printerName, printerType, ipAddress, port, 
        paperWidth, location, status
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deletePrinter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.printer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Printer not found' });
    }

    await prisma.printer.delete({ where: { id } });
    res.json({ success: true, message: 'Printer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const testPrint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.printer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Printer not found' });
    }

    // Mock print test implementation
    res.json({ 
      success: true, 
      message: 'Test print sent successfully',
      diagnostic: `Print payload sent to ${existing.printerName} (${existing.ipAddress ? existing.ipAddress : 'Local'})`
    });
  } catch (error) {
    next(error);
  }
};
