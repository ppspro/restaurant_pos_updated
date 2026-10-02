export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: 'SUPER_ADMIN' | 'CASHIER' | 'MANAGER';
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

export interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginResponsePayload {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
