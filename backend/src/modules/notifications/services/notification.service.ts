import prisma from '../../../prisma/client';

export class NotificationService {
  /**
   * Fetch unread count for a specific user (including global role broadcasts)
   */
  static async getUnreadCount(userId: string, roleId: string) {
    return await prisma.notification.count({
      where: {
        isRead: false,
        isArchived: false,
        OR: [
          { userId },
          { roleId },
          { userId: null, roleId: null } // Global broadcasts
        ]
      }
    });
  }

  /**
   * Fetch paginated inbox for a user
   */
  static async getInbox(userId: string, roleId: string, limit = 20) {
    return await prisma.notification.findMany({
      where: {
        isArchived: false,
        OR: [
          { userId },
          { roleId },
          { userId: null, roleId: null }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }

  /**
   * Mark a specific notification as read
   */
  static async markAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string, roleId: string) {
    return await prisma.notification.updateMany({
      where: {
        isRead: false,
        OR: [
          { userId },
          { roleId },
          { userId: null, roleId: null }
        ]
      },
      data: { isRead: true, readAt: new Date() }
    });
  }

  /**
   * Get user preferences
   */
  static async getPreferences(userId: string) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!prefs) {
      // Create defaults
      prefs = await prisma.notificationPreference.create({
        data: { userId }
      });
    }
    
    return prefs;
  }
}
