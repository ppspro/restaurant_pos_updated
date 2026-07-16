import { api } from './axios';
export const menuApi = {
  getMenuItems: () => api.get('/menu'),
  createMenuItem: (data: any) => api.post('/menu', data),
  updateMenuItem: (id: string, data: any) => api.put(`/menu/${id}`, data),
  deleteMenuItem: (id: string) => api.delete(`/menu/${id}`),
  uploadImage: (formData: FormData) => api.post('/menu/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
