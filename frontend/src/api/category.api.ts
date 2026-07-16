import { api } from './axios';
export const categoryApi = {
  getCategories: () => api.get('/categories'),
};
