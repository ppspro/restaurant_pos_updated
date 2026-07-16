import type { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderHistoryService } from '../services/order.history.service';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      cashierId,
      businessDayId,
      cashierShiftId,
      items,
      subtotal,
      gstAmount,
      discount,
      grandTotal,
      paymentMethod,
      receivedCash,
      transactionReference,
    } = req.body;

    if (!cashierId || !items?.length || !paymentMethod || grandTotal === undefined) {
      res.status(400).json({ success: false, message: 'cashierId, items, paymentMethod, and grandTotal are required' });
      return;
    }

    const result = await OrderService.createOrder({
      cashierId,
      businessDayId,
      cashierShiftId,
      items,
      subtotal: Number(subtotal),
      gstAmount: Number(gstAmount),
      discount: Number(discount ?? 0),
      grandTotal: Number(grandTotal),
      paymentMethod,
      receivedCash: receivedCash ? Number(receivedCash) : undefined,
      transactionReference,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Order creation failed';
    const status = message.includes('No active Business Day') ? 409 : 500;
    res.status(status).json({ success: false, message });
  }
};

export const getRecentOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cashierId } = req.query;
    if (!cashierId) {
      res.status(400).json({ success: false, message: 'cashierId query parameter is required' });
      return;
    }
    const orders = await OrderHistoryService.getRecentOrders(cashierId as string);
    res.json({ success: true, data: orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recent orders';
    res.status(500).json({ success: false, message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await OrderHistoryService.getOrderById(id as string);
    res.json({ success: true, data: order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Order not found';
    const status = message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, userId } = req.body;

    if (!reason || !userId) {
      res.status(400).json({ success: false, message: 'reason and userId are required' });
      return;
    }

    const cancelled = await OrderHistoryService.cancelOrder(id as string, reason, userId);
    res.json({ success: true, data: cancelled });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cancel failed';
    const status = message.includes('not found') ? 404 : message.includes('already cancelled') ? 409 : 500;
    res.status(status).json({ success: false, message });
  }
};
