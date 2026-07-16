import { api } from './axios';
import type { 
  LoginCredentials, 
  ChangePasswordRequest, 
  ApiResponseEnvelope, 
  LoginResponsePayload, 
  AuthUser 
} from '../types/auth';
import type { AxiosResponse } from 'axios';

export const authApi = {
  login: (data: LoginCredentials): Promise<AxiosResponse<ApiResponseEnvelope<LoginResponsePayload>>> => 
    api.post('/auth/login', data),
    
  logout: (reason?: string): Promise<AxiosResponse<ApiResponseEnvelope<null>>> => 
    api.post('/auth/logout', { reason }),
    
  me: (): Promise<AxiosResponse<ApiResponseEnvelope<AuthUser>>> => 
    api.get('/auth/me'),
    
  changePassword: (data: ChangePasswordRequest): Promise<AxiosResponse<ApiResponseEnvelope<null>>> => 
    api.put('/auth/change-password', data),
};
export default authApi;
