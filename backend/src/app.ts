/// <reference path="./types/express.d.ts" />
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './shared/middlewares/errorHandler';
import { notFound } from './shared/middlewares/notFound';
import { requestLogger } from './shared/middlewares/requestLogger';
import { rateLimiter } from './shared/middlewares/rateLimiter';
import apiRoutes from './routes';

import path from 'path';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan('dev'));
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
