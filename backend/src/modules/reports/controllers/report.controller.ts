import { Request, Response } from 'express';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { ExportService } from '../services/export.service';
import { AnalyticsQueryDto } from '../../analytics/services/analytics.service';
import { ReportService, PaginatedQueryDto } from '../services/report.service';

export class ReportController {
  
  static async exportSales(req: Request, res: Response) {
    try {
      const dto = req.query as unknown as AnalyticsQueryDto;
      const format = req.query.format as string || 'csv';

      // Re-use AnalyticsService to fetch the sales metrics
      const data = await AnalyticsService.getSalesMetrics(dto);
      
      // Formatting the data for export (flattening objects if necessary)
      const formattedData = [
        {
          period: 'Current',
          orders: data.orders.current,
          revenue: data.sales.current,
          aov: data.aov.current
        },
        {
          period: 'Previous',
          orders: data.orders.trend?.value || 0,
          revenue: data.sales.trend?.value || 0,
          aov: data.aov.trend?.value || 0
        }
      ];

      const filename = `sales_report_${new Date().getTime()}`;

      if (format === 'csv') {
        return await ExportService.exportToCsv(res, filename, formattedData);
      } else if (format === 'xlsx') {
        return await ExportService.exportToExcel(res, filename, formattedData, [
          { header: 'Period', key: 'period', width: 15 },
          { header: 'Orders', key: 'orders', width: 15 },
          { header: 'Revenue', key: 'revenue', width: 20 },
          { header: 'AOV', key: 'aov', width: 15 }
        ]);
      } else if (format === 'pdf') {
        return await ExportService.exportToPdf(res, filename, 'Sales Report', formattedData, ['period', 'orders', 'revenue', 'aov']);
      } else {
        res.status(400).json({ success: false, error: 'Invalid format. Use csv, xlsx, or pdf.' });
      }

    } catch (error: any) {
      console.error('Error exporting sales report:', error);
      res.status(500).json({ success: false, error: 'Failed to generate report' });
    }
  }

  static async getOrdersList(req: Request, res: Response) {
    try {
      const dto = req.query as unknown as PaginatedQueryDto;
      const result = await ReportService.getOrdersList(dto);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error fetching orders list:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch orders list' });
    }
  }

  static async getSalesList(req: Request, res: Response) {
    try {
      const dto = req.query as unknown as PaginatedQueryDto;
      const result = await ReportService.getSalesList(dto);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error fetching sales list:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch sales list' });
    }
  }

  static async getGstList(req: Request, res: Response) {
    try {
      const dto = req.query as unknown as PaginatedQueryDto;
      const result = await ReportService.getGstList(dto);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error fetching gst list:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch gst list' });
    }
  }

  static async getMenuList(req: Request, res: Response) {
    try {
      const dto = req.query as unknown as PaginatedQueryDto;
      const result = await ReportService.getMenuList(dto);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error fetching menu list:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch menu list' });
    }
  }

  static async getShiftList(req: Request, res: Response) {
    try {
      const dto = req.query as unknown as PaginatedQueryDto;
      const result = await ReportService.getShiftList(dto);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error fetching shift list:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch shift list' });
    }
  }

  static async getAuditList(req: Request, res: Response) {
    try {
      const dto = req.query as unknown as PaginatedQueryDto;
      const result = await ReportService.getAuditList(dto);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error fetching audit list:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch audit list' });
    }
  }
}
