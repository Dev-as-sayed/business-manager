export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleListArgs {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PermissionOption {
  id: string;
  key: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface RoleInput {
  name: string;
  description?: string;
  permissions: string[];
}
