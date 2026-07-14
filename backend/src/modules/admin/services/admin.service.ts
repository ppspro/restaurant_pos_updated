import os from 'os';
import prisma from '../../../prisma/client';

export class AdminService {

  // ─── USER MANAGEMENT ──────────────────────────────────────────

  static async getUsers(query: { search?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { username: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { role: { select: { id: true, name: true } } }
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: users.map(u => ({ ...u, password: undefined })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  static async forceLogout(userId: string) {
    // Revoke all refresh tokens for the user
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    return { message: 'All sessions revoked' };
  }

  // ─── ROLE & PERMISSION MANAGEMENT ─────────────────────────────

  static async getRoles() {
    return await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        },
        _count: { select: { users: true } }
      }
    });
  }

  static async getAllPermissions() {
    return await prisma.permission.findMany({ orderBy: { code: 'asc' } });
  }

  static async updateRolePermissions(roleId: string, permissionIds: string[]) {
    return await prisma.$transaction(async (tx) => {
      // Remove all existing permissions
      await tx.rolePermission.deleteMany({ where: { roleId } });
      // Re-add the selected ones
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({ roleId, permissionId }))
        });
      }
      return await tx.role.findUnique({
        where: { id: roleId },
        include: { permissions: { include: { permission: true } } }
      });
    });
  }

  // ─── SYSTEM SETTINGS ──────────────────────────────────────────

  static async getSettings() {
    return await prisma.restaurantSettings.findFirst();
  }

  static async updateSettings(data: any) {
    const existing = await prisma.restaurantSettings.findFirst();
    if (existing) {
      return await prisma.restaurantSettings.update({ where: { id: existing.id }, data });
    }
    return await prisma.restaurantSettings.create({ data });
  }

  // ─── SYSTEM HEALTH ────────────────────────────────────────────

  static async getSystemHealth() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercent = Math.round((usedMem / totalMem) * 100);

    const cpuModel = os.cpus()[0]?.model || 'Unknown';
    const uptime = os.uptime();

    // Simple DB check
    let dbStatus = 'HEALTHY';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'OFFLINE';
    }

    return {
      memory: { total: totalMem, used: usedMem, free: freeMem, percent: memoryPercent },
      cpu: { model: cpuModel, cores: os.cpus().length },
      uptime,
      database: { status: dbStatus },
      platform: os.platform(),
      nodeVersion: process.version
    };
  }

  // ─── DASHBOARD STATS ──────────────────────────────────────────

  static async getDashboardStats() {
    const [totalUsers, totalTerminals, onlineTerminals, lastBackup] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.terminal.count(),
      prisma.terminal.count({ where: { status: 'ONLINE' } }),
      prisma.systemBackup.findFirst({ orderBy: { createdAt: 'desc' } })
    ]);

    return { totalUsers, totalTerminals, onlineTerminals, lastBackup };
  }
}
