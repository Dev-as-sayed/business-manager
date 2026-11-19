import type { EntityRef, UserRef } from '@/shared/types';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unitCost: string | number;
  total: string | number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderQuotationRef {
  id: string;
  quotationNumber: string;
  status: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  quotationId: string;
  customerId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  currency: string;
  subtotal: string | number;
  shippingFee: string | number;
  tax: string | number;
  total: string | number;
  expectedDeliveryDate: string | null;
  notes: string | null;
  createdById: string;
  approvedById: string | null;
  approvedAt: string | null;
  submittedAt: string | null;
  productionStartedAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  quotation: PurchaseOrderQuotationRef | null;
  customer: EntityRef | null;
  supplier: EntityRef | null;
  createdBy: UserRef | null;
  approvedBy: UserRef | null;
  _count: { items: number };
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: PurchaseOrderStatus;
  customerId?: string;
  supplierId?: string;
  quotationId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseOrderItemInput {
  name: string;
  description?: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}

export interface CreatePurchaseOrderInput {
  quotationId: string;
  supplierId: string;
  shippingFee?: number;
  tax?: number;
  expectedDeliveryDate?: string;
  notes?: string;
  items: PurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderInput {
  supplierId?: string;
  shippingFee?: number;
  tax?: number;
  expectedDeliveryDate?: string;
  notes?: string;
  items?: PurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderStatusInput {
  id: string;
  status: Exclude<PurchaseOrderStatus, 'APPROVED'>;
}

export const PURCHASE_ORDER_STATUS_OPTIONS: {
  label: string;
  value: PurchaseOrderStatus;
}[] = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Pending approval', value: 'PENDING_APPROVAL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'In production', value: 'IN_PRODUCTION' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const PURCHASE_ORDER_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['CANCELLED'],
  APPROVED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['SHIPPED'],
  SHIPPED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};
