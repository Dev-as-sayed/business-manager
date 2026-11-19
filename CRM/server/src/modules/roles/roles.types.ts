export interface CreateRoleInput {
  name: string;
  description?: string | null;
  permissions?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  permissions?: string[];
}

export interface ListRolesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
