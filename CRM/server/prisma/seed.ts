import bcrypt from 'bcrypt';
import {
  ConsignmentProductCategory,
  ConsignmentProductStatus,
  ConsignmentStatus,
  ConsignmentTransactionDirection,
  ConsignmentTransactionMethod,
  ConsignmentTransactionParty,
  ConsignmentTransactionStatus,
  ConsignmentTransactionType,
  CustomsStatus,
  CustomerStatus,
  LedgerEntryStatus,
  LedgerEntryType,
  Prisma,
  PrismaClient,
  ProductRequestStatus,
  PurchaseOrderStatus,
  QcStatus,
  QuotationStatus,
  ShipmentStatus,
  SupplierStatus,
  UserStatus,
} from '@prisma/client';
import { env } from '@/config/env';
import {
  calculateProduct,
  calculateTotals,
  normalizeTransaction,
} from '@/modules/consignments/consignments.calculations';
import type {
  ConsignmentProductInput,
  ConsignmentTransactionInput,
} from '@/modules/consignments/consignments.types';

const prisma = new PrismaClient();

const RESOURCES = [
  'users',
  'roles',
  'customers',
  'suppliers',
  'product_requests',
  'quotations',
  'purchase_orders',
  'quality_control',
  'shipments',
  'customs',
  'finance',
  'attachments',
  'audit_logs',
  'consignments',
  'reports',
] as const;

const ACTIONS = ['read', 'create', 'update', 'delete', 'approve', 'export'] as const;

type Resource = (typeof RESOURCES)[number];
type Action = (typeof ACTIONS)[number];
type PermissionKey = `${Resource}:${Action}`;

interface RoleSpec {
  name: string;
  description: string;
  permissions:
    | 'all'
    | Array<{
        resource: Resource;
        actions: Action[];
      }>;
}

const ROLE_SPECS: RoleSpec[] = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full system access',
    permissions: 'all',
  },
  {
    name: 'ADMIN',
    description: 'Administrative access',
    permissions: 'all',
  },
  {
    name: 'SALES',
    description: 'Customers, product requests, and quotations',
    permissions: [
      { resource: 'customers', actions: ['read', 'create', 'update'] },
      { resource: 'product_requests', actions: ['read', 'create', 'update'] },
      { resource: 'quotations', actions: ['read', 'create', 'update', 'export'] },
      { resource: 'purchase_orders', actions: ['read'] },
      { resource: 'shipments', actions: ['read'] },
      { resource: 'attachments', actions: ['read', 'create'] },
      { resource: 'consignments', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
    ],
  },
  {
    name: 'CHINA_OPERATIONS',
    description: 'Sourcing, quality control, and logistics',
    permissions: [
      { resource: 'suppliers', actions: ['read', 'create', 'update'] },
      { resource: 'product_requests', actions: ['read', 'update'] },
      { resource: 'purchase_orders', actions: ['read', 'create', 'update'] },
      { resource: 'quality_control', actions: ['read', 'create', 'update'] },
      { resource: 'shipments', actions: ['read', 'create', 'update'] },
      { resource: 'customs', actions: ['read', 'update'] },
      { resource: 'attachments', actions: ['read', 'create', 'delete'] },
      { resource: 'consignments', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
    ],
  },
  {
    name: 'SHIPPING_AGENT',
    description: 'Shipment updates, documents, and customs clearance',
    permissions: [
      { resource: 'shipments', actions: ['read', 'create', 'update'] },
      { resource: 'customs', actions: ['read', 'create', 'update'] },
      { resource: 'purchase_orders', actions: ['read'] },
      { resource: 'attachments', actions: ['read', 'create'] },
      { resource: 'consignments', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
    ],
  },
  {
    name: 'FINANCE',
    description: 'Ledger, payments, and approvals',
    permissions: [
      { resource: 'quotations', actions: ['read'] },
      { resource: 'purchase_orders', actions: ['read', 'approve'] },
      { resource: 'shipments', actions: ['read'] },
      { resource: 'customs', actions: ['read', 'update'] },
      { resource: 'finance', actions: ['read', 'create', 'update', 'approve', 'export'] },
      { resource: 'attachments', actions: ['read', 'create'] },
      { resource: 'audit_logs', actions: ['read'] },
      { resource: 'consignments', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'export'] },
    ],
  },
  {
    name: 'CUSTOMER',
    description: 'Customer portal access',
    permissions: [
      { resource: 'customers', actions: ['read'] },
      { resource: 'product_requests', actions: ['read', 'create', 'update'] },
      { resource: 'quotations', actions: ['read', 'approve'] },
      { resource: 'purchase_orders', actions: ['read'] },
      { resource: 'quality_control', actions: ['read'] },
      { resource: 'shipments', actions: ['read'] },
      { resource: 'attachments', actions: ['read', 'create'] },
    ],
  },
];

const permissionKey = (resource: Resource, action: Action): PermissionKey =>
  `${resource}:${action}`;

const now = new Date();
const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number): Date => new Date(now.getTime() - days * DAY_MS);
const daysFromNow = (days: number): Date => new Date(now.getTime() + days * DAY_MS);
const money = (value: string): Prisma.Decimal => new Prisma.Decimal(value);
const moneyNumber = (value: number): Prisma.Decimal => new Prisma.Decimal(value.toFixed(2));
const marginNumber = (value: number): Prisma.Decimal => new Prisma.Decimal(value.toFixed(4));
const optionalMoney = (value: string | null): Prisma.Decimal | null =>
  value === null ? null : new Prisma.Decimal(value);

export async function seedPermissions(
  client: PrismaClient = prisma,
): Promise<Map<PermissionKey, string>> {
  const permissions = new Map<PermissionKey, string>();

  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const permission = await client.permission.upsert({
        where: { resource_action: { resource, action } },
        update: { description: `${action} ${resource}` },
        create: { resource, action, description: `${action} ${resource}` },
      });

      permissions.set(permissionKey(resource, action), permission.id);
    }
  }

  return permissions;
}

export async function seedRoles(
  permissions: Map<PermissionKey, string>,
  client: PrismaClient = prisma,
): Promise<Map<string, string>> {
  const roles = new Map<string, string>();
  const allPermissionIds = [...permissions.values()];

  for (const spec of ROLE_SPECS) {
    const role = await client.role.upsert({
      where: { name: spec.name },
      update: { description: spec.description, isSystem: true },
      create: { name: spec.name, description: spec.description, isSystem: true },
    });

    roles.set(spec.name, role.id);

    const permissionIds =
      spec.permissions === 'all'
        ? allPermissionIds
        : spec.permissions.flatMap(({ resource, actions }) =>
            actions.map((action) => {
              const id = permissions.get(permissionKey(resource, action));
              if (!id) {
                throw new Error(`Missing permission ${resource}:${action}`);
              }
              return id;
            }),
          );

    await client.rolePermission.deleteMany({ where: { roleId: role.id } });
    await client.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
      skipDuplicates: true,
    });
  }

  return roles;
}

export const getRoleId = (roles: Map<string, string>, name: string): string => {
  const id = roles.get(name);

  if (!id) {
    throw new Error(`${name} role was not seeded`);
  }

  return id;
};

interface CustomerSeed {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  notes: string;
  status: CustomerStatus;
  createdAt: Date;
}

const CUSTOMERS: CustomerSeed[] = [
  {
    id: 'seed-customer-acme',
    name: 'Acme Home Goods',
    contactName: 'Olivia Bennett',
    email: 'olivia.bennett@acmehome.test',
    phone: '+1 415 555 0134',
    address: '245 Market Street',
    city: 'San Francisco',
    country: 'United States',
    taxId: 'US-94-4820193',
    notes: 'Key account. Net 30 terms. Prefers consolidated monthly shipments.',
    status: CustomerStatus.ACTIVE,
    createdAt: daysAgo(180),
  },
  {
    id: 'seed-customer-northwind',
    name: 'Northwind Retail Group',
    contactName: 'James Patel',
    email: 'james.patel@northwindretail.test',
    phone: '+44 20 7946 0182',
    address: '18 Bishopsgate',
    city: 'London',
    country: 'United Kingdom',
    taxId: 'GB-482 9103 55',
    notes: 'Seasonal buyer. Requires DDP pricing for all orders.',
    status: CustomerStatus.ACTIVE,
    createdAt: daysAgo(145),
  },
  {
    id: 'seed-customer-sakura',
    name: 'Sakura Living',
    contactName: 'Haruto Sato',
    email: 'haruto.sato@sakuraliving.test',
    phone: '+81 3 5550 2281',
    address: '2-11-3 Ginza',
    city: 'Tokyo',
    country: 'Japan',
    taxId: 'JP-3010-8842-1190',
    notes: 'Requires bilingual packaging and JIS compliance documentation.',
    status: CustomerStatus.ACTIVE,
    createdAt: daysAgo(120),
  },
  {
    id: 'seed-customer-atlas',
    name: 'Atlas Outdoor Supply',
    contactName: 'Mia Thompson',
    email: 'mia.thompson@atlasoutdoor.test',
    phone: '+1 604 555 0191',
    address: '980 Howe Street',
    city: 'Vancouver',
    country: 'Canada',
    taxId: 'CA-71928-4402',
    notes: 'Account is paused while retail distribution is renegotiated.',
    status: CustomerStatus.INACTIVE,
    createdAt: daysAgo(95),
  },
  {
    id: 'seed-customer-meridian',
    name: 'Meridian Hospitality',
    contactName: 'Layla Haddad',
    email: 'layla.haddad@meridianhospitality.test',
    phone: '+971 4 555 0317',
    address: 'Sheikh Zayed Road',
    city: 'Dubai',
    country: 'United Arab Emirates',
    taxId: 'AE-1002988447000031',
    notes: 'Blocked pending resolution of an overdue invoice.',
    status: CustomerStatus.BLOCKED,
    createdAt: daysAgo(80),
  },
];

