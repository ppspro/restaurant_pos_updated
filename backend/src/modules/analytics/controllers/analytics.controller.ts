import { Request, Response } from 'express';
import { AnalyticsService, AnalyticsQueryDto } from '../services/analytics.service';

export class AnalyticsController {
  private static parseQuery(req: Request): AnalyticsQueryDto {
    const userRole = (req.user as any)?.role;
    let cashierId = req.query.cashierId as string | undefined;

    // RBAC logic: Cashier can only view their own analytics
    if (userRole === 'CASHIER') {
      cashierId = (req.user as any)?.id;
    }

    return {
      dateRange: (req.query.dateRange as any) || 'TODAY',
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      cashierId,
      paymentMethod: req.query.paymentMethod as string,
      categoryId: req.query.categoryId as string,
      terminalId: req.query.terminalId as string,
    };
  }

  static async getSummary(req: Request, res: Response) {
    try {
      const dto = AnalyticsController.parseQuery(req);
      const data = await AnalyticsService.getSummary(dto);
      res.status(200).json({ success: true, message: 'Summary fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch summary' });
    }
  }

  static async getSalesTrends(req: Request, res: Response) {
    try {
      const dto = AnalyticsController.parseQuery(req);
      const data = await AnalyticsService.getSalesTrends(dto);
      res.status(200).json({ success: true, message: 'Trends fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch trends' });
    }
  }

  static async getOrderDistribution(req: Request, res: Response) {
    try {
      const dto = AnalyticsController.parseQuery(req);
      const data = await AnalyticsService.getOrderDistribution(dto);
      res.status(200).json({ success: true, message: 'Distribution fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch distribution' });
    }
  }

  static async getMenuPerformance(req: Request, res: Response) {
    try {
      const dto = AnalyticsController.parseQuery(req);
      const data = await AnalyticsService.getMenuPerformance(dto);
      res.status(200).json({ success: true, message: 'Menu performance fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch menu performance' });
    }
  }

  static async getSystemHealth(req: Request, res: Response) {
    try {
      const data = await AnalyticsService.getSystemHealth();
      res.status(200).json({ success: true, message: 'System health fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch system health' });
    }
  }

  static async getSalesMetrics(req: Request, res: Response) {
    try {
      const dto = AnalyticsController.parseQuery(req);
      const data = await AnalyticsService.getSalesMetrics(dto);
      res.status(200).json({ success: true, message: 'Sales metrics fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch sales metrics' });
    }
  }

  static async getPeakHours(req: Request, res: Response) {
    try {
      const dto = AnalyticsController.parseQuery(req);
      const data = await AnalyticsService.getPeakHours(dto);
      res.status(200).json({ success: true, message: 'Peak hours fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch peak hours' });
    }
  }

  static async getOrderMetrics(req: Request, res: Response) {
    try {
      const dto = AnalyticsController.parseQuery(req);
      const data = await AnalyticsService.getOrderMetrics(dto);
      res.status(200).json({ success: true, message: 'Order metrics fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch order metrics' });
    }
  }

  static async getCashierPerformance(req: Request, res: Response) {
    try {
      const dto = AnalyticsController.parseQuery(req);
      const data = await AnalyticsService.getCashierPerformance(dto);
      res.status(200).json({ success: true, message: 'Cashier performance fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch cashier performance' });
    }
  }

  static async getPaymentMetrics(req: Request, res: Response) {
    try {
      const dto = AnalyticsController.parseQuery(req);
      const data = await AnalyticsService.getPaymentMetrics(dto);
      res.status(200).json({ success: true, message: 'Payment metrics fetched successfully', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch payment metrics' });
    }
  }
}
