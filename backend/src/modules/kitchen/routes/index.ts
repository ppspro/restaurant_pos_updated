import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { authorize } from '../../../shared/middlewares/authorize';

const router = Router();

router.use(authenticate);

// We want SUPER_ADMIN and maybe a dedicated KITCHEN_STAFF role in the future.
// For now, SUPER_ADMIN can view the KDS.
router.get('/queue', authorize('SUPER_ADMIN', 'MANAGER'), KitchenController.getQueue);
router.get('/analytics', authorize('SUPER_ADMIN', 'MANAGER'), KitchenController.getAnalytics);

router.patch('/orders/:id/status', authorize('SUPER_ADMIN', 'MANAGER'), KitchenController.updateStatus);

export default router;
