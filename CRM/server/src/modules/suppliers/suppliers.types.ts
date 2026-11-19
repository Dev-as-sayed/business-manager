import type { SupplierStatus } from '@prisma/client';

export interface CreateSupplierInput {
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  taxId?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierInput {
  name?: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  taxId?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierStatusInput {
  status: SupplierStatus;
}

export type SupplierSortField = 'name' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface ListSuppliersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SupplierStatus;
  sortBy?: SupplierSortField;
  sortOrder?: SortOrder;
}
