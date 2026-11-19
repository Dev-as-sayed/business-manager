import type { Paginated } from '@/shared/types';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Customer {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  status: CustomerStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type CustomerListResult = Paginated<Customer>;
