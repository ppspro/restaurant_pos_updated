import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { authorize } from '../../../shared/middlewares/authorize';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'MANAGER')); // Enforce admin-only for exports currently

// List Endpoints (Paginated for frontend tables)
router.get('/sales/list', ReportController.getSalesList);
router.get('/orders/list', ReportController.getOrdersList);
router.get('/gst/list', ReportController.getGstList);
router.get('/menu/list', ReportController.getMenuList);
router.get('/shifts/list', ReportController.getShiftList);
router.get('/audit/list', ReportController.getAuditList);

// Export Endpoints
router.get('/export/sales', ReportController.exportSales);

export default router;
