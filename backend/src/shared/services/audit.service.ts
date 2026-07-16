import prisma from '../../prisma/client';
import { AuditAction } from '@prisma/client';

export class AuditService {
  static async logLogin(userId: string, username: string, ipAddress?: string, userAgent?: string) {
    await prisma.auditLog.create({
      data: {
        action: AuditAction.LOGIN,
        entity: 'user',
        userId,
        description: `User "${username}" logged in successfully`,
        ipAddress,
        userAgent,
      },
    });
  }

  static async logFailedLogin(username: string, reason: string, ipAddress?: string, userAgent?: string) {
    await prisma.auditLog.create({
      data: {
        action: AuditAction.LOGIN,
        entity: 'user',
        description: `Failed login attempt for "${username}". Reason: ${reason}`,
        ipAddress,
        userAgent,
      },
    });
  }

  static async logLogout(userId: string, username: string, ipAddress?: string, userAgent?: string, reason?: string) {
    const desc = reason ? `User "${username}" logged out. Reason: ${reason}` : `User "${username}" logged out`;
    await prisma.auditLog.create({
      data: {
        action: AuditAction.LOGOUT,
        entity: 'user',
        userId,
        description: desc,
        ipAddress,
        userAgent,
      },
    });
  }

  static async logPasswordChange(userId: string, username: string, ipAddress?: string, userAgent?: string) {
    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: 'user',
        entityId: userId,
        userId,
        description: `User "${username}" changed their password`,
        ipAddress,
        userAgent,
      },
    });
  }

  static async logPermissionDenied(userId: string, permissionCode: string, ipAddress?: string, userAgent?: string) {
    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: 'security',
        userId,
        description: `Security warning: User denied access due to missing permission "${permissionCode}"`,
        ipAddress,
        userAgent,
      },
    });
  }

  static async logTokenRefresh(userId: string, ipAddress?: string, userAgent?: string) {
    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: 'auth',
        userId,
        description: 'Refreshed session tokens',
        ipAddress,
        userAgent,
      },
    });
  }

  static async logSessionTermination(targetSessionId: string, terminatedByUserId: string, ipAddress?: string, userAgent?: string) {
    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: 'user_session',
        entityId: targetSessionId,
        userId: terminatedByUserId,
        description: `Terminated active user session "${targetSessionId}"`,
        ipAddress,
        userAgent,
      },
    });
  }
}
