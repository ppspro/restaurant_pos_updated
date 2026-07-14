import { Request, Response, NextFunction } from 'express';
import { ShiftService } from '../services/shift.service';
import { TerminalService } from '../services/terminal.service';
import { BusinessDayService } from '../services/businessDay.service';
import { ApiResponse } from '../../../shared/helpers/apiResponse';

export class ShiftController {
  static async getTerminals(req: Request, res: Response, next: NextFunction) {
    try {
      const terminals = await TerminalService.list();
      return ApiResponse.success(res, terminals, 'POS terminals retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getActiveBusinessDay(req: Request, res: Response, next: NextFunction) {
    try {
      const activeDay = await BusinessDayService.getActiveBusinessDay();
      return ApiResponse.success(res, activeDay, 'Active Business Day retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async openBusinessDay(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return ApiResponse.error(res, 'Unauthenticated', 401);

      const day = await BusinessDayService.openBusinessDay(userId);
      return ApiResponse.success(res, day, 'Business Day opened successfully');
    } catch (error) {
      next(error);
    }
  }

  static async closeBusinessDay(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return ApiResponse.error(res, 'Unauthenticated', 401);

      const day = await BusinessDayService.closeBusinessDay(userId);
      return ApiResponse.success(res, day, 'Business Day closed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentShift(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return ApiResponse.error(res, 'Unauthenticated', 401);

      const shift = await ShiftService.getCurrentShift(userId);
      return ApiResponse.success(res, shift, 'Current active shift retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async openShift(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { terminalId, openingCash } = req.body;

      if (!userId) return ApiResponse.error(res, 'Unauthenticated', 401);
      if (!terminalId || openingCash === undefined) {
        return ApiResponse.error(res, 'terminalId and openingCash are required fields', 400);
      }

      const shift = await ShiftService.openShift(userId, terminalId, Number(openingCash));
      return ApiResponse.success(res, shift, 'Cashier shift opened successfully');
    } catch (error) {
      next(error);
    }
  }

  static async closeShift(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { closingCash, notes } = req.body;

      if (!userId) return ApiResponse.error(res, 'Unauthenticated', 401);
      if (closingCash === undefined) {
        return ApiResponse.error(res, 'closingCash is a required field', 400);
      }

      const shift = await ShiftService.closeShift(userId, Number(closingCash), notes);
      return ApiResponse.success(res, shift, 'Cashier shift closed successfully');
    } catch (error) {
      next(error);
    }
  }
}
