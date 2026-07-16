import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../../../shared/middlewares/authenticate';

const router = Router();

// Protect all analytics routes with authentication
router.use(authenticate);

// We allow CASHIER and SUPER_ADMIN here, controller handles data restrictions.
// We could use `requirePermission('view_analytics')` if role permissions are granularly setup.

router.get('/summary', AnalyticsController.getSummary);
router.get('/sales/metrics', AnalyticsController.getSalesMetrics);
router.get('/sales/peak-hours', AnalyticsController.getPeakHours);
router.get('/sales/trends', AnalyticsController.getSalesTrends);
router.get('/orders/metrics', AnalyticsController.getOrderMetrics);
router.get('/orders/distribution', AnalyticsController.getOrderDistribution);
router.get('/menu/performance', AnalyticsController.getMenuPerformance);
router.get('/cashiers/performance', AnalyticsController.getCashierPerformance);
router.get('/payments/metrics', AnalyticsController.getPaymentMetrics);

// System health might be SUPER_ADMIN only, but let's allow read-only for cashiers
// since the prompt says "Printer/Health Status: Allow (Read-Only) for Cashier"
router.get('/system/health', AnalyticsController.getSystemHealth);

export default router;