interface SupplierSeed {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  notes: string;
  status: SupplierStatus;
  createdAt: Date;
}

const SUPPLIERS: SupplierSeed[] = [
  {
    id: 'seed-supplier-bright',
    name: 'Shenzhen Bright Electronics',
    contactName: 'Wei Chen',
    email: 'wei.chen@brightelectronics.test',
    phone: '+86 755 5555 0142',
    address: '88 Bao Yuan Road',
    city: 'Shenzhen',
    country: 'China',
    taxId: 'CN-91440300MA5F82K31L',
    notes: 'Preferred supplier for lighting and small electronics.',
    status: SupplierStatus.ACTIVE,
    createdAt: daysAgo(170),
  },
  {
    id: 'seed-supplier-harbor',
    name: 'Ningbo Harbor Textiles',
    contactName: 'Ling Wang',
    email: 'ling.wang@harbortextiles.test',
    phone: '+86 574 5555 0188',
    address: '27 Jiangnan Road',
    city: 'Ningbo',
    country: 'China',
    taxId: 'CN-91330200MA2H6L8P5R',
    notes: 'Strong QC record and 30-day production lead time.',
    status: SupplierStatus.ACTIVE,
    createdAt: daysAgo(150),
  },
  {
    id: 'seed-supplier-apex',
    name: 'Guangzhou Apex Manufacturing',
    contactName: 'Jun Liu',
    email: 'jun.liu@apexmfg.test',
    phone: '+86 20 5555 0273',
    address: '112 Huangpu Avenue',
    city: 'Guangzhou',
    country: 'China',
    taxId: 'CN-91440101MA5C9T2N7X',
    notes: 'Bamboo and home goods specialist.',
    status: SupplierStatus.ACTIVE,
    createdAt: daysAgo(135),
  },
  {
    id: 'seed-supplier-yiwu',
    name: 'Yiwu Trend Imports',
    contactName: 'Fang Zhao',
    email: 'fang.zhao@yiwutrend.test',
    phone: '+86 579 5555 0369',
    address: 'Futian Market District',
    city: 'Yiwu',
    country: 'China',
    taxId: 'CN-91330782MA2E4B7Q1W',
    notes: 'Paused after repeated packaging quality issues.',
    status: SupplierStatus.INACTIVE,
    createdAt: daysAgo(110),
  },
  {
    id: 'seed-supplier-oceanic',
    name: 'Xiamen Oceanic Packaging',
    contactName: 'Mei Lin',
    email: 'mei.lin@oceanicpackaging.test',
    phone: '+86 592 5555 0426',
    address: '9 Haicang Avenue',
    city: 'Xiamen',
    country: 'China',
    taxId: 'CN-91350200MA31Y8L64K',
    notes: 'Backup packaging supplier for custom retail cartons.',
    status: SupplierStatus.ACTIVE,
    createdAt: daysAgo(70),
  },
];

interface UserSeed {
  key: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  customerId?: string;
  lastLoginAt: Date;
  createdAt: Date;
}

const USERS: UserSeed[] = [
  {
    key: 'manager',
    email: 'manager@crm.local',
    firstName: 'Morgan',
    lastName: 'Lee',
    phone: '+1 415 555 0101',
    role: 'ADMIN',
    lastLoginAt: daysAgo(1),
    createdAt: daysAgo(175),
  },
  {
    key: 'sales',
    email: 'sales@crm.local',
    firstName: 'Sofia',
    lastName: 'Reyes',
    phone: '+1 415 555 0102',
    role: 'SALES',
    lastLoginAt: daysAgo(0),
    createdAt: daysAgo(160),
  },
  {
    key: 'operations',
    email: 'ops@crm.local',
    firstName: 'Wei',
    lastName: 'Zhang',
    phone: '+86 755 5555 0103',
    role: 'CHINA_OPERATIONS',
    lastLoginAt: daysAgo(0),
    createdAt: daysAgo(155),
  },
  {
    key: 'shipping',
    email: 'shipping@crm.local',
    firstName: 'Lena',
    lastName: 'Park',
    phone: '+82 2 555 0106',
    role: 'SHIPPING_AGENT',
    lastLoginAt: daysAgo(1),
    createdAt: daysAgo(140),
  },
  {
    key: 'finance',
    email: 'finance@crm.local',
    firstName: 'Noah',
    lastName: 'Williams',
    phone: '+1 415 555 0104',
    role: 'FINANCE',
    lastLoginAt: daysAgo(1),
    createdAt: daysAgo(150),
  },
  {
    key: 'customer',
    email: 'buyer@acme.test',
    firstName: 'Emma',
    lastName: 'Carter',
    phone: '+1 415 555 0105',
    role: 'CUSTOMER',
    customerId: 'seed-customer-acme',
    lastLoginAt: daysAgo(2),
    createdAt: daysAgo(100),
  },
];

interface UserIds {
  superAdmin: string;
  manager: string;
  sales: string;
  operations: string;
  finance: string;
  customer: string;
}

async function seedCustomers(): Promise<void> {
  for (const customer of CUSTOMERS) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: { ...customer, deletedAt: null },
      create: { ...customer },
    });
  }
}

async function seedSuppliers(): Promise<void> {
  for (const supplier of SUPPLIERS) {
    await prisma.supplier.upsert({
      where: { id: supplier.id },
      update: { ...supplier, deletedAt: null },
      create: { ...supplier },
    });
  }
}

async function seedUsers(roles: Map<string, string>): Promise<UserIds> {
  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, env.BCRYPT_SALT_ROUNDS);
  const superAdminEmail = env.SEED_ADMIN_EMAIL.toLowerCase();

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      passwordHash,
      firstName: env.SEED_ADMIN_FIRST_NAME,
      lastName: env.SEED_ADMIN_LAST_NAME,
      roleId: getRoleId(roles, 'SUPER_ADMIN'),
      status: UserStatus.ACTIVE,
      customerId: null,
      deletedAt: null,
    },
    create: {
      email: superAdminEmail,
      passwordHash,
      firstName: env.SEED_ADMIN_FIRST_NAME,
      lastName: env.SEED_ADMIN_LAST_NAME,
      roleId: getRoleId(roles, 'SUPER_ADMIN'),
      status: UserStatus.ACTIVE,
    },
  });

  const ids = new Map<string, string>();

  for (const user of USERS) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roleId: getRoleId(roles, user.role),
        customerId: user.customerId ?? null,
        status: UserStatus.ACTIVE,
        lastLoginAt: user.lastLoginAt,
        deletedAt: null,
      },
      create: {
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roleId: getRoleId(roles, user.role),
        customerId: user.customerId ?? null,
        status: UserStatus.ACTIVE,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });

    ids.set(user.key, record.id);
  }

  const getUserId = (key: string): string => {
    const id = ids.get(key);

    if (!id) {
      throw new Error(`${key} user was not seeded`);
    }

    return id;
  };

  return {
    superAdmin: superAdmin.id,
    manager: getUserId('manager'),
    sales: getUserId('sales'),
    operations: getUserId('operations'),
    finance: getUserId('finance'),
    customer: getUserId('customer'),
  };
}

interface ProductRequestItemSeed {
  id: string;
  name: string;
  description: string;
  quantity: number;
  targetPrice: string | null;
  notes: string | null;
}

interface ProductRequestSeed {
  id: string;
  requestNumber: string;
  customerId: string;
  title: string;
  description: string;
  status: ProductRequestStatus;
  assignedUserId: string | null;
  createdById: string;
  createdAt: Date;
  items: ProductRequestItemSeed[];
}

