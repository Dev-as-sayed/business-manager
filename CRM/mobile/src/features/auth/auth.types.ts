export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: UserStatus;
  role: string;
  permissions: string[];
  customerId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetResult {
  token: string;
  expiresAt: string;
  email: string;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
