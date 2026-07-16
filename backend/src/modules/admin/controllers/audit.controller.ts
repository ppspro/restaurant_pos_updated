import { Request, Response } from 'express';
import { prisma } from '../../../prisma/client';
import { ExportService } from '../../reports/services/export.service';
import { format } from 'date-fns';

export class AuditController {
  static async exportAuditLogs(req: Request, res: Response) {
    try {
      const { action, user, from, to } = req.query;

      const where: any = {};

      if (action) {
        where.action = String(action);
      }

      if (user) {
        where.user = {
          name: { contains: String(user), mode: 'insensitive' }
        };
      }

      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(String(from));
        if (to) where.createdAt.lte = new Date(String(to));
      }

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            include: {
              role: true
            }
          }
        }
      });

      const formattedData = logs.map(log => ({
        Timestamp: format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm'),
        Action: log.action,
        Entity: log.entity,
        User: log.user ? log.user.name : 'System',
        Role: log.user?.role?.name || 'N/A',
        Description: log.description,
        'IP Address': log.ipAddress || 'N/A',
        Status: 'Success' // Using hardcoded Success for now since Prisma model doesn't have status
      }));

      const filename = `audit_logs_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`;

      // Using ExportService which pipes to response
      await ExportService.exportToCsv(res, filename, formattedData);
      
    } catch (error: any) {
      console.error('Error exporting audit logs:', error);
      res.status(500).json({ success: false, error: 'Unable to export audit logs' });
    }
  }
}