const buildProductRequests = (users: UserIds): ProductRequestSeed[] => [
  {
    id: 'seed-pr-1',
    requestNumber: 'PR-2026-0001',
    customerId: 'seed-customer-acme',
    title: 'Q4 Kitchen Storage Collection',
    description: 'Stackable pantry and spice organization range for the Q4 home category reset.',
    status: ProductRequestStatus.APPROVED,
    assignedUserId: users.operations,
    createdById: users.sales,
    createdAt: daysAgo(75),
    items: [
      {
        id: 'seed-pr-1-item-1',
        name: 'Modular Pantry Container 12-Pack',
        description: 'BPA-free stackable containers with bamboo lids.',
        quantity: 600,
        targetPrice: '17.50',
        notes: 'Matte white body with natural bamboo lid.',
      },
      {
        id: 'seed-pr-1-item-2',
        name: 'Stackable Spice Rack',
        description: 'Three-tier expandable spice rack with matte powder coating.',
        quantity: 400,
        targetPrice: '11.20',
        notes: 'Must fit standard 50 ml spice jars.',
      },
    ],
  },
  {
    id: 'seed-pr-2',
    requestNumber: 'PR-2026-0002',
    customerId: 'seed-customer-northwind',
    title: 'Holiday Solar Lighting Program',
    description: 'Solar outdoor lighting assortment for the holiday promotional endcap.',
    status: ProductRequestStatus.APPROVED,
    assignedUserId: users.operations,
    createdById: users.sales,
    createdAt: daysAgo(60),
    items: [
      {
        id: 'seed-pr-2-item-1',
        name: 'Solar LED String Lights 20m',
        description: 'Warm white solar string lights with eight lighting modes.',
        quantity: 1200,
        targetPrice: '9.25',
        notes: 'UK plug-free solar panel configuration.',
      },
      {
        id: 'seed-pr-2-item-2',
        name: 'Solar Garden Stake Lights 4-Pack',
        description: 'Stainless steel stake lights with automatic dusk activation.',
        quantity: 800,
        targetPrice: '7.80',
        notes: 'Packaging must carry UKCA marking.',
      },
    ],
  },
  {
    id: 'seed-pr-3',
    requestNumber: 'PR-2026-0003',
    customerId: 'seed-customer-sakura',
    title: 'Bamboo Bathroom Accessories',
    description: 'Sustainable bamboo bathroom collection for the spring catalog.',
    status: ProductRequestStatus.APPROVED,
    assignedUserId: users.operations,
    createdById: users.sales,
    createdAt: daysAgo(55),
    items: [
      {
        id: 'seed-pr-3-item-1',
        name: 'Bamboo Bathroom Tray',
        description: 'Water-resistant bamboo tray with raised edge.',
        quantity: 800,
        targetPrice: '6.80',
        notes: 'Natural finish, no visible knots.',
      },
      {
        id: 'seed-pr-3-item-2',
        name: 'Bamboo Soap Dish 4-Pack',
        description: 'Draining soap dishes made from sealed bamboo.',
        quantity: 1200,
        targetPrice: '3.20',
        notes: 'Individually wrapped with recyclable paper sleeve.',
      },
    ],
  },
  {
    id: 'seed-pr-4',
    requestNumber: 'PR-2026-0004',
    customerId: 'seed-customer-acme',
    title: 'Spring Garden Tool Refresh',
    description: 'Updated hand tool assortment with improved grips and retail packaging.',
    status: ProductRequestStatus.QUOTED,
    assignedUserId: users.sales,
    createdById: users.sales,
    createdAt: daysAgo(20),
    items: [
      {
        id: 'seed-pr-4-item-1',
        name: 'Stainless Hand Trowel',
        description: 'Polished stainless steel trowel with ash wood handle.',
        quantity: 500,
        targetPrice: '4.50',
        notes: 'Hang card packaging with recycled kraft board.',
      },
      {
        id: 'seed-pr-4-item-2',
        name: 'Pruning Shears',
        description: 'Bypass pruning shears with non-slip grip.',
        quantity: 300,
        targetPrice: '7.90',
        notes: 'Blade guard required.',
      },
    ],
  },
  {
    id: 'seed-pr-5',
    requestNumber: 'PR-2026-0005',
    customerId: 'seed-customer-atlas',
    title: 'Trail Camping Cookware Set',
    description: 'Compact nesting cookware set for the trail and camping category.',
    status: ProductRequestStatus.SUBMITTED,
    assignedUserId: users.operations,
    createdById: users.sales,
    createdAt: daysAgo(10),
    items: [
      {
        id: 'seed-pr-5-item-1',
        name: 'Nesting Camp Cookware Set',
        description: 'Hard-anodized aluminum four-piece nesting set.',
        quantity: 250,
        targetPrice: '22.00',
        notes: 'Include mesh storage bag.',
      },
    ],
  },
  {
    id: 'seed-pr-6',
    requestNumber: 'PR-2026-0006',
    customerId: 'seed-customer-meridian',
    title: 'Hotel Lobby Candle Collection',
    description: 'Private-label coconut wax candle range for hotel lobby retail.',
    status: ProductRequestStatus.REVIEWING,
    assignedUserId: users.sales,
    createdById: users.sales,
    createdAt: daysAgo(5),
    items: [
      {
        id: 'seed-pr-6-item-1',
        name: 'Coconut Wax Candle 3-Pack',
        description: 'Three 180 g coconut wax candles with cotton wicks.',
        quantity: 1500,
        targetPrice: '5.80',
        notes: 'Custom fragrance blend and gold foil box.',
      },
    ],
  },
  {
    id: 'seed-pr-7',
    requestNumber: 'PR-2026-0007',
    customerId: 'seed-customer-northwind',
    title: 'Custom Packaging Concepts',
    description: 'Exploratory request for printed mailer boxes and inserts.',
    status: ProductRequestStatus.DRAFT,
    assignedUserId: users.sales,
    createdById: users.sales,
    createdAt: daysAgo(2),
    items: [
      {
        id: 'seed-pr-7-item-1',
        name: 'Printed Mailer Boxes',
        description: 'Corrugated mailer boxes with one-color exterior print.',
        quantity: 5000,
        targetPrice: '0.85',
        notes: 'Waiting on final dieline from the customer.',
      },
    ],
  },
];

async function seedProductRequests(users: UserIds): Promise<void> {
  for (const request of buildProductRequests(users)) {
    const itemUpdate = (item: ProductRequestItemSeed) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      targetPrice: optionalMoney(item.targetPrice),
      notes: item.notes,
    });

    await prisma.productRequest.upsert({
      where: { id: request.id },
      update: {
        requestNumber: request.requestNumber,
        customerId: request.customerId,
        title: request.title,
        description: request.description,
        status: request.status,
        assignedUserId: request.assignedUserId,
        createdById: request.createdById,
        createdAt: request.createdAt,
        deletedAt: null,
        items: {
          upsert: request.items.map((item) => ({
            where: { id: item.id },
            update: itemUpdate(item),
            create: { id: item.id, ...itemUpdate(item) },
          })),
        },
      },
      create: {
        id: request.id,
        requestNumber: request.requestNumber,
        customerId: request.customerId,
        title: request.title,
        description: request.description,
        status: request.status,
        assignedUserId: request.assignedUserId,
        createdById: request.createdById,
        createdAt: request.createdAt,
        items: {
          create: request.items.map((item) => ({ id: item.id, ...itemUpdate(item) })),
        },
      },
    });
  }
}

interface QuotationItemSeed {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: string;
  notes: string | null;
}

interface QuotationSeed {
  id: string;
  quotationNumber: string;
  productRequestId: string;
  customerId: string;
  status: QuotationStatus;
  currency: string;
  serviceFeeRate: string;
  subtotal: string;
  serviceFee: string;
  shippingFee: string;
  tax: string;
  total: string;
  validUntil: Date;
  notes: string;
  createdById: string;
  approvedById: string | null;
  approvedAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  items: QuotationItemSeed[];
}

const buildQuotations = (users: UserIds): QuotationSeed[] => [
  {
    id: 'seed-quote-1',
    quotationNumber: 'QT-2026-0001',
    productRequestId: 'seed-pr-1',
    customerId: 'seed-customer-acme',
    status: QuotationStatus.APPROVED,
    currency: 'USD',
    serviceFeeRate: '0.0800',
    subtotal: '15900.00',
    serviceFee: '1272.00',
    shippingFee: '850.00',
    tax: '0.00',
    total: '18022.00',
    validUntil: daysFromNow(15),
    notes: 'Includes bamboo lid upgrade and retail-ready cartons.',
    createdById: users.sales,
    approvedById: users.manager,
    approvedAt: daysAgo(45),
    sentAt: daysAgo(48),
    createdAt: daysAgo(50),
    items: [
      {
        id: 'seed-quote-1-item-1',
        name: 'Modular Pantry Container 12-Pack',
        description: 'BPA-free stackable containers with bamboo lids.',
        quantity: 600,
        unitPrice: '18.50',
        notes: 'Matte white body.',
      },
      {
        id: 'seed-quote-1-item-2',
        name: 'Stackable Spice Rack',
        description: 'Three-tier expandable spice rack with matte powder coating.',
        quantity: 400,
        unitPrice: '12.00',
        notes: 'Charcoal finish.',
      },
    ],
  },
  {
    id: 'seed-quote-2',
    quotationNumber: 'QT-2026-0002',
    productRequestId: 'seed-pr-2',
    customerId: 'seed-customer-northwind',
    status: QuotationStatus.APPROVED,
    currency: 'USD',
    serviceFeeRate: '0.0800',
    subtotal: '18260.00',
    serviceFee: '1460.80',
    shippingFee: '600.00',
    tax: '0.00',
    total: '20320.80',
    validUntil: daysFromNow(10),
    notes: 'Air freight estimate valid for 30 days.',
    createdById: users.sales,
    approvedById: users.manager,
    approvedAt: daysAgo(36),
    sentAt: daysAgo(39),
    createdAt: daysAgo(42),
    items: [
      {
        id: 'seed-quote-2-item-1',
        name: 'Solar LED String Lights 20m',
        description: 'Warm white solar string lights with eight lighting modes.',
        quantity: 1200,
        unitPrice: '9.75',
        notes: null,
      },
      {
        id: 'seed-quote-2-item-2',
        name: 'Solar Garden Stake Lights 4-Pack',
        description: 'Stainless steel stake lights with automatic dusk activation.',
        quantity: 800,
        unitPrice: '8.20',
        notes: null,
      },
    ],
  },
  {
    id: 'seed-quote-3',
    quotationNumber: 'QT-2026-0003',
    productRequestId: 'seed-pr-3',
    customerId: 'seed-customer-sakura',
    status: QuotationStatus.APPROVED,
    currency: 'USD',
    serviceFeeRate: '0.1000',
    subtotal: '9840.00',
    serviceFee: '984.00',
    shippingFee: '520.00',
    tax: '0.00',
    total: '11344.00',
    validUntil: daysFromNow(5),
    notes: 'Includes JIS compliance documentation and bilingual packaging.',
    createdById: users.sales,
    approvedById: users.manager,
    approvedAt: daysAgo(45),
    sentAt: daysAgo(47),
    createdAt: daysAgo(50),
    items: [
      {
        id: 'seed-quote-3-item-1',
        name: 'Bamboo Bathroom Tray',
        description: 'Water-resistant bamboo tray with raised edge.',
        quantity: 800,
        unitPrice: '7.20',
        notes: null,
      },
      {
        id: 'seed-quote-3-item-2',
        name: 'Bamboo Soap Dish 4-Pack',
        description: 'Draining soap dishes made from sealed bamboo.',
        quantity: 1200,
        unitPrice: '3.40',
        notes: null,
      },
    ],
  },
  {
    id: 'seed-quote-4',
    quotationNumber: 'QT-2026-0004',
    productRequestId: 'seed-pr-4',
    customerId: 'seed-customer-acme',
    status: QuotationStatus.SENT,
    currency: 'USD',
    serviceFeeRate: '0.0750',
    subtotal: '4875.00',
    serviceFee: '365.63',
    shippingFee: '300.00',
    tax: '0.00',
    total: '5540.63',
    validUntil: daysFromNow(12),
    notes: 'Awaiting customer approval on packaging artwork.',
    createdById: users.sales,
    approvedById: null,
    approvedAt: null,
    sentAt: daysAgo(2),
    createdAt: daysAgo(3),
    items: [
      {
        id: 'seed-quote-4-item-1',
        name: 'Stainless Hand Trowel',
        description: 'Polished stainless steel trowel with ash wood handle.',
        quantity: 500,
        unitPrice: '4.80',
        notes: null,
      },
      {
        id: 'seed-quote-4-item-2',
        name: 'Pruning Shears',
        description: 'Bypass pruning shears with non-slip grip.',
        quantity: 300,
        unitPrice: '8.25',
        notes: null,
      },
    ],
  },
];

