import { Request, Response } from 'express';
import { KitchenService } from '../services/kitchen.service';
import { OrderStatus } from '@prisma/client';

export class KitchenController {
  
  static async getQueue(req: Request, res: Response) {
    try {
      const queue = await KitchenService.getActiveQueue();
      res.json({ success: true, data: queue });
    } catch (error: any) {
      console.error('Error fetching kitchen queue:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch kitchen queue' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const userId = req.user?.userId;

      if (!status || !Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid order status' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const updatedOrder = await KitchenService.updateOrderStatus(id, status as OrderStatus, userId);
      res.json({ success: true, data: updatedOrder });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to update order status' });
    }
  }

  static async getAnalytics(req: Request, res: Response) {
    try {
      const analytics = await KitchenService.getKitchenAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error: any) {
      console.error('Error fetching kitchen analytics:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  }
}
