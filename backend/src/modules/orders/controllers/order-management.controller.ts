import { Request, Response } from 'express';
import { OrderManagementService, OrderFilterDto } from '../services/order-management.service';

export class OrderManagementController {
  
  static async getHistory(req: Request, res: Response) {
    try {
      const dto = req.query as unknown as OrderFilterDto;
      const result = await OrderManagementService.getOrderHistory(dto);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch order history' });
    }
  }

  static async getDetails(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const order = await OrderManagementService.getOrderDetails(id);
      res.json({ success: true, data: order });
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      if (error.message === 'Order not found') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to fetch order details' });
      }
    }
  }

  static async cancelOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const userId = req.user?.userId;

      if (!reason) {
        return res.status(400).json({ success: false, error: 'Cancellation reason is required' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const order = await OrderManagementService.cancelOrder(id, reason, userId);
      res.json({ success: true, data: order, message: 'Order successfully cancelled' });
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to cancel order' });
    }
  }

  static async reprintOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { type } = req.body; // RECEIPT or KOT
      const userId = req.user?.userId;

      if (!type || (type !== 'RECEIPT' && type !== 'KOT')) {
        return res.status(400).json({ success: false, error: 'Invalid print type. Use RECEIPT or KOT' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await OrderManagementService.reprintOrder(id, type, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Error reprinting order:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to reprint order' });
    }
  }
}
