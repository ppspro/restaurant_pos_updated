import { Router } from 'express';
import { OrderManagementController } from '../controllers/order-management.controller';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { checkPermission } from '../../../shared/middlewares/permission';

const router = Router();

router.use(authenticate);

// List/History
router.get('/history', OrderManagementController.getHistory);

// Details
router.get('/:id', OrderManagementController.getDetails);

// Actions
router.post('/:id/reprint', OrderManagementController.reprintOrder);
router.post('/:id/cancel', checkPermission('ORDER_CANCEL'), OrderManagementController.cancelOrder);

export default router;