async function seedQuotations(users: UserIds): Promise<void> {
  for (const quotation of buildQuotations(users)) {
    const itemUpdate = (item: QuotationItemSeed) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: money(item.unitPrice),
      notes: item.notes,
    });

    await prisma.quotation.upsert({
      where: { id: quotation.id },
      update: {
        quotationNumber: quotation.quotationNumber,
        productRequestId: quotation.productRequestId,
        customerId: quotation.customerId,
        status: quotation.status,
        currency: quotation.currency,
        serviceFeeRate: money(quotation.serviceFeeRate),
        subtotal: money(quotation.subtotal),
        serviceFee: money(quotation.serviceFee),
        shippingFee: money(quotation.shippingFee),
        tax: money(quotation.tax),
        total: money(quotation.total),
        validUntil: quotation.validUntil,
        notes: quotation.notes,
        createdById: quotation.createdById,
        approvedById: quotation.approvedById,
        approvedAt: quotation.approvedAt,
        sentAt: quotation.sentAt,
        createdAt: quotation.createdAt,
        deletedAt: null,
        items: {
          upsert: quotation.items.map((item) => ({
            where: { id: item.id },
            update: itemUpdate(item),
            create: { id: item.id, ...itemUpdate(item) },
          })),
        },
      },
      create: {
        id: quotation.id,
        quotationNumber: quotation.quotationNumber,
        productRequestId: quotation.productRequestId,
        customerId: quotation.customerId,
        status: quotation.status,
        currency: quotation.currency,
        serviceFeeRate: money(quotation.serviceFeeRate),
        subtotal: money(quotation.subtotal),
        serviceFee: money(quotation.serviceFee),
        shippingFee: money(quotation.shippingFee),
        tax: money(quotation.tax),
        total: money(quotation.total),
        validUntil: quotation.validUntil,
        notes: quotation.notes,
        createdById: quotation.createdById,
        approvedById: quotation.approvedById,
        approvedAt: quotation.approvedAt,
        sentAt: quotation.sentAt,
        createdAt: quotation.createdAt,
        items: {
          create: quotation.items.map((item) => ({ id: item.id, ...itemUpdate(item) })),
        },
      },
    });
  }
}

interface PurchaseOrderItemSeed {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitCost: string;
  total: string;
  notes: string | null;
}

interface PurchaseOrderSeed {
  id: string;
  orderNumber: string;
  quotationId: string;
  customerId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  currency: string;
  subtotal: string;
  shippingFee: string;
  tax: string;
  total: string;
  expectedDeliveryDate: Date;
  notes: string;
  createdById: string;
  approvedById: string;
  approvedAt: Date;
  submittedAt: Date;
  productionStartedAt: Date | null;
  shippedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  items: PurchaseOrderItemSeed[];
}

const buildPurchaseOrders = (users: UserIds): PurchaseOrderSeed[] => [
  {
    id: 'seed-po-1',
    orderNumber: 'PO-2026-0001',
    quotationId: 'seed-quote-1',
    customerId: 'seed-customer-acme',
    supplierId: 'seed-supplier-bright',
    status: PurchaseOrderStatus.IN_PRODUCTION,
    currency: 'USD',
    subtotal: '10920.00',
    shippingFee: '780.00',
    tax: '0.00',
    total: '11700.00',
    expectedDeliveryDate: daysFromNow(18),
    notes: 'Production is on schedule. Final inspection booked for next week.',
    createdById: users.sales,
    approvedById: users.manager,
    approvedAt: daysAgo(25),
    submittedAt: daysAgo(30),
    productionStartedAt: daysAgo(24),
    shippedAt: null,
    completedAt: null,
    createdAt: daysAgo(31),
    items: [
      {
        id: 'seed-po-1-item-1',
        name: 'Modular Pantry Container 12-Pack',
        description: 'BPA-free stackable containers with bamboo lids.',
        quantity: 600,
        unitCost: '12.80',
        total: '7680.00',
        notes: 'Matte white body.',
      },
      {
        id: 'seed-po-1-item-2',
        name: 'Stackable Spice Rack',
        description: 'Three-tier expandable spice rack with matte powder coating.',
        quantity: 400,
        unitCost: '8.10',
        total: '3240.00',
        notes: 'Charcoal finish.',
      },
    ],
  },
  {
    id: 'seed-po-2',
    orderNumber: 'PO-2026-0002',
    quotationId: 'seed-quote-2',
    customerId: 'seed-customer-northwind',
    supplierId: 'seed-supplier-harbor',
    status: PurchaseOrderStatus.SHIPPED,
    currency: 'USD',
    subtotal: '11940.00',
    shippingFee: '560.00',
    tax: '0.00',
    total: '12500.00',
    expectedDeliveryDate: daysFromNow(7),
    notes: 'Shipped via DHL. Commercial invoice and packing list attached.',
    createdById: users.sales,
    approvedById: users.manager,
    approvedAt: daysAgo(35),
    submittedAt: daysAgo(38),
    productionStartedAt: daysAgo(34),
    shippedAt: daysAgo(4),
    completedAt: null,
    createdAt: daysAgo(38),
    items: [
      {
        id: 'seed-po-2-item-1',
        name: 'Solar LED String Lights 20m',
        description: 'Warm white solar string lights with eight lighting modes.',
        quantity: 1200,
        unitCost: '6.35',
        total: '7620.00',
        notes: null,
      },
      {
        id: 'seed-po-2-item-2',
        name: 'Solar Garden Stake Lights 4-Pack',
        description: 'Stainless steel stake lights with automatic dusk activation.',
        quantity: 800,
        unitCost: '5.40',
        total: '4320.00',
        notes: null,
      },
    ],
  },
  {
    id: 'seed-po-3',
    orderNumber: 'PO-2026-0003',
    quotationId: 'seed-quote-3',
    customerId: 'seed-customer-sakura',
    supplierId: 'seed-supplier-apex',
    status: PurchaseOrderStatus.COMPLETED,
    currency: 'USD',
    subtotal: '6520.00',
    shippingFee: '350.00',
    tax: '0.00',
    total: '6870.00',
    expectedDeliveryDate: daysAgo(20),
    notes: 'Delivered and signed off by the customer.',
    createdById: users.sales,
    approvedById: users.manager,
    approvedAt: daysAgo(48),
    submittedAt: daysAgo(50),
    productionStartedAt: daysAgo(46),
    shippedAt: daysAgo(28),
    completedAt: daysAgo(20),
    createdAt: daysAgo(50),
    items: [
      {
        id: 'seed-po-3-item-1',
        name: 'Bamboo Bathroom Tray',
        description: 'Water-resistant bamboo tray with raised edge.',
        quantity: 800,
        unitCost: '4.85',
        total: '3880.00',
        notes: null,
      },
      {
        id: 'seed-po-3-item-2',
        name: 'Bamboo Soap Dish 4-Pack',
        description: 'Draining soap dishes made from sealed bamboo.',
        quantity: 1200,
        unitCost: '2.20',
        total: '2640.00',
        notes: null,
      },
    ],
  },
];

