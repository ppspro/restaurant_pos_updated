import { api } from './axios';
import type { User, CreateUserRequest, UpdateUserRequest, ResetPasswordRequest } from '../types/user';
import type { AxiosResponse } from 'axios';
import type { ApiResponseEnvelope } from '../types/auth';

export const usersApi = {
  getUsers: (): Promise<AxiosResponse<ApiResponseEnvelope<User[]>>> => 
    api.get('/users'),

  getUserById: (id: string): Promise<AxiosResponse<ApiResponseEnvelope<User>>> => 
    api.get(`/users/${id}`),

  createUser: (data: CreateUserRequest): Promise<AxiosResponse<ApiResponseEnvelope<User>>> => 
    api.post('/users', data),

  updateUser: (id: string, data: UpdateUserRequest): Promise<AxiosResponse<ApiResponseEnvelope<User>>> => 
    api.put(`/users/${id}`, data),

  updateStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponseEnvelope<null>>> => 
    api.patch(`/users/${id}/status`, { status }),

  resetPassword: (id: string, data: ResetPasswordRequest): Promise<AxiosResponse<ApiResponseEnvelope<null>>> => 
    api.put(`/users/${id}/reset-password`, data),

  deleteUser: (id: string): Promise<AxiosResponse<ApiResponseEnvelope<null>>> => 
    api.delete(`/users/${id}`),
};
