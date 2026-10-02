import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { authorize } from '../../../shared/middlewares/authorize';

const router = Router();

router.use(authenticate);

// Cashiers can search and create customers
router.get('/', authorize('SUPER_ADMIN', 'MANAGER', 'CASHIER'), CustomerController.getCustomers);
router.post('/', authorize('SUPER_ADMIN', 'MANAGER', 'CASHIER'), CustomerController.createCustomer);

// Only managers/admins get aggregate stats
router.get('/stats', authorize('SUPER_ADMIN'), CustomerController.getDashboardStats);

export default router;
