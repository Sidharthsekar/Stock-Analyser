export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: number;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface DeleteUserRequest {
  userId: string;
}
