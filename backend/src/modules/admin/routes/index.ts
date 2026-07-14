import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { authorize } from '../../../shared/middlewares/authorize';

const router = Router();

// Every single admin route requires authentication + SUPER_ADMIN role
router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

// Dashboard
router.get('/stats', AdminController.getDashboardStats);

// Users
router.get('/users', AdminController.getUsers);
router.post('/users/:userId/force-logout', AdminController.forceLogout);

// Roles & Permissions
router.get('/roles', AdminController.getRoles);
router.get('/permissions', AdminController.getAllPermissions);
router.put('/roles/:roleId/permissions', AdminController.updateRolePermissions);

// Settings
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

// System Health
router.get('/health', AdminController.getSystemHealth);

export default router;
