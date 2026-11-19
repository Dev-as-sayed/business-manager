import type { ProductRequestStatus } from '@prisma/client';

export interface ProductRequestItemInput {
  name: string;
  description?: string | null;
  quantity: number;
  targetPrice?: number | null;
  notes?: string | null;
}

export interface CreateProductRequestInput {
  customerId?: string | null;
  title: string;
  description?: string | null;
  assignedUserId?: string | null;
  items: ProductRequestItemInput[];
}

export interface UpdateProductRequestInput {
  title?: string;
  description?: string | null;
  items?: ProductRequestItemInput[];
}

export interface UpdateProductRequestStatusInput {
  status: ProductRequestStatus;
}

export interface AssignProductRequestInput {
  assignedUserId: string | null;
}

export type ProductRequestSortField = 'requestNumber' | 'title' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface ListProductRequestsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductRequestStatus;
  customerId?: string;
  assignedUserId?: string;
  sortBy?: ProductRequestSortField;
  sortOrder?: SortOrder;
}
