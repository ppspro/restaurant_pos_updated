import { Request, Response, NextFunction } from 'express';
import prisma from '../../prisma/client';
import { UnauthorizedError } from '../errors/unauthorizedError';
import { ForbiddenError } from '../errors/forbiddenError';
import { AuditService } from '../services/audit.service';

export const checkPermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const { role, userId } = req.user;

    // SUPER_ADMIN gets global access bypass
    if (role === 'SUPER_ADMIN') {
      return next();
    }

    const hasPermission = await prisma.rolePermission.findFirst({
      where: {
        role: { name: role },
        permission: { code: permissionCode },
      },
    });

    if (!hasPermission) {
      await AuditService.logPermissionDenied(userId, permissionCode, req.ip, req.headers['user-agent']);
      return next(new ForbiddenError(`Access denied: missing permission "${permissionCode}"`));
    }

    next();
  };
};
export default checkPermission;
