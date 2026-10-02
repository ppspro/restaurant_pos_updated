import prisma from '../../../prisma/client';
import { hashPassword, comparePassword } from '../../../shared/utils/password';
import { BadRequestError } from '../../../shared/errors/badRequestError';
import { AuditAction } from '@prisma/client';

export class UserService {
  static async createUser(data: any, auditorId: string, auditorRole: string, ipAddress?: string, userAgent?: string) {
    const { fullName, username, email, phone, password, role, status } = data;

    // Validate unique constraints
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new BadRequestError('Username or email already exists');
    }

    const roleRecord = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!roleRecord) {
      throw new BadRequestError('Invalid role specified');
    }

    if (auditorRole !== 'SUPER_ADMIN' && roleRecord.name === 'SUPER_ADMIN') {
      throw new BadRequestError('You are not authorized to assign SUPER_ADMIN role');
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        username,
        email,
        phone,
        password: hashedPassword,
        roleId: roleRecord.id,
        status: status || 'ACTIVE',
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: AuditAction.CREATE,
        entity: 'user',
        entityId: newUser.id,
        userId: auditorId,
        description: `Created new user "${username}"`,
        ipAddress,
        userAgent,
      },
    });

    return newUser;
  }

  static async getUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        role: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        deletedAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user || user.deletedAt) {
      throw new BadRequestError('User not found');
    }

    const { deletedAt, ...rest } = user;
    return rest;
  }

  static async updateUser(id: string, data: any, auditorId: string, auditorRole: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user || user.deletedAt) {
      throw new BadRequestError('User not found');
    }

    const { fullName, username, email, phone, role, status } = data;

    if (auditorRole !== 'SUPER_ADMIN' && user.role.name === 'SUPER_ADMIN') {
      throw new BadRequestError('You are not authorized to modify a SUPER_ADMIN');
    }

    // Validate unique if changing
    if (username !== user.username || email !== user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new BadRequestError('Username or email already in use');
      }
    }

    let roleId = user.roleId;
    if (role) {
      const roleRecord = await prisma.role.findUnique({ where: { name: role } });
      if (!roleRecord) throw new BadRequestError('Invalid role specified');
      
      if (auditorRole !== 'SUPER_ADMIN' && roleRecord.name === 'SUPER_ADMIN') {
        throw new BadRequestError('You are not authorized to assign SUPER_ADMIN role');
      }
      
      roleId = roleRecord.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: fullName || user.name,
        username: username || user.username,
        email: email || user.email,
        phone: phone !== undefined ? phone : user.phone,
        roleId,
        status: status || user.status,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: 'user',
        entityId: updatedUser.id,
        userId: auditorId,
        description: `Updated user "${updatedUser.username}"`,
        ipAddress,
        userAgent,
      },
    });

    return updatedUser;
  }

  static async resetPassword(id: string, newPassword: string, auditorId: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) {
      throw new BadRequestError('User not found');
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: 'user',
        entityId: user.id,
        userId: auditorId,
        description: `Reset password for user "${user.username}"`,
        ipAddress,
        userAgent,
      },
    });
  }

  static async updateStatus(id: string, status: string, auditorId: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) {
      throw new BadRequestError('User not found');
    }

    await prisma.user.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entity: 'user',
        entityId: user.id,
        userId: auditorId,
        description: `Changed status for user "${user.username}" to ${status}`,
        ipAddress,
        userAgent,
      },
    });
  }

  static async deleteUser(id: string, auditorId: string, auditorRole: string, ipAddress?: string, userAgent?: string) {
    if (id === auditorId) {
      throw new BadRequestError('Cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user || user.deletedAt) {
      throw new BadRequestError('User not found');
    }

    if (auditorRole !== 'SUPER_ADMIN' && user.role.name === 'SUPER_ADMIN') {
      throw new BadRequestError('You are not authorized to delete a SUPER_ADMIN');
    }

    if (user.role.name === 'SUPER_ADMIN') {
      const superAdminsCount = await prisma.user.count({
        where: { role: { name: 'SUPER_ADMIN' }, deletedAt: null },
      });
      if (superAdminsCount <= 1) {
        throw new BadRequestError('Cannot delete the last SUPER_ADMIN account');
      }
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });

    await prisma.auditLog.create({
      data: {
        action: AuditAction.DELETE,
        entity: 'user',
        entityId: user.id,
        userId: auditorId,
        description: `Deleted user "${user.username}"`,
        ipAddress,
        userAgent,
      },
    });
  }
}
