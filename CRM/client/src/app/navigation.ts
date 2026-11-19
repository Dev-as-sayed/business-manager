import {
  Boxes,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  PackageCheck,
  ShieldCheck,
  Stamp,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  KeyRound,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: { resource: string; action: string };
  roles?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      {
        to: '/assignments',
        label: 'Assignments',
        icon: ClipboardCheck,
        permission: { resource: 'product_requests', action: 'read' },
        roles: ['CHINA_OPERATIONS'],
      },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/customers', label: 'Customers', icon: Users, permission: { resource: 'customers', action: 'read' } },
      {
        to: '/product-requests',
        label: 'Product requests',
        icon: ClipboardList,
        permission: { resource: 'product_requests', action: 'read' },
      },
      {
        to: '/quotations',
        label: 'Quotations',
        icon: FileText,
        permission: { resource: 'quotations', action: 'read' },
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        to: '/suppliers',
        label: 'Suppliers',
        icon: Warehouse,
        permission: { resource: 'suppliers', action: 'read' },
      },
      {
        to: '/purchase-orders',
        label: 'Purchase orders',
        icon: PackageCheck,
        permission: { resource: 'purchase_orders', action: 'read' },
      },
      {
        to: '/quality-control',
        label: 'Quality control',
        icon: ShieldCheck,
        permission: { resource: 'quality_control', action: 'read' },
      },
      {
        to: '/shipments',
        label: 'Shipments',
        icon: Truck,
        permission: { resource: 'shipments', action: 'read' },
      },
      {
        to: '/customs',
        label: 'Customs',
        icon: Stamp,
        permission: { resource: 'customs', action: 'read' },
      },
    ],
  },
  {
    label: 'Accounts',
    items: [
      {
        to: '/finance',
        label: 'Ledger',
        icon: Wallet,
        permission: { resource: 'finance', action: 'read' },
      },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        to: '/users',
        label: 'Users',
        icon: UserCog,
        permission: { resource: 'users', action: 'read' },
      },
      {
        to: '/roles',
        label: 'Roles',
        icon: KeyRound,
        permission: { resource: 'roles', action: 'read' },
      },
    ],
  },
];

export const getNavItemForPath = (pathname: string): NavItem | undefined => {
  const items = NAV_GROUPS.flatMap((group) => group.items);

  return items
    .filter((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
};

export const iconForPath = (pathname: string): LucideIcon =>
  getNavItemForPath(pathname)?.icon ?? Boxes;
