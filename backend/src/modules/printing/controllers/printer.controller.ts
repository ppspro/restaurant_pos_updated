import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../prisma/client';

export const getPrinters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const printers = await prisma.printer.findMany({
      orderBy: { name: 'asc' }
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
      name, type, brand, model, connectionType, ipAddress, port, 
      paperWidth, location, terminalId, status, autoPrint, 
      printReceipt, printKOT, printInvoice, notes
    } = req.body;

    // Validate duplicate name
    const existing = await prisma.printer.findFirst({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Printer with this name already exists' });
    }

    const printer = await prisma.printer.create({
      data: {
        name, type, brand, model, connectionType, ipAddress, port, 
        paperWidth, location, terminalId, status, autoPrint, 
        printReceipt, printKOT, printInvoice, notes
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
      name, type, brand, model, connectionType, ipAddress, port, 
      paperWidth, location, terminalId, status, autoPrint, 
      printReceipt, printKOT, printInvoice, notes
    } = req.body;

    const existing = await prisma.printer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Printer not found' });
    }

    if (name && name !== existing.name) {
      const duplicate = await prisma.printer.findFirst({ where: { name } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Printer with this name already exists' });
      }
    }

    const updated = await prisma.printer.update({
      where: { id },
      data: {
        name, type, brand, model, connectionType, ipAddress, port, 
        paperWidth, location, terminalId, status, autoPrint, 
        printReceipt, printKOT, printInvoice, notes
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
      diagnostic: `Print payload sent to ${existing.name} (${existing.connectionType === 'Network' ? existing.ipAddress : existing.connectionType})`
    });
  } catch (error) {
    next(error);
  }
};