async function seedPurchaseOrders(users: UserIds): Promise<void> {
  for (const purchaseOrder of buildPurchaseOrders(users)) {
    const itemUpdate = (item: PurchaseOrderItemSeed) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitCost: money(item.unitCost),
      total: money(item.total),
      notes: item.notes,
    });

    await prisma.purchaseOrder.upsert({
      where: { id: purchaseOrder.id },
      update: {
        orderNumber: purchaseOrder.orderNumber,
        quotationId: purchaseOrder.quotationId,
        customerId: purchaseOrder.customerId,
        supplierId: purchaseOrder.supplierId,
        status: purchaseOrder.status,
        currency: purchaseOrder.currency,
        subtotal: money(purchaseOrder.subtotal),
        shippingFee: money(purchaseOrder.shippingFee),
        tax: money(purchaseOrder.tax),
        total: money(purchaseOrder.total),
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
        notes: purchaseOrder.notes,
        createdById: purchaseOrder.createdById,
        approvedById: purchaseOrder.approvedById,
        approvedAt: purchaseOrder.approvedAt,
        submittedAt: purchaseOrder.submittedAt,
        productionStartedAt: purchaseOrder.productionStartedAt,
        shippedAt: purchaseOrder.shippedAt,
        completedAt: purchaseOrder.completedAt,
        createdAt: purchaseOrder.createdAt,
        deletedAt: null,
        items: {
          upsert: purchaseOrder.items.map((item) => ({
            where: { id: item.id },
            update: itemUpdate(item),
            create: { id: item.id, ...itemUpdate(item) },
          })),
        },
      },
      create: {
        id: purchaseOrder.id,
        orderNumber: purchaseOrder.orderNumber,
        quotationId: purchaseOrder.quotationId,
        customerId: purchaseOrder.customerId,
        supplierId: purchaseOrder.supplierId,
        status: purchaseOrder.status,
        currency: purchaseOrder.currency,
        subtotal: money(purchaseOrder.subtotal),
        shippingFee: money(purchaseOrder.shippingFee),
        tax: money(purchaseOrder.tax),
        total: money(purchaseOrder.total),
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
        notes: purchaseOrder.notes,
        createdById: purchaseOrder.createdById,
        approvedById: purchaseOrder.approvedById,
        approvedAt: purchaseOrder.approvedAt,
        submittedAt: purchaseOrder.submittedAt,
        productionStartedAt: purchaseOrder.productionStartedAt,
        shippedAt: purchaseOrder.shippedAt,
        completedAt: purchaseOrder.completedAt,
        createdAt: purchaseOrder.createdAt,
        items: {
          create: purchaseOrder.items.map((item) => ({ id: item.id, ...itemUpdate(item) })),
        },
      },
    });
  }
}

interface QcReportSeed {
  id: string;
  reportNumber: string;
  purchaseOrderId: string;
  customerId: string;
  supplierId: string;
  inspectorId: string;
  status: QcStatus;
  inspectionDate: Date;
  notes: string;
  photoUrls: string[];
  createdById: string;
  completedAt: Date | null;
  createdAt: Date;
}

const buildQcReports = (users: UserIds): QcReportSeed[] => [
  {
    id: 'seed-qc-1',
    reportNumber: 'QC-2026-0001',
    purchaseOrderId: 'seed-po-1',
    customerId: 'seed-customer-acme',
    supplierId: 'seed-supplier-bright',
    inspectorId: users.operations,
    status: QcStatus.PASSED,
    inspectionDate: daysAgo(6),
    notes: 'AQL 2.5 inspection passed. Minor carton scuffing noted and corrected.',
    photoUrls: [
      'https://res.cloudinary.com/demo/image/upload/samples/ecommerce/kitchen-storage.jpg',
      'https://res.cloudinary.com/demo/image/upload/samples/ecommerce/carton-label.jpg',
    ],
    createdById: users.operations,
    completedAt: daysAgo(6),
    createdAt: daysAgo(8),
  },
  {
    id: 'seed-qc-2',
    reportNumber: 'QC-2026-0002',
    purchaseOrderId: 'seed-po-1',
    customerId: 'seed-customer-acme',
    supplierId: 'seed-supplier-bright',
    inspectorId: users.operations,
    status: QcStatus.IN_PROGRESS,
    inspectionDate: daysAgo(1),
    notes: 'Final pre-shipment inspection in progress.',
    photoUrls: ['https://res.cloudinary.com/demo/image/upload/samples/ecommerce/inspection.jpg'],
    createdById: users.operations,
    completedAt: null,
    createdAt: daysAgo(2),
  },
  {
    id: 'seed-qc-3',
    reportNumber: 'QC-2026-0003',
    purchaseOrderId: 'seed-po-2',
    customerId: 'seed-customer-northwind',
    supplierId: 'seed-supplier-harbor',
    inspectorId: users.operations,
    status: QcStatus.FAILED,
    inspectionDate: daysAgo(10),
    notes: 'Moisture ingress found in 3 of 50 sampled cartons. Supplier is reworking.',
    photoUrls: [
      'https://res.cloudinary.com/demo/image/upload/samples/ecommerce/moisture-damage.jpg',
    ],
    createdById: users.operations,
    completedAt: daysAgo(10),
    createdAt: daysAgo(12),
  },
  {
    id: 'seed-qc-4',
    reportNumber: 'QC-2026-0004',
    purchaseOrderId: 'seed-po-3',
    customerId: 'seed-customer-sakura',
    supplierId: 'seed-supplier-apex',
    inspectorId: users.operations,
    status: QcStatus.PASSED,
    inspectionDate: daysAgo(32),
    notes: 'All sampled units passed dimensional and finish checks.',
    photoUrls: ['https://res.cloudinary.com/demo/image/upload/samples/ecommerce/bamboo-tray.jpg'],
    createdById: users.operations,
    completedAt: daysAgo(32),
    createdAt: daysAgo(34),
  },
];

async function seedQcReports(users: UserIds): Promise<void> {
  for (const report of buildQcReports(users)) {
    await prisma.qcReport.upsert({
      where: { id: report.id },
      update: { ...report, deletedAt: null },
      create: { ...report },
    });
  }
}

interface ShipmentItemSeed {
  id: string;
  purchaseOrderItemId: string;
  quantity: number;
}

interface ShipmentSeed {
  id: string;
  shipmentNumber: string;
  customerId: string;
  status: ShipmentStatus;
  carrier: string;
  trackingNumber: string;
  shippingMethod: string;
  origin: string;
  destination: string;
  estimatedDeliveryDate: Date;
  actualDeliveryDate: Date | null;
  notes: string;
  createdById: string;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  items: ShipmentItemSeed[];
}

const buildShipments = (users: UserIds): ShipmentSeed[] => [
  {
    id: 'seed-shipment-1',
    shipmentNumber: 'SH-2026-0001',
    customerId: 'seed-customer-northwind',
    status: ShipmentStatus.IN_TRANSIT,
    carrier: 'DHL Express',
    trackingNumber: 'DHL-784512903',
    shippingMethod: 'Air Freight',
    origin: 'Shenzhen, China',
    destination: 'London, United Kingdom',
    estimatedDeliveryDate: daysFromNow(4),
    actualDeliveryDate: null,
    notes: 'Customs cleared. Awaiting final delivery scan.',
    createdById: users.operations,
    shippedAt: daysAgo(4),
    deliveredAt: null,
    cancelledAt: null,
    createdAt: daysAgo(6),
    items: [
      { id: 'seed-shipment-1-item-1', purchaseOrderItemId: 'seed-po-2-item-1', quantity: 1200 },
      { id: 'seed-shipment-1-item-2', purchaseOrderItemId: 'seed-po-2-item-2', quantity: 800 },
    ],
  },
  {
    id: 'seed-shipment-2',
    shipmentNumber: 'SH-2026-0002',
    customerId: 'seed-customer-acme',
    status: ShipmentStatus.PREPARING,
    carrier: 'Maersk',
    trackingNumber: 'MAEU-593017442',
    shippingMethod: 'Sea Freight',
    origin: 'Ningbo, China',
    destination: 'Los Angeles, United States',
    estimatedDeliveryDate: daysFromNow(28),
    actualDeliveryDate: null,
    notes: 'Container booking confirmed. Loading scheduled next week.',
    createdById: users.operations,
    shippedAt: null,
    deliveredAt: null,
    cancelledAt: null,
    createdAt: daysAgo(3),
    items: [
      { id: 'seed-shipment-2-item-1', purchaseOrderItemId: 'seed-po-1-item-1', quantity: 600 },
      { id: 'seed-shipment-2-item-2', purchaseOrderItemId: 'seed-po-1-item-2', quantity: 400 },
    ],
  },
  {
    id: 'seed-shipment-3',
    shipmentNumber: 'SH-2026-0003',
    customerId: 'seed-customer-sakura',
    status: ShipmentStatus.DELIVERED,
    carrier: 'FedEx',
    trackingNumber: 'FX-882013775',
    shippingMethod: 'Air Freight',
    origin: 'Guangzhou, China',
    destination: 'Tokyo, Japan',
    estimatedDeliveryDate: daysAgo(24),
    actualDeliveryDate: daysAgo(22),
    notes: 'Delivered to the Tokyo distribution center. POD on file.',
    createdById: users.operations,
    shippedAt: daysAgo(28),
    deliveredAt: daysAgo(22),
    cancelledAt: null,
    createdAt: daysAgo(30),
    items: [
      { id: 'seed-shipment-3-item-1', purchaseOrderItemId: 'seed-po-3-item-1', quantity: 800 },
      { id: 'seed-shipment-3-item-2', purchaseOrderItemId: 'seed-po-3-item-2', quantity: 1200 },
    ],
  },
];

