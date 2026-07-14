export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  role: {
    name: string;
  };
  status: string;
  terminal?: {
    terminalName: string;
  } | null;
  lastLogin?: string | null;
  createdAt: string;
}

export interface CreateUserRequest {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
  status: string;
  terminalId?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

export interface ResetPasswordRequest {
  newPassword?: string;
}
