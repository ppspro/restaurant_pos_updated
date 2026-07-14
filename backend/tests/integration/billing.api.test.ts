import request from 'supertest';
import express from 'express';
import billingRoutes from '../../src/modules/billing/routes';
import prisma from '../../src/prisma/client';

// Setup express app with routes
const app = express();
app.use(express.json());
app.use('/api/billing', billingRoutes);

// Mock prisma
jest.mock('../../src/prisma/client', () => ({
  __esModule: true,
  default: {
    businessDay: { findFirst: jest.fn() },
    $transaction: jest.fn(),
    order: { findMany: jest.fn() },
  },
}));

describe('Billing API Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/billing/orders', () => {
    it('should return 409 if no active business day exists', async () => {
      (prisma.businessDay.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/billing/orders')
        .send({ cashierId: 'cashier-1', items: [], subtotal: 0, grandTotal: 0, paymentMethod: 'CASH' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No active business day');
    });

    it('should create order and return 201 on success', async () => {
      (prisma.businessDay.findFirst as jest.Mock).mockResolvedValue({ id: 'bd-1', status: 'OPEN', date: new Date() });
      (prisma.$transaction as jest.Mock).mockResolvedValue([
        { value: 101 }, // token
        { id: 'order-123', orderNumber: 'ORD-TEST-123' }, // order
        {} // audit
      ]);

      const response = await request(app)
        .post('/api/billing/orders')
        .send({
          cashierId: 'cashier-1',
          items: [{ menuItemId: 'item-1', itemName: 'Tea', quantity: 1, unitPrice: 20, gst: 0, itemType: 'KITCHEN' }],
          subtotal: 20,
          gstAmount: 0,
          discount: 0,
          grandTotal: 20,
          paymentMethod: 'CASH'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokenNumber).toBe(101);
    });
  });

  describe('GET /api/billing/orders/recent', () => {
    it('should return recent orders for a cashier', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([
        { id: 'o-1', orderNumber: 'ORD-1', grandTotal: 100 }
      ]);

      const response = await request(app).get('/api/billing/orders/recent?cashierId=cashier-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
    });
  });
});