async function seedShipments(users: UserIds): Promise<void> {
  for (const shipment of buildShipments(users)) {
    const itemUpdate = (item: ShipmentItemSeed) => ({
      purchaseOrderItemId: item.purchaseOrderItemId,
      quantity: item.quantity,
    });

    await prisma.shipment.upsert({
      where: { id: shipment.id },
      update: {
        shipmentNumber: shipment.shipmentNumber,
        customerId: shipment.customerId,
        status: shipment.status,
        carrier: shipment.carrier,
        trackingNumber: shipment.trackingNumber,
        shippingMethod: shipment.shippingMethod,
        origin: shipment.origin,
        destination: shipment.destination,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        actualDeliveryDate: shipment.actualDeliveryDate,
        notes: shipment.notes,
        createdById: shipment.createdById,
        shippedAt: shipment.shippedAt,
        deliveredAt: shipment.deliveredAt,
        cancelledAt: shipment.cancelledAt,
        createdAt: shipment.createdAt,
        deletedAt: null,
        items: {
          upsert: shipment.items.map((item) => ({
            where: { id: item.id },
            update: itemUpdate(item),
            create: { id: item.id, ...itemUpdate(item) },
          })),
        },
      },
      create: {
        id: shipment.id,
        shipmentNumber: shipment.shipmentNumber,
        customerId: shipment.customerId,
        status: shipment.status,
        carrier: shipment.carrier,
        trackingNumber: shipment.trackingNumber,
        shippingMethod: shipment.shippingMethod,
        origin: shipment.origin,
        destination: shipment.destination,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        actualDeliveryDate: shipment.actualDeliveryDate,
        notes: shipment.notes,
        createdById: shipment.createdById,
        shippedAt: shipment.shippedAt,
        deliveredAt: shipment.deliveredAt,
        cancelledAt: shipment.cancelledAt,
        createdAt: shipment.createdAt,
        items: {
          create: shipment.items.map((item) => ({ id: item.id, ...itemUpdate(item) })),
        },
      },
    });
  }
}

interface CustomsRecordSeed {
  id: string;
  recordNumber: string;
  shipmentId: string;
  customerId: string;
  supplierId: string;
  status: CustomsStatus;
  declarationNumber: string;
  customsOffice: string;
  country: string;
  dutyAmount: string;
  taxAmount: string;
  otherFees: string;
  totalAmount: string;
  currency: string;
  exchangeRate: string;
  clearanceDate: Date | null;
  notes: string;
  createdById: string;
  updatedById: string;
  reviewedAt: Date | null;
  clearedAt: Date | null;
  heldAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
}

const buildCustomsRecords = (users: UserIds): CustomsRecordSeed[] => [
  {
    id: 'seed-customs-1',
    recordNumber: 'CU-2026-0001',
    shipmentId: 'seed-shipment-1',
    customerId: 'seed-customer-northwind',
    supplierId: 'seed-supplier-harbor',
    status: CustomsStatus.CLEARED,
    declarationNumber: 'GB-IMP-2026-004812',
    customsOffice: 'London Heathrow',
    country: 'United Kingdom',
    dutyAmount: '820.00',
    taxAmount: '410.00',
    otherFees: '65.00',
    totalAmount: '1295.00',
    currency: 'USD',
    exchangeRate: '1.000000',
    clearanceDate: daysAgo(2),
    notes: 'Pre-cleared under the customer VAT deferment account.',
    createdById: users.operations,
    updatedById: users.finance,
    reviewedAt: daysAgo(3),
    clearedAt: daysAgo(2),
    heldAt: null,
    cancelledAt: null,
    createdAt: daysAgo(5),
  },
  {
    id: 'seed-customs-2',
    recordNumber: 'CU-2026-0002',
    shipmentId: 'seed-shipment-2',
    customerId: 'seed-customer-acme',
    supplierId: 'seed-supplier-bright',
    status: CustomsStatus.IN_REVIEW,
    declarationNumber: 'US-IMP-2026-019283',
    customsOffice: 'Port of Los Angeles',
    country: 'United States',
    dutyAmount: '1200.00',
    taxAmount: '0.00',
    otherFees: '95.00',
    totalAmount: '1295.00',
    currency: 'USD',
    exchangeRate: '1.000000',
    clearanceDate: null,
    notes: 'Awaiting HTS classification confirmation.',
    createdById: users.operations,
    updatedById: users.operations,
    reviewedAt: daysAgo(1),
    clearedAt: null,
    heldAt: null,
    cancelledAt: null,
    createdAt: daysAgo(2),
  },
  {
    id: 'seed-customs-3',
    recordNumber: 'CU-2026-0003',
    shipmentId: 'seed-shipment-3',
    customerId: 'seed-customer-sakura',
    supplierId: 'seed-supplier-apex',
    status: CustomsStatus.CLEARED,
    declarationNumber: 'JP-IMP-2026-008117',
    customsOffice: 'Tokyo Customs',
    country: 'Japan',
    dutyAmount: '410.00',
    taxAmount: '205.00',
    otherFees: '30.00',
    totalAmount: '645.00',
    currency: 'USD',
    exchangeRate: '1.000000',
    clearanceDate: daysAgo(24),
    notes: 'Cleared with JIS compliance certificate attached.',
    createdById: users.operations,
    updatedById: users.finance,
    reviewedAt: daysAgo(26),
    clearedAt: daysAgo(24),
    heldAt: null,
    cancelledAt: null,
    createdAt: daysAgo(27),
  },
];

async function seedCustomsRecords(users: UserIds): Promise<void> {
  for (const record of buildCustomsRecords(users)) {
    await prisma.customsRecord.upsert({
      where: { id: record.id },
      update: { ...record, deletedAt: null },
      create: { ...record },
    });
  }
}

interface LedgerEntrySeed {
  id: string;
  entryNumber: string;
  purchaseOrderId: string | null;
  shipmentId: string | null;
  customerId: string | null;
  supplierId: string | null;
  type: LedgerEntryType;
  status: LedgerEntryStatus;
  amount: string;
  currency: string;
  exchangeRate: string;
  amountInBaseCurrency: string;
  description: string;
  reference: string;
  occurredAt: Date;
  createdById: string;
  approvedById: string | null;
  approvedAt: Date | null;
  voidedAt: Date | null;
  createdAt: Date;
}

const buildLedgerEntries = (users: UserIds): LedgerEntrySeed[] => [
  {
    id: 'seed-ledger-1',
    entryNumber: 'LE-2026-0001',
    purchaseOrderId: 'seed-po-1',
    shipmentId: null,
    customerId: 'seed-customer-acme',
    supplierId: null,
    type: LedgerEntryType.REVENUE,
    status: LedgerEntryStatus.APPROVED,
    amount: '18022.00',
    currency: 'USD',
    exchangeRate: '1.000000',
    amountInBaseCurrency: '18022.00',
    description: 'Customer revenue for kitchen storage purchase order.',
    reference: 'INV-2026-0001',
    occurredAt: daysAgo(20),
    createdById: users.finance,
    approvedById: users.manager,
    approvedAt: daysAgo(19),
    voidedAt: null,
    createdAt: daysAgo(20),
  },
  {
    id: 'seed-ledger-2',
    entryNumber: 'LE-2026-0002',
    purchaseOrderId: 'seed-po-1',
    shipmentId: null,
    customerId: 'seed-customer-acme',
    supplierId: 'seed-supplier-bright',
    type: LedgerEntryType.COST,
    status: LedgerEntryStatus.APPROVED,
    amount: '11700.00',
    currency: 'USD',
    exchangeRate: '1.000000',
    amountInBaseCurrency: '11700.00',
    description: 'Supplier cost for kitchen storage purchase order.',
    reference: 'SUP-INV-2026-0142',
    occurredAt: daysAgo(18),
    createdById: users.finance,
    approvedById: users.manager,
    approvedAt: daysAgo(17),
    voidedAt: null,
    createdAt: daysAgo(18),
  },
  {
    id: 'seed-ledger-3',
    entryNumber: 'LE-2026-0003',
    purchaseOrderId: 'seed-po-2',
    shipmentId: null,
    customerId: 'seed-customer-northwind',
    supplierId: 'seed-supplier-harbor',
    type: LedgerEntryType.PAYMENT,
    status: LedgerEntryStatus.PENDING,
    amount: '20320.80',
    currency: 'USD',
    exchangeRate: '1.000000',
    amountInBaseCurrency: '20320.80',
    description: 'Customer payment awaiting reconciliation.',
    reference: 'PAY-2026-0031',
    occurredAt: daysAgo(3),
    createdById: users.finance,
    approvedById: null,
    approvedAt: null,
    voidedAt: null,
    createdAt: daysAgo(3),
  },
  {
    id: 'seed-ledger-4',
    entryNumber: 'LE-2026-0004',
    purchaseOrderId: 'seed-po-3',
    shipmentId: null,
    customerId: 'seed-customer-sakura',
    supplierId: null,
    type: LedgerEntryType.REVENUE,
    status: LedgerEntryStatus.APPROVED,
    amount: '11344.00',
    currency: 'USD',
    exchangeRate: '1.000000',
    amountInBaseCurrency: '11344.00',
    description: 'Customer revenue for bamboo bathroom accessories.',
    reference: 'INV-2026-0003',
    occurredAt: daysAgo(40),
    createdById: users.finance,
    approvedById: users.manager,
    approvedAt: daysAgo(39),
    voidedAt: null,
    createdAt: daysAgo(40),
  },
  {
    id: 'seed-ledger-5',
    entryNumber: 'LE-2026-0005',
    purchaseOrderId: 'seed-po-1',
    shipmentId: null,
    customerId: 'seed-customer-acme',
    supplierId: null,
    type: LedgerEntryType.ADJUSTMENT,
    status: LedgerEntryStatus.VOID,
    amount: '150.00',
    currency: 'USD',
    exchangeRate: '1.000000',
    amountInBaseCurrency: '150.00',
    description: 'Duplicate packaging charge identified and voided.',
    reference: 'ADJ-2026-0007',
    occurredAt: daysAgo(15),
    createdById: users.finance,
    approvedById: null,
    approvedAt: null,
    voidedAt: daysAgo(14),
    createdAt: daysAgo(16),
  },
  {
    id: 'seed-ledger-6',
    entryNumber: 'LE-2026-0006',
    purchaseOrderId: 'seed-po-2',
    shipmentId: 'seed-shipment-1',
    customerId: 'seed-customer-northwind',
    supplierId: 'seed-supplier-harbor',
    type: LedgerEntryType.COST,
    status: LedgerEntryStatus.PENDING,
    amount: '1295.00',
    currency: 'USD',
    exchangeRate: '1.000000',
    amountInBaseCurrency: '1295.00',
    description: 'Import duty and customs fees for inbound holiday lighting shipment.',
    reference: 'CU-2026-0001',
    occurredAt: daysAgo(2),
    createdById: users.finance,
    approvedById: null,
    approvedAt: null,
    voidedAt: null,
    createdAt: daysAgo(2),
  },
  {
    id: 'seed-ledger-7',
    entryNumber: 'LE-2026-0007',
    purchaseOrderId: 'seed-po-3',
    shipmentId: null,
    customerId: 'seed-customer-sakura',
    supplierId: null,
    type: LedgerEntryType.REFUND,
    status: LedgerEntryStatus.APPROVED,
    amount: '500.00',
    currency: 'USD',
    exchangeRate: '1.000000',
    amountInBaseCurrency: '500.00',
    description: 'Goodwill refund for damaged units reported after delivery.',
    reference: 'REF-2026-0002',
    occurredAt: daysAgo(10),
    createdById: users.finance,
    approvedById: users.manager,
    approvedAt: daysAgo(9),
    voidedAt: null,
    createdAt: daysAgo(10),
  },
];

