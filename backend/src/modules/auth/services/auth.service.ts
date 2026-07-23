import prisma from '../../../prisma/client';
import { comparePassword, hashPassword } from '../../../shared/utils/password';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../../shared/utils/jwt';
import { BadRequestError } from '../../../shared/errors/badRequestError';
import { UnauthorizedError } from '../../../shared/errors/unauthorizedError';
import { ForbiddenError } from '../../../shared/errors/forbiddenError';
import { LockoutService } from './lockout.service';
import { SessionService } from './session.service';
import { AuditService } from '../../../shared/services/audit.service';

export class AuthService {
  private static parseUserAgent(uaString?: string) {
    if (!uaString) return { browser: 'Unknown', device: 'Unknown', os: 'Unknown' };
    
    let browser = 'Unknown';
    if (uaString.includes('Firefox')) browser = 'Firefox';
    else if (uaString.includes('Chrome')) browser = 'Chrome';
    else if (uaString.includes('Safari')) browser = 'Safari';
    else if (uaString.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (uaString.includes('Windows')) os = 'Windows';
    else if (uaString.includes('Macintosh')) os = 'macOS';
    else if (uaString.includes('Linux')) os = 'Linux';
    else if (uaString.includes('Android')) os = 'Android';
    else if (uaString.includes('iPhone')) os = 'iOS';

    const device = uaString.includes('Mobi') ? 'Mobile' : 'Desktop';

    return { browser, device, os };
  }

  static async login(username: string, password: string, ipAddress: string = '127.0.0.1', userAgent?: string) {
    // 1. Check Lockout Status
    const lockout = await LockoutService.checkLockout(username, ipAddress);
    if (lockout.isLocked) {
      throw new ForbiddenError(`Account temporarily locked. Try again in ${lockout.remainingMinutes} minutes.`);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      await LockoutService.recordAttempt(username, ipAddress, 'FAILED', 'User not found');
      await AuditService.logFailedLogin(username, 'User not found', ipAddress, userAgent);
      throw new UnauthorizedError('Invalid username or password');
    }

    if (user.status !== 'ACTIVE') {
      await LockoutService.recordAttempt(username, ipAddress, 'FAILED', 'Account inactive');
      await AuditService.logFailedLogin(username, 'Account inactive', ipAddress, userAgent);
      throw new UnauthorizedError('Account is currently inactive');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      await LockoutService.recordAttempt(username, ipAddress, 'FAILED', 'Invalid password');
      await AuditService.logFailedLogin(username, 'Invalid password', ipAddress, userAgent);
      throw new UnauthorizedError('Invalid username or password');
    }

    // Reset lockout counters on success
    await LockoutService.recordAttempt(username, ipAddress, 'SUCCESS');

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = { userId: user.id, role: user.role.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token with client agent metadata
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const parsedUa = this.parseUserAgent(userAgent);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        deviceName: parsedUa.device,
        browser: parsedUa.browser,
        ipAddress,
        expiresAt,
      },
    });

    // Create session tracking
    await SessionService.createSession(
      user.id,
      ipAddress,
      parsedUa.device,
      parsedUa.browser,
      parsedUa.os
    );

    await AuditService.logLogin(user.id, user.username, ipAddress, userAgent);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role.name,
      },
    };
  }

  static async logout(token: string, userId: string, ipAddress?: string, userAgent?: string, reason?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    await prisma.refreshToken.updateMany({
      where: { token, userId },
      data: { revokedAt: new Date() },
    });

    // Terminate corresponding UserSession
    await prisma.userSession.updateMany({
      where: { userId, ipAddress, status: 'ACTIVE' },
      data: { status: 'TERMINATED', logoutTime: new Date() },
    });

    if (user) {
      await AuditService.logLogout(userId, user.username, ipAddress, userAgent, reason);
    }
  }

  static async refresh(token: string, ipAddress?: string, userAgent?: string) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (tokenRecord.revokedAt) {
      // Reuse Detection - Revoke all tokens
      await prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revokedAt: new Date() },
      });
      await prisma.userSession.updateMany({
        where: { userId: tokenRecord.userId, status: 'ACTIVE' },
        data: { status: 'TERMINATED', logoutTime: new Date() },
      });
      await AuditService.logPermissionDenied(tokenRecord.userId, 'REFRESH_REUSE', ipAddress, userAgent);
      throw new UnauthorizedError('Token reuse detected. All sessions revoked for safety.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      include: { role: true },
    });

    if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
      throw new UnauthorizedError('User is no longer active');
    }

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const payload = { userId: user.id, role: user.role.name };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const parsedUa = this.parseUserAgent(userAgent);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        deviceName: parsedUa.device,
        browser: parsedUa.browser,
        ipAddress,
        expiresAt,
      },
    });

    await AuditService.logTokenRefresh(user.id, ipAddress, userAgent);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async changePassword(userId: string, oldPass: string, newPass: string, ipAddress?: string, userAgent?: string) {
    // 1. Password policy complexity check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(newPass)) {
      throw new BadRequestError('New password does not satisfy strong complexity guidelines.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const isMatch = await comparePassword(oldPass, user.password);
    if (!isMatch) {
      throw new BadRequestError('Invalid old password');
    }

    const hashed = await hashPassword(newPass);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    // Logout all active sessions for this user (Logout All Devices)
    await SessionService.terminateAllSessions(userId, userId, ipAddress, userAgent);

    await AuditService.logPasswordChange(userId, user.username, ipAddress, userAgent);
  }
}
