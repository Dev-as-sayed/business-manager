import type { UserStatus } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  roleId: string;
  customerId?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  roleId?: string;
  customerId?: string | null;
}

export interface UpdateUserStatusInput {
  status: UserStatus;
}

export type UserSortField = 'email' | 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt';
export type SortOrder = 'asc' | 'desc';

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: string;
  customerId?: string;
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
}
