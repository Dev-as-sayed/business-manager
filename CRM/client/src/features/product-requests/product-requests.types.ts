import type { EntityRef, UserRef } from '@/shared/types';

export type ProductRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'QUOTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface ProductRequestItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  targetPrice: string | number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  id: string;
  requestNumber: string;
  customerId: string | null;
  title: string;
  description: string | null;
  status: ProductRequestStatus;
  assignedUserId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer: EntityRef | null;
  assignedUser: UserRef | null;
  createdBy: UserRef | null;
  _count: { items: number };
  items?: ProductRequestItem[];
}

export interface ProductRequestListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductRequestStatus;
  customerId?: string;
  assignedUserId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductRequestItemInput {
  name: string;
  description?: string;
  quantity: number;
  targetPrice?: number;
  notes?: string;
}

export interface CreateProductRequestInput {
  customerId?: string;
  title: string;
  description?: string;
  assignedUserId?: string;
  items: ProductRequestItemInput[];
}

export interface UpdateProductRequestInput {
  title?: string;
  description?: string;
  items?: ProductRequestItemInput[];
}

export interface UpdateProductRequestStatusInput {
  id: string;
  status: ProductRequestStatus;
}

export interface AssignProductRequestInput {
  id: string;
  assignedUserId: string;
}

export const PRODUCT_REQUEST_STATUS_OPTIONS: {
  label: string;
  value: ProductRequestStatus;
}[] = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Reviewing', value: 'REVIEWING' },
  { label: 'Quoted', value: 'QUOTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const STAFF_TRANSITIONS: Record<ProductRequestStatus, ProductRequestStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['REVIEWING', 'CANCELLED'],
  REVIEWING: ['QUOTED', 'REJECTED', 'CANCELLED'],
  QUOTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};

const CUSTOMER_TRANSITIONS: Record<ProductRequestStatus, ProductRequestStatus[]> = {
  ...STAFF_TRANSITIONS,
  SUBMITTED: ['CANCELLED'],
  REVIEWING: [],
  QUOTED: [],
};

export const getProductRequestTransitions = (
  role: string | null | undefined,
): Record<ProductRequestStatus, ProductRequestStatus[]> =>
  role === 'CUSTOMER' ? CUSTOMER_TRANSITIONS : STAFF_TRANSITIONS;
