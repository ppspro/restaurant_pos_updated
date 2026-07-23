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
    console.error('Database connection error [TECHNICAL LOG]:', err);
    return res.status(503).send({ errors: [{ message: 'The system is currently undergoing maintenance. Please try again later.' }] });
  }

  console.error('[Unhandled Error]:', err);

  if (process.env.NODE_ENV === 'development') {
    return res.status(500).send({
      errors: [{ message: err.message || 'Something went wrong', stack: err.stack }]
    });
  }

  res.status(500).send({ errors: [{ message: 'Something went wrong' }] });
};