async function seedLedgerEntries(users: UserIds): Promise<void> {
  for (const entry of buildLedgerEntries(users)) {
    await prisma.ledgerEntry.upsert({
      where: { id: entry.id },
      update: entry,
      create: { ...entry },
    });
  }
}

interface AttachmentSeed {
  id: string;
  entityType: string;
  entityId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageProvider: string;
  storageKey: string;
  resourceType: string;
  format: string;
  uploadedById: string;
  createdAt: Date;
}

const buildAttachments = (users: UserIds): AttachmentSeed[] => [
  {
    id: 'seed-attachment-1',
    entityType: 'purchase_order',
    entityId: 'seed-po-1',
    originalName: 'PO-2026-0001-signed.pdf',
    mimeType: 'application/pdf',
    size: 284112,
    storageProvider: 'cloudinary',
    storageKey: 'crm/seed/po-2026-0001-signed',
    resourceType: 'raw',
    format: 'pdf',
    uploadedById: users.operations,
    createdAt: daysAgo(30),
  },
  {
    id: 'seed-attachment-2',
    entityType: 'qc_report',
    entityId: 'seed-qc-1',
    originalName: 'QC-2026-0001-inspection-photo.jpg',
    mimeType: 'image/jpeg',
    size: 1482204,
    storageProvider: 'cloudinary',
    storageKey: 'crm/seed/qc-2026-0001-inspection-photo',
    resourceType: 'image',
    format: 'jpg',
    uploadedById: users.operations,
    createdAt: daysAgo(6),
  },
  {
    id: 'seed-attachment-3',
    entityType: 'shipment',
    entityId: 'seed-shipment-1',
    originalName: 'SH-2026-0001-packing-list.pdf',
    mimeType: 'application/pdf',
    size: 118220,
    storageProvider: 'cloudinary',
    storageKey: 'crm/seed/sh-2026-0001-packing-list',
    resourceType: 'raw',
    format: 'pdf',
    uploadedById: users.operations,
    createdAt: daysAgo(5),
  },
  {
    id: 'seed-attachment-4',
    entityType: 'customs_record',
    entityId: 'seed-customs-1',
    originalName: 'CU-2026-0001-declaration.pdf',
    mimeType: 'application/pdf',
    size: 322910,
    storageProvider: 'cloudinary',
    storageKey: 'crm/seed/cu-2026-0001-declaration',
    resourceType: 'raw',
    format: 'pdf',
    uploadedById: users.finance,
    createdAt: daysAgo(4),
  },
  {
    id: 'seed-attachment-5',
    entityType: 'ledger_entry',
    entityId: 'seed-ledger-1',
    originalName: 'INV-2026-0001.pdf',
    mimeType: 'application/pdf',
    size: 95402,
    storageProvider: 'cloudinary',
    storageKey: 'crm/seed/inv-2026-0001',
    resourceType: 'raw',
    format: 'pdf',
    uploadedById: users.finance,
    createdAt: daysAgo(19),
  },
];

async function seedAttachments(users: UserIds): Promise<void> {
  for (const attachment of buildAttachments(users)) {
    await prisma.attachment.upsert({
      where: { id: attachment.id },
      update: { ...attachment, deletedAt: null },
      create: { ...attachment },
    });
  }
}

