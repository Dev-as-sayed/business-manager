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
  quotation: { id: string; quotationNumber: string; status: string } | null;
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
