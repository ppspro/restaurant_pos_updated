import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { 
  createUserValidator, 
  updateUserValidator, 
  updateStatusValidator, 
  resetPasswordValidator 
} from '../validators/user.validator';
import { validate } from '../../../shared/middlewares/validate';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { checkPermission } from '../../../shared/middlewares/permission';

const router = Router();

// Only SUPER_ADMIN can manage users. We use the USER_CREATE permission as a proxy or just the general ones defined in seed.ts
// Wait, seed.ts defined USER_CREATE, USER_UPDATE, USER_DELETE.
router.use(authenticate);

router.post(
  '/', 
  checkPermission('USER_CREATE'), 
  createUserValidator, 
  validate, 
  UserController.createUser
);

router.get(
  '/', 
  // Allow people who can view users. No VIEW_USERS in seed, so let's use USER_CREATE to restrict to admin for now.
  checkPermission('USER_CREATE'), 
  UserController.getUsers
);

router.get(
  '/:id', 
  checkPermission('USER_CREATE'), 
  UserController.getUserById
);

router.put(
  '/:id', 
  checkPermission('USER_UPDATE'), 
  updateUserValidator, 
  validate, 
  UserController.updateUser
);

router.patch(
  '/:id/status', 
  checkPermission('USER_UPDATE'), 
  updateStatusValidator, 
  validate, 
  UserController.updateStatus
);

router.put(
  '/:id/reset-password', 
  checkPermission('USER_UPDATE'), 
  resetPasswordValidator, 
  validate, 
  UserController.resetPassword
);

router.delete(
  '/:id', 
  checkPermission('USER_DELETE'), 
  UserController.deleteUser
);

export default router;
