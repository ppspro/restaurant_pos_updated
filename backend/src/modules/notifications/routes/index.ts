import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../../../shared/middlewares/authenticate';

const router = Router();

// All users can access their own notifications
router.use(authenticate);

router.get('/', NotificationController.getInbox);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/:id/read', NotificationController.markAsRead);
router.get('/preferences', NotificationController.getPreferences);

export default router;
