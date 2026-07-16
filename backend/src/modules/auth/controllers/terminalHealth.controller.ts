import { Request, Response, NextFunction } from 'express';
import { PrinterService } from '../services/printer.service';
import { DrawerService } from '../services/drawer.service';
import { ReconciliationService } from '../services/reconciliation.service';
import { ApiResponse } from '../../../shared/helpers/apiResponse';

export class TerminalHealthController {
  static async getPrinters(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await PrinterService.list();
      return ApiResponse.success(res, list, 'Printers list retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async testPrinter(req: Request, res: Response, next: NextFunction) {
    try {
      const printerId = req.params.printerId as string;
      const result = await PrinterService.testPrint(printerId);
      return ApiResponse.success(res, result, 'Mock receipt printed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPrinterDiagnostics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await PrinterService.getDiagnostics();
      return ApiResponse.success(res, stats, 'Printers diagnostics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getShiftSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const shiftId = req.params.shiftId as string;
      const summary = await ReconciliationService.getShiftSummary(shiftId);
      return ApiResponse.success(res, summary, 'Shift reconciliation summary retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async openDrawer(req: Request, res: Response, next: NextFunction) {
    try {
      const drawerId = req.params.drawerId as string;
      const { reason } = req.body;
      const userId = req.user?.userId;

      if (!userId) return ApiResponse.error(res, 'Unauthenticated', 401);

      await DrawerService.openDrawer(drawerId, userId, reason);
      return ApiResponse.success(res, null, 'Cash drawer triggered to open');
    } catch (error) {
      next(error);
    }
  }

  static async adjustCash(req: Request, res: Response, next: NextFunction) {
    try {
      const drawerId = req.params.drawerId as string;
      const { amount, type, reason } = req.body;
      const userId = req.user?.userId;

      if (!userId) return ApiResponse.error(res, 'Unauthenticated', 401);
      if (!amount || !type) {
        return ApiResponse.error(res, 'amount and type (ADD_CASH/REMOVE_CASH) are required', 400);
      }

      await DrawerService.adjustCash(drawerId, userId, Number(amount), type, reason);
      return ApiResponse.success(res, null, 'Cash drawer balance updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
