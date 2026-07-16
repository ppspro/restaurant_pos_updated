import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  
  static async getInbox(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const roleId = req.user?.role;
      if (!userId || !roleId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const notifications = await NotificationService.getInbox(userId, roleId);
      res.json({ success: true, data: notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const roleId = req.user?.role;
      if (!userId || !roleId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const count = await NotificationService.getUnreadCount(userId, roleId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch count' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await NotificationService.markAsRead(id);
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error marking read:', error);
      res.status(500).json({ success: false, error: 'Failed to update status' });
    }
  }

  static async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const prefs = await NotificationService.getPreferences(userId);
      res.json({ success: true, data: prefs });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
    }
  }
}
