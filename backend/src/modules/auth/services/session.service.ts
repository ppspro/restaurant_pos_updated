import prisma from '../../../prisma/client';
import { AuditService } from '../../../shared/services/audit.service';

export class SessionService {
  static async createSession(
    userId: string,
    ipAddress?: string,
    device?: string,
    browser?: string,
    operatingSystem?: string
  ) {
    return prisma.userSession.create({
      data: {
        userId,
        ipAddress,
        device,
        browser,
        operatingSystem,
        status: 'ACTIVE',
      },
    });
  }

  static async terminateSession(sessionId: string, terminatedByUserId: string, ip?: string, ua?: string) {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== 'ACTIVE') {
      return;
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        status: 'TERMINATED',
        logoutTime: new Date(),
      },
    });

    // Revoke tokens associated with this session's user (in a real-world scenario, we could match refresh token IDs too)
    await prisma.refreshToken.updateMany({
      where: { userId: session.userId, ipAddress: session.ipAddress },
      data: { revokedAt: new Date() },
    });

    await AuditService.logSessionTermination(sessionId, terminatedByUserId, ip, ua);
  }

  static async terminateAllSessions(userId: string, terminatedByUserId: string, ip?: string, ua?: string) {
    const activeSessions = await prisma.userSession.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    await prisma.userSession.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: {
        status: 'TERMINATED',
        logoutTime: new Date(),
      },
    });

    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    for (const session of activeSessions) {
      await AuditService.logSessionTermination(session.id, terminatedByUserId, ip, ua);
    }
  }

  static async getActiveSessions(userId: string) {
    return prisma.userSession.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { loginTime: 'desc' },
    });
  }
}
