import {
  Bell,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Globe2,
  LayoutDashboard,
  PackageCheck,
  Truck,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';

export type AppRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SALES'
  | 'FINANCE'
  | 'CHINA_OPERATIONS'
  | 'SHIPPING_AGENT'
  | 'CUSTOMER';

export interface TabDefinition {
  name: string;
  title: string;
  icon: LucideIcon;
  roles: AppRole[];
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Administrator',
  ADMIN: 'Administrator',
  SALES: 'Sales',
  FINANCE: 'Finance',
  CHINA_OPERATIONS: 'China operations',
  SHIPPING_AGENT: 'Shipping agent',
  CUSTOMER: 'Customer',
};

export const TABS: TabDefinition[] = [
  {
    name: 'home',
    title: 'Home',
    icon: LayoutDashboard,
    roles: [
      'SUPER_ADMIN',
      'ADMIN',
      'SALES',
      'FINANCE',
      'CHINA_OPERATIONS',
      'SHIPPING_AGENT',
      'CUSTOMER',
    ],
  },
  {
    name: 'orders',
    title: 'Orders',
    icon: ClipboardList,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'FINANCE', 'CUSTOMER'],
  },
  {
    name: 'tasks',
    title: 'Tasks',
    icon: PackageCheck,
    roles: ['SUPER_ADMIN', 'ADMIN', 'CHINA_OPERATIONS'],
  },
  {
    name: 'qc',
    title: 'QC',
    icon: ClipboardCheck,
    roles: ['SUPER_ADMIN', 'ADMIN', 'CHINA_OPERATIONS', 'CUSTOMER'],
  },
  {
    name: 'shipments',
    title: 'Shipments',
    icon: Truck,
    roles: [
      'SUPER_ADMIN',
      'ADMIN',
      'SALES',
      'FINANCE',
      'CHINA_OPERATIONS',
      'SHIPPING_AGENT',
      'CUSTOMER',
    ],
  },
  {
    name: 'customs',
    title: 'Customs',
    icon: Globe2,
    roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'CHINA_OPERATIONS', 'SHIPPING_AGENT'],
  },
  {
    name: 'quotations',
    title: 'Quotes',
    icon: FileText,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'CUSTOMER'],
  },
  {
    name: 'notifications',
    title: 'Alerts',
    icon: Bell,
    roles: [
      'SUPER_ADMIN',
      'ADMIN',
      'SALES',
      'FINANCE',
      'CHINA_OPERATIONS',
      'SHIPPING_AGENT',
      'CUSTOMER',
    ],
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: UserRound,
    roles: [
      'SUPER_ADMIN',
      'ADMIN',
      'SALES',
      'FINANCE',
      'CHINA_OPERATIONS',
      'SHIPPING_AGENT',
      'CUSTOMER',
    ],
  },
];

const CUSTOMER_TABS = new Set(['home', 'orders', 'quotations', 'shipments', 'profile']);
const CHINA_TABS = new Set(['home', 'tasks', 'qc', 'shipments', 'profile']);
const SHIPPING_TABS = new Set(['home', 'shipments', 'customs', 'notifications', 'profile']);
const SALES_TABS = new Set(['home', 'orders', 'quotations', 'shipments', 'profile']);
const ADMIN_TABS = new Set(['home', 'orders', 'qc', 'shipments', 'profile']);
const FINANCE_TABS = new Set(['home', 'orders', 'shipments', 'customs', 'profile']);

const VISIBLE_BY_ROLE: Record<AppRole, Set<string>> = {
  CUSTOMER: CUSTOMER_TABS,
  CHINA_OPERATIONS: CHINA_TABS,
  SHIPPING_AGENT: SHIPPING_TABS,
  SALES: SALES_TABS,
  ADMIN: ADMIN_TABS,
  SUPER_ADMIN: ADMIN_TABS,
  FINANCE: FINANCE_TABS,
};

export const getTabsForRole = (role: string | null | undefined): TabDefinition[] => {
  const resolvedRole = (role ?? 'CUSTOMER') as AppRole;
  const visible = VISIBLE_BY_ROLE[resolvedRole] ?? CUSTOMER_TABS;

  return TABS.filter((tab) => visible.has(tab.name));
};

export const getHomeForRole = (role: string | null | undefined): string => {
  switch (role) {
    case 'CUSTOMER':
      return '/orders';
    case 'CHINA_OPERATIONS':
      return '/tasks';
    case 'SHIPPING_AGENT':
      return '/shipments';
    default:
      return '/home';
  }
};

export const hasRole = (role: string | null | undefined, allowed: AppRole[]): boolean =>
  allowed.includes((role ?? 'CUSTOMER') as AppRole);
