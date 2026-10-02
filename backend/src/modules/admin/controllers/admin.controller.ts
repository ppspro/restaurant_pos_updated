import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {

  // ─── Dashboard ───────────────────────────────────────────────
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch admin stats' });
    }
  }

  // ─── Users ───────────────────────────────────────────────────
  static async getUsers(req: Request, res: Response) {
    try {
      const { search, page, limit } = req.query;
      const result = await AdminService.getUsers({
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20
      });
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  }

  static async forceLogout(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const result = await AdminService.forceLogout(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to force logout' });
    }
  }

  // ─── Roles & Permissions ──────────────────────────────────────
  static async getRoles(req: Request, res: Response) {
    try {
      const roles = await AdminService.getRoles();
      res.json({ success: true, data: roles });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch roles' });
    }
  }

  static async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await AdminService.getAllPermissions();
      res.json({ success: true, data: permissions });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch permissions' });
    }
  }

  static async updateRolePermissions(req: Request, res: Response) {
    try {
      const roleId = req.params.roleId as string;
      const { permissionIds } = req.body;
      console.log(`[AdminController] updateRolePermissions for roleId: ${roleId}, permissionIds: ${JSON.stringify(permissionIds)}`);
      const result = await AdminService.updateRolePermissions(roleId, permissionIds || []);
      console.log(`[AdminController] Successfully updated roleId: ${roleId}`);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error(`[AdminController] Failed to update permissions for roleId ${req.params.roleId}:`, error);
      res.status(500).json({ success: false, error: 'Failed to update permissions' });
    }
  }

  // ─── Settings ────────────────────────────────────────────────
  static async getSettings(req: Request, res: Response) {
    try {
      const settings = await AdminService.getSettings();
      res.json({ success: true, data: settings });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const result = await AdminService.updateSettings(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
  }

  // ─── System Health ────────────────────────────────────────────
  static async getSystemHealth(req: Request, res: Response) {
    try {
      const health = await AdminService.getSystemHealth();
      res.json({ success: true, data: health });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch system health' });
    }
  }

  // ─── RECOVERY KEYS ──────────────────────────────────────────
  static async getRecoveryKeys(req: Request, res: Response) {
    try {
      const keys = await AdminService.getRecoveryKeys();
      res.json({ success: true, data: keys });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch recovery keys' });
    }
  }

  static async generateRecoveryKey(req: Request, res: Response) {
    try {
      const { label } = req.body;
      const createdBy = (req as any).user.id;
      const result = await AdminService.createRecoveryKey(label, createdBy);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to generate recovery key' });
    }
  }

  static async revokeRecoveryKey(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await AdminService.revokeRecoveryKey(id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to revoke recovery key' });
    }
  }
}
