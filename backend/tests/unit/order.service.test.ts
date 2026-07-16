import { OrderService } from '../../src/modules/billing/services/order.service';
import prisma from '../../src/prisma/client';

// Mock the prisma client
jest.mock('../../src/prisma/client', () => ({
  __esModule: true,
  default: {
    businessDay: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('OrderService Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const mockOrderPayload = {
      cashierId: 'cashier-1',
      items: [
        {
          menuItemId: 'item-1',
          itemName: 'Burger',
          quantity: 2,
          unitPrice: 100,
          gst: 5,
          itemType: 'KITCHEN' as const,
        },
      ],
      subtotal: 200,
      gstAmount: 10,
      discount: 0,
      grandTotal: 210,
      paymentMethod: 'CASH' as const,
      receivedCash: 250,
    };

    it('should throw error if no active business day is found', async () => {
      (prisma.businessDay.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(OrderService.createOrder(mockOrderPayload)).rejects.toThrow(
        'Cannot create order: No active business day'
      );
    });

    it('should create an order successfully when business day is active', async () => {
      // Mock active business day
      (prisma.businessDay.findFirst as jest.Mock).mockResolvedValue({
        id: 'bd-1',
        status: 'OPEN',
        date: new Date('2026-07-10'),
      });

      // Mock the transaction result
      (prisma.$transaction as jest.Mock).mockResolvedValue([
        { value: 42 }, // TokenCounter update
        { 
          id: 'order-1',
          orderNumber: 'ORD-20260710-042',
        }, // Order creation
        {}, // AuditLog creation
      ]);

      const result = await OrderService.createOrder(mockOrderPayload);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        orderId: 'order-1',
        orderNumber: 'ORD-20260710-042',
        tokenNumber: 42,
        businessDate: '10/07/2026',
      });
    });
  });
});
