import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/customError';
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  // Handle Prisma Database Connection Errors
  if (
    err.name === 'PrismaClientInitializationError' ||
    (err.name === 'PrismaClientKnownRequestError' && err.code === 'P1001') ||
    err.message?.includes('Can\'t reach database server') ||
    err.message?.includes('Database connection failed')
  ) {
    console.error('Database connection error:', err.message);
    return res.status(503).send({ errors: [{ message: 'Database connection failed' }] });
  }

  console.error(err);
  res.status(500).send({ errors: [{ message: 'Something went wrong' }] });
};
