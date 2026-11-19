import type { EntityRef, UserRef } from '@/shared/types';

export type ShipmentStatus = 'PENDING' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface ShipmentPurchaseOrderRef {
  id: string;
  orderNumber: string;
  status: string;
  supplierId: string;
  supplier: EntityRef | null;
}

export interface ShipmentPurchaseOrderItemRef {
  id: string;
  name: string;
  quantity: number;
  purchaseOrderId: string;
  purchaseOrder: ShipmentPurchaseOrderRef;
}

export interface ShipmentItem {
  id: string;
  purchaseOrderItemId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  purchaseOrderItem: ShipmentPurchaseOrderItemRef;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  customerId: string;
  status: ShipmentStatus;
  carrier: string | null;
  trackingNumber: string | null;
  shippingMethod: string | null;
  origin: string | null;
  destination: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  notes: string | null;
  createdById: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: EntityRef | null;
  createdBy: UserRef | null;
  _count: { items: number };
  items?: ShipmentItem[];
}

export interface ShipmentListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: ShipmentStatus;
  customerId?: string;
  purchaseOrderId?: string;
  carrier?: string;
  trackingNumber?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ShipmentItemInput {
  purchaseOrderItemId: string;
  quantity: number;
}

export interface CreateShipmentInput {
  carrier?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  origin?: string;
  destination?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  items: ShipmentItemInput[];
}

export interface UpdateShipmentInput {
  carrier?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  origin?: string;
  destination?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  items?: ShipmentItemInput[];
}

export interface UpdateShipmentStatusInput {
  id: string;
  status: ShipmentStatus;
}

export const SHIPMENT_STATUS_OPTIONS: { label: string; value: ShipmentStatus }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'In transit', value: 'IN_TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const SHIPMENT_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING: ['PREPARING', 'CANCELLED'],
  PREPARING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};
