import { Request, Response } from 'express';
import prisma from '../../../prisma/client';

export class HealthController {
  static async check(req: Request, res: Response) {
    let dbStatus = 'disconnected';
    let overallStatus = 'error';
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      overallStatus = 'ok';
    } catch (error) {
      dbStatus = 'error';
    }

    const uptime = process.uptime();

    res.status(overallStatus === 'ok' ? 200 : 503).json({
      status: overallStatus,
      database: dbStatus,
      uptime,
    });
  }
}
