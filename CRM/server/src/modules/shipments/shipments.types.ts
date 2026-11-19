import type { ShipmentStatus } from '@prisma/client';

export interface ShipmentItemInput {
  purchaseOrderItemId: string;
  quantity: number;
}

export interface CreateShipmentInput {
  carrier?: string | null;
  trackingNumber?: string | null;
  shippingMethod?: string | null;
  origin?: string | null;
  destination?: string | null;
  estimatedDeliveryDate?: Date | null;
  notes?: string | null;
  items: ShipmentItemInput[];
}

export interface UpdateShipmentInput {
  carrier?: string | null;
  trackingNumber?: string | null;
  shippingMethod?: string | null;
  origin?: string | null;
  destination?: string | null;
  estimatedDeliveryDate?: Date | null;
  notes?: string | null;
  items?: ShipmentItemInput[];
}

export interface UpdateShipmentStatusInput {
  status: ShipmentStatus;
}

export type ShipmentSortField =
  'shipmentNumber' | 'createdAt' | 'updatedAt' | 'estimatedDeliveryDate' | 'actualDeliveryDate';

export type SortOrder = 'asc' | 'desc';

export interface ListShipmentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ShipmentStatus;
  customerId?: string;
  purchaseOrderId?: string;
  carrier?: string;
  trackingNumber?: string;
  sortBy?: ShipmentSortField;
  sortOrder?: SortOrder;
}
