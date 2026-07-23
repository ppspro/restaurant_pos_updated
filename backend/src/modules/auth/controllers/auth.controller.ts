import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { ApiResponse } from '../../../shared/helpers/apiResponse';
import prisma from '../../../prisma/client';
import { logger } from '../../../shared/logger';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] as string | undefined;

      const result = await AuthService.login(username, password, ipAddress, userAgent);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      logger.error(`Authentication error for user ${req.body?.username}`, error);
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { refreshToken, reason } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'] as string | undefined;

      if (userId && refreshToken) {
        await AuthService.logout(refreshToken, userId, ipAddress, userAgent, reason);
      }
      return ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'] as string | undefined;

      if (userId) {
        await SessionService.terminateAllSessions(userId, userId, ipAddress, userAgent);
      }
      return ApiResponse.success(res, null, 'Logged out from all devices successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthenticated', 401);
      }

      const sessions = await SessionService.getActiveSessions(userId);
      return ApiResponse.success(res, sessions, 'Active user sessions retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async terminateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const sessionId = req.params.sessionId as string;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'] as string | undefined;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthenticated', 401);
      }

      await SessionService.terminateSession(sessionId, userId, ipAddress, userAgent);
      return ApiResponse.success(res, null, 'Session terminated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'] as string | undefined;

      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token is required', 400);
      }

      const result = await AuthService.refresh(refreshToken, ipAddress, userAgent);
      return ApiResponse.success(res, result, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          status: true,
          role: {
            select: {
              name: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      // Flatten permissions for client mapping
      const permissions = user.role.permissions.map((p) => p.permission.code);

      const responsePayload = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        status: user.status,
        role: user.role.name,
        permissions,
      };

      return ApiResponse.success(res, responsePayload, 'Current user details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { oldPassword, newPassword } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'] as string | undefined;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthenticated', 401);
      }

      await AuthService.changePassword(userId, oldPassword, newPassword, ipAddress, userAgent);
      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}
