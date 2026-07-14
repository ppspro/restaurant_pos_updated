import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/unauthorizedError';
import { ForbiddenError } from '../errors/forbiddenError';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Access denied: insufficient permissions'));
    }

    next();
  };
};
