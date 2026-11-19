import type { PurchaseOrderStatus } from '@prisma/client';

export interface PurchaseOrderItemInput {
  name: string;
  description?: string | null;
  quantity: number;
  unitCost: number;
  notes?: string | null;
}

export interface CreatePurchaseOrderInput {
  quotationId: string;
  supplierId: string;
  shippingFee?: number;
  tax?: number;
  expectedDeliveryDate?: Date | null;
  notes?: string | null;
  items: PurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderInput {
  supplierId?: string;
  shippingFee?: number;
  tax?: number;
  expectedDeliveryDate?: Date | null;
  notes?: string | null;
  items?: PurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderStatusInput {
  status: PurchaseOrderStatus;
}

export type PurchaseOrderSortField =
  'orderNumber' | 'createdAt' | 'updatedAt' | 'total' | 'expectedDeliveryDate';

export type SortOrder = 'asc' | 'desc';

export interface ListPurchaseOrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PurchaseOrderStatus;
  customerId?: string;
  supplierId?: string;
  quotationId?: string;
  sortBy?: PurchaseOrderSortField;
  sortOrder?: SortOrder;
}
