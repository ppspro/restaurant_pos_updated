import { api } from './axios';

export const adminApi = {
  getRoles: async () => {
    const response = await api.get('/admin/roles');
    return response.data.data;
  },

  getAllPermissions: async () => {
    const response = await api.get('/admin/permissions');
    return response.data.data;
  },

  updateRolePermissions: async (roleId: string, permissionIds: string[]) => {
    const response = await api.put(`/admin/roles/${roleId}/permissions`, { permissionIds });
    return response.data.data;
  }
};
