import { UserRole } from '@prisma/client';

export interface AuthUserResponse {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}