async function seedAuditLogs(users: UserIds): Promise<void> {
  const logs = [
    {
      id: 'seed-audit-1',
      actorId: users.sales,
      action: 'product_requests.create',
      resource: 'product_requests',
      resourceId: 'seed-pr-1',
      metadata: { requestNumber: 'PR-2026-0001' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed',
      createdAt: daysAgo(75),
    },
    {
      id: 'seed-audit-2',
      actorId: users.manager,
      action: 'quotations.approve',
      resource: 'quotations',
      resourceId: 'seed-quote-1',
      metadata: { quotationNumber: 'QT-2026-0001' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed',
      createdAt: daysAgo(45),
    },
    {
      id: 'seed-audit-3',
      actorId: users.operations,
      action: 'quality_control.status.update',
      resource: 'quality_control',
      resourceId: 'seed-qc-1',
      metadata: { from: 'IN_PROGRESS', to: 'PASSED' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed',
      createdAt: daysAgo(6),
    },
    {
      id: 'seed-audit-4',
      actorId: users.finance,
      action: 'finance.create',
      resource: 'finance',
      resourceId: 'seed-ledger-3',
      metadata: { entryNumber: 'LE-2026-0003' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed',
      createdAt: daysAgo(3),
    },
    {
      id: 'seed-audit-5',
      actorId: users.finance,
      action: 'customs.update',
      resource: 'customs',
      resourceId: 'seed-customs-1',
      metadata: { recordNumber: 'CU-2026-0001' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed',
      createdAt: daysAgo(2),
    },
  ];

  for (const log of logs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: log,
      create: { ...log },
    });
  }
}

interface ConsignmentSeed {
  id: string;
  consignmentId: string;
  customerId: string;
  supplierId: string;
  startDate: Date;
  shippingDate: Date | null;
  deliveryDate: Date | null;
  shippingCost: number;
  status: ConsignmentStatus;
  destination: string;
  products: ConsignmentProductInput[];
  transactions: ConsignmentTransactionInput[];
}

const CONSIGNMENTS: ConsignmentSeed[] = [
  {
    id: 'seed-consignment-acme',
    consignmentId: 'CNG-2026-0001',
    customerId: 'seed-customer-acme',
    supplierId: 'seed-supplier-bright',
    startDate: daysAgo(60),
    shippingDate: daysAgo(52),
    deliveryDate: daysAgo(30),
    shippingCost: 180,
    status: ConsignmentStatus.DELIVERED,
    destination: 'United States',
    products: [
      {
        category: ConsignmentProductCategory.MOBILE,
        brand: 'Samsung',
        model: 'Galaxy S24',
        specs: '256GB, Phantom Black, dual SIM',
        buyingPrice: 620,
        sellingPrice: 799,
        quantity: 12,
        status: ConsignmentProductStatus.DELIVERED,
        deliveredQuantity: 12,
        refundedQuantity: 0,
      },
      {
        category: ConsignmentProductCategory.ACCESSORY,
        brand: 'Anker',
        model: 'PowerCore 20000mAh',
        specs: '20W USB-C fast charging',
        buyingPrice: 18,
        sellingPrice: 32,
        quantity: 30,
        status: ConsignmentProductStatus.DELIVERED,
        deliveredQuantity: 28,
        refundedQuantity: 2,
      },
    ],
    transactions: [
      {
        transactionId: 'TXN-2026-0001',
        date: daysAgo(58),
        amount: 5000,
        method: ConsignmentTransactionMethod.BANK,
        type: ConsignmentTransactionType.ADVANCE,
        direction: ConsignmentTransactionDirection.IN,
        party: ConsignmentTransactionParty.CUSTOMER,
        note: 'Initial advance',
        status: ConsignmentTransactionStatus.COMPLETED,
      },
      {
        transactionId: 'TXN-2026-0002',
        date: daysAgo(35),
        amount: 4000,
        method: ConsignmentTransactionMethod.BANK,
        type: ConsignmentTransactionType.PAYMENT,
        direction: ConsignmentTransactionDirection.IN,
        party: ConsignmentTransactionParty.CUSTOMER,
        note: 'Balance payment',
        status: ConsignmentTransactionStatus.COMPLETED,
      },
      {
        transactionId: 'TXN-2026-0003',
        date: daysAgo(55),
        amount: 7000,
        method: ConsignmentTransactionMethod.BANK,
        type: ConsignmentTransactionType.PAY_OUT,
        direction: ConsignmentTransactionDirection.OUT,
        party: ConsignmentTransactionParty.SUPPLIER,
        note: 'Supplier settlement',
        status: ConsignmentTransactionStatus.COMPLETED,
      },
    ],
  },
  {
    id: 'seed-consignment-northwind',
    consignmentId: 'CNG-2026-0002',
    customerId: 'seed-customer-northwind',
    supplierId: 'seed-supplier-harbor',
    startDate: daysAgo(28),
    shippingDate: daysAgo(20),
    deliveryDate: null,
    shippingCost: 240,
    status: ConsignmentStatus.IN_TRANSIT,
    destination: 'United Kingdom',
    products: [
      {
        category: ConsignmentProductCategory.ACCESSORY,
        brand: 'Harbor',
        model: 'Organic Cotton Tote',
        specs: 'Natural, 12oz canvas',
        buyingPrice: 4.5,
        sellingPrice: 9.5,
        quantity: 200,
        status: ConsignmentProductStatus.PENDING,
        deliveredQuantity: 0,
        refundedQuantity: 0,
      },
      {
        category: ConsignmentProductCategory.OTHER,
        brand: 'Harbor',
        model: 'Bamboo Cutlery Set',
        specs: 'Portable 4-piece set',
        buyingPrice: 3.2,
        sellingPrice: 7.8,
        quantity: 150,
        status: ConsignmentProductStatus.PENDING,
        deliveredQuantity: 0,
        refundedQuantity: 0,
      },
    ],
    transactions: [
      {
        transactionId: 'TXN-2026-0010',
        date: daysAgo(26),
        amount: 1500,
        method: ConsignmentTransactionMethod.BANK,
        type: ConsignmentTransactionType.ADVANCE,
        direction: ConsignmentTransactionDirection.IN,
        party: ConsignmentTransactionParty.CUSTOMER,
        note: 'Deposit received',
        status: ConsignmentTransactionStatus.COMPLETED,
      },
      {
        transactionId: 'TXN-2026-0011',
        date: daysAgo(22),
        amount: 900,
        method: ConsignmentTransactionMethod.BANK,
        type: ConsignmentTransactionType.PAY_OUT,
        direction: ConsignmentTransactionDirection.OUT,
        party: ConsignmentTransactionParty.SUPPLIER,
        note: 'Production deposit',
        status: ConsignmentTransactionStatus.COMPLETED,
      },
    ],
  },
  {
    id: 'seed-consignment-sakura',
    consignmentId: 'CNG-2026-0003',
    customerId: 'seed-customer-sakura',
    supplierId: 'seed-supplier-apex',
    startDate: daysAgo(14),
    shippingDate: null,
    deliveryDate: null,
    shippingCost: 160,
    status: ConsignmentStatus.PENDING,
    destination: 'Japan',
    products: [
      {
        category: ConsignmentProductCategory.LAPTOP,
        brand: 'Lenovo',
        model: 'ThinkPad E14',
        specs: 'Ryzen 7, 16GB RAM, 512GB SSD',
        buyingPrice: 720,
        sellingPrice: 949,
        quantity: 8,
        status: ConsignmentProductStatus.PENDING,
        deliveredQuantity: 0,
        refundedQuantity: 0,
      },
      {
        category: ConsignmentProductCategory.ACCESSORY,
        brand: 'Apex',
        model: 'Bamboo Desk Organizer',
        specs: 'Natural finish, 6 compartments',
        buyingPrice: 12,
        sellingPrice: 26,
        quantity: 40,
        status: ConsignmentProductStatus.PENDING,
        deliveredQuantity: 0,
        refundedQuantity: 0,
      },
    ],
    transactions: [
      {
        transactionId: 'TXN-2026-0020',
        date: daysAgo(12),
        amount: 3000,
        method: ConsignmentTransactionMethod.CARD,
        type: ConsignmentTransactionType.ADVANCE,
        direction: ConsignmentTransactionDirection.IN,
        party: ConsignmentTransactionParty.CUSTOMER,
        note: 'Card advance',
        status: ConsignmentTransactionStatus.COMPLETED,
      },
    ],
  },
  {
    id: 'seed-consignment-atlas',
    consignmentId: 'CNG-2026-0004',
    customerId: 'seed-customer-atlas',
    supplierId: 'seed-supplier-yiwu',
    startDate: daysAgo(90),
    shippingDate: daysAgo(80),
    deliveryDate: daysAgo(45),
    shippingCost: 300,
    status: ConsignmentStatus.PARTIALLY_DELIVERED,
    destination: 'Germany',
    products: [
      {
        category: ConsignmentProductCategory.MOBILE,
        brand: 'Xiaomi',
        model: 'Redmi Note 13',
        specs: '128GB, Midnight Black',
        buyingPrice: 180,
        sellingPrice: 249,
        quantity: 25,
        status: ConsignmentProductStatus.DELIVERED,
        deliveredQuantity: 20,
        refundedQuantity: 2,
      },
      {
        category: ConsignmentProductCategory.ACCESSORY,
        brand: 'Yiwu',
        model: 'Silicone Phone Case',
        specs: 'Assorted colors',
        buyingPrice: 1.2,
        sellingPrice: 4.5,
        quantity: 100,
        status: ConsignmentProductStatus.DELIVERED,
        deliveredQuantity: 95,
        refundedQuantity: 5,
      },
    ],
    transactions: [
      {
        transactionId: 'TXN-2026-0030',
        date: daysAgo(88),
        amount: 4000,
        method: ConsignmentTransactionMethod.BANK,
        type: ConsignmentTransactionType.ADVANCE,
        direction: ConsignmentTransactionDirection.IN,
        party: ConsignmentTransactionParty.CUSTOMER,
        note: 'Advance payment',
        status: ConsignmentTransactionStatus.COMPLETED,
      },
      {
        transactionId: 'TXN-2026-0031',
        date: daysAgo(70),
        amount: 2500,
        method: ConsignmentTransactionMethod.BANK,
        type: ConsignmentTransactionType.PAYMENT,
        direction: ConsignmentTransactionDirection.IN,
        party: ConsignmentTransactionParty.CUSTOMER,
        note: 'Partial settlement',
        status: ConsignmentTransactionStatus.COMPLETED,
      },
      {
        transactionId: 'TXN-2026-0032',
        date: daysAgo(85),
        amount: 4500,
        method: ConsignmentTransactionMethod.BANK,
        type: ConsignmentTransactionType.PAY_OUT,
        direction: ConsignmentTransactionDirection.OUT,
        party: ConsignmentTransactionParty.SUPPLIER,
        note: 'Supplier payment',
        status: ConsignmentTransactionStatus.COMPLETED,
      },
    ],
  },
];

async function seedConsignments(users: UserIds): Promise<void> {
  for (const seed of CONSIGNMENTS) {
    const products = seed.products.map(calculateProduct);
    const transactions = seed.transactions.map(normalizeTransaction);
    const totals = calculateTotals(products, transactions, seed.shippingCost);

    const scalar = {
      consignmentId: seed.consignmentId,
      adminId: users.superAdmin,
      customerId: seed.customerId,
      supplierId: seed.supplierId,
      startDate: seed.startDate,
      shippingDate: seed.shippingDate,
      deliveryDate: seed.deliveryDate,
      shippingCost: moneyNumber(totals.shippingCost),
      totalAmount: moneyNumber(totals.totalAmount),
      totalAdvance: moneyNumber(totals.totalAdvance),
      totalDue: moneyNumber(totals.totalDue),
      totalProductCost: moneyNumber(totals.totalProductCost),
      totalSellingPrice: moneyNumber(totals.totalSellingPrice),
      grossProfit: moneyNumber(totals.grossProfit),
      netProfit: moneyNumber(totals.netProfit),
      profitMargin: marginNumber(totals.profitMargin),
      totalReceived: moneyNumber(totals.totalReceived),
      totalPaid: moneyNumber(totals.totalPaid),
      status: seed.status,
      destination: seed.destination,
      deletedAt: null,
    };

    const productData = products.map((product, position) => ({
      category: product.category,
      brand: product.brand,
      model: product.model,
      specs: product.specs ?? null,
      buyingPrice: moneyNumber(product.buyingPrice),
      sellingPrice: moneyNumber(product.sellingPrice),
      quantity: product.quantity,
      totalBuyingCost: moneyNumber(product.totalBuyingCost),
      totalSellingCost: moneyNumber(product.totalSellingCost),
      position,
      status: product.status,
      deliveredQuantity: product.deliveredQuantity,
      refundedQuantity: product.refundedQuantity,
      profit: moneyNumber(product.profit),
      profitMargin: marginNumber(product.profitMargin),
    }));

    const transactionData = transactions.map((transaction) => ({
      transactionId: transaction.transactionId,
      date: transaction.date,
      amount: moneyNumber(transaction.amount),
      method: transaction.method,
      type: transaction.type,
      direction: transaction.direction,
      party: transaction.party,
      note: transaction.note ?? null,
      addById: users.superAdmin,
      status: transaction.status,
    }));

    await prisma.consignment.upsert({
      where: { id: seed.id },
      update: {
        ...scalar,
        products: { deleteMany: {}, create: productData },
        transactions: { deleteMany: {}, create: transactionData },
      },
      create: {
        id: seed.id,
        ...scalar,
        products: { create: productData },
        transactions: { create: transactionData },
      },
    });
  }
}

async function main(): Promise<void> {
  const permissions = await seedPermissions();
  const roles = await seedRoles(permissions);

  await seedCustomers();
  await seedSuppliers();

  const users = await seedUsers(roles);

  await seedProductRequests(users);
  await seedQuotations(users);
  await seedPurchaseOrders(users);
  await seedQcReports(users);
  await seedShipments(users);
  await seedCustomsRecords(users);
  await seedLedgerEntries(users);
  await seedAttachments(users);
  await seedAuditLogs(users);
  await seedConsignments(users);

  console.info(
    `Seed complete: ${permissions.size} permissions, ${roles.size} roles, ${CUSTOMERS.length} customers, ${SUPPLIERS.length} suppliers, ${USERS.length + 1} users, ${CONSIGNMENTS.length} consignments, dev transactions loaded`,
  );
  console.info(`Admin login: ${env.SEED_ADMIN_EMAIL} / ${env.SEED_ADMIN_PASSWORD}`);
}

if (require.main === module) {
  main()
    .catch((error: unknown) => {
      console.error('Seed failed', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
