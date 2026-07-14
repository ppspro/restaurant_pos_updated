import prisma from '../../../prisma/client';

const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCK_DURATION_MINUTES = parseInt(process.env.ACCOUNT_LOCK_DURATION || '15', 10);

export class LockoutService {
  static async checkLockout(username: string, ipAddress: string): Promise<{ isLocked: boolean; remainingMinutes: number }> {
    const lockWindowStart = new Date(Date.now() - LOCK_DURATION_MINUTES * 60 * 1000);

    // Count failed attempts within the window
    const failedCount = await prisma.loginAttempt.count({
      where: {
        username,
        ipAddress,
        status: 'FAILED',
        createdAt: { gte: lockWindowStart },
      },
    });

    if (failedCount >= MAX_ATTEMPTS) {
      // Find the last failed attempt to calculate remaining lock duration
      const lastFailed = await prisma.loginAttempt.findFirst({
        where: { username, ipAddress, status: 'FAILED' },
        orderBy: { createdAt: 'desc' },
      });

      if (lastFailed) {
        const lockExpiration = new Date(lastFailed.createdAt.getTime() + LOCK_DURATION_MINUTES * 60 * 1000);
        const remainingMs = lockExpiration.getTime() - Date.now();
        if (remainingMs > 0) {
          return {
            isLocked: true,
            remainingMinutes: Math.ceil(remainingMs / (60 * 1000)),
          };
        }
      }
    }

    return { isLocked: false, remainingMinutes: 0 };
  }

  static async recordAttempt(username: string, ipAddress: string, status: 'SUCCESS' | 'FAILED', failureReason?: string) {
    await prisma.loginAttempt.create({
      data: {
        username,
        ipAddress,
        status,
        failureReason,
      },
    });
  }
}
