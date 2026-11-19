export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface RoleRef {
  id: string;
  name: string;
  description: string | null;
}

export interface CustomerRef {
  id: string;
  name: string;
}

export interface ManagedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: UserStatus;
  roleId: string;
  customerId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: RoleRef;
  customer: CustomerRef | null;
}

export interface UserListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: string;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: string;
  customerId?: string;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: string;
  customerId?: string;
}

export interface UpdateUserStatusInput {
  id: string;
  status: UserStatus;
}

export const USER_STATUS_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  ACTIVE: ['INACTIVE', 'SUSPENDED'],
  INACTIVE: ['ACTIVE'],
  SUSPENDED: ['ACTIVE'],
};

export const USER_STATUS_OPTIONS: { label: string; value: UserStatus }[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
];
