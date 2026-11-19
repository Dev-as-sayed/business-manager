import type { CustomerStatus } from '@prisma/client';

export interface CreateCustomerInput {
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

export interface UpdateCustomerInput {
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

export interface UpdateCustomerStatusInput {
  status: CustomerStatus;
}

export type CustomerSortField = 'name' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface ListCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  sortBy?: CustomerSortField;
  sortOrder?: SortOrder;
}
