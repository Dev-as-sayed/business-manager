export type DirectoryRole = 'ADMIN' | 'CUSTOMER' | 'SUPPLIER';

export interface CreateDirectoryUserInput {
  name: string;
  email: string;
  password?: string;
  role: DirectoryRole;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
}

export interface UpdateDirectoryUserInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
}
