import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { logger } from '../shared/logger';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
export { prisma };
