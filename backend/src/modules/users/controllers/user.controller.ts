import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../../../shared/helpers/apiResponse';

const getId = (id: string | string[] | undefined): string => {
  if (typeof id === 'string') return id;
  if (Array.isArray(id)) return id[0] || '';
  return '';
};

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const auditorId = req.user!.userId;
      const auditorRole = req.user!.role;
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] as string | undefined;

      const newUser = await UserService.createUser(req.body, auditorId, auditorRole, ipAddress, userAgent);
      return ApiResponse.success(res, newUser, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getUsers();
      return ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getId(req.params.id);
      const user = await UserService.getUserById(id);
      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getId(req.params.id);
      const auditorId = req.user!.userId;
      const auditorRole = req.user!.role;
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] as string | undefined;

      const updatedUser = await UserService.updateUser(id, req.body, auditorId, auditorRole, ipAddress, userAgent);
      return ApiResponse.success(res, updatedUser, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getId(req.params.id);
      const { status } = req.body;
      const auditorId = req.user!.userId;
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] as string | undefined;

      await UserService.updateStatus(id, status, auditorId, ipAddress, userAgent);
      return ApiResponse.success(res, null, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getId(req.params.id);
      const { newPassword } = req.body;
      const auditorId = req.user!.userId;
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] as string | undefined;

      await UserService.resetPassword(id, newPassword, auditorId, ipAddress, userAgent);
      return ApiResponse.success(res, null, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getId(req.params.id);
      const auditorId = req.user!.userId;
      const auditorRole = req.user!.role;
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] as string | undefined;

      await UserService.deleteUser(id, auditorId, auditorRole, ipAddress, userAgent);
      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
