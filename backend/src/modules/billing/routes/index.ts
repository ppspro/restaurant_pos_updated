import { Router } from 'express';
import {
  createOrder,
  getRecentOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/order.controller';

const router = Router();

// POST /api/billing/orders — create new prepaid order
router.post('/orders', createOrder);

// GET /api/billing/orders/recent?cashierId=xxx — today's orders for cashier
router.get('/orders/recent', getRecentOrders);

// GET /api/billing/orders/:id — single order detail
router.get('/orders/:id', getOrderById);

// PUT /api/billing/orders/:id/cancel — cancel order
router.put('/orders/:id/cancel', cancelOrder);

export default router;
