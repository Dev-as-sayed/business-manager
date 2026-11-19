export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  SALES: 'Sales',
  CHINA_OPERATIONS: 'China operations',
  FINANCE: 'Finance',
  CUSTOMER: 'Customer',
};

export const roleLabel = (role: string | null | undefined): string =>
  role ? (ROLE_LABELS[role] ?? role) : '—';

export const getDefaultRoute = (role: string | null | undefined): string => {
  switch (role) {
    case 'CHINA_OPERATIONS':
      return '/assignments';
    case 'FINANCE':
      return '/finance';
    default:
      return '/dashboard';
  }
};
