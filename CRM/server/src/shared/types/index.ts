export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  customerId?: string | null;
}

export interface RequestMeta {
  ip?: string | null;
  userAgent?: string | null;
}
