export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Customer {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  taxId: string | null;
  notes: string | null;
  status: CustomerStatus;
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

export interface CustomerInput {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  notes?: string;
}

export interface UpdateCustomerStatusInput {
  id: string;
  status: CustomerStatus;
}

export const CUSTOMER_STATUS_TRANSITIONS: Record<CustomerStatus, CustomerStatus[]> = {
  ACTIVE: ['INACTIVE', 'BLOCKED'],
  INACTIVE: ['ACTIVE'],
  BLOCKED: ['INACTIVE'],
};

export const CUSTOMER_STATUS_OPTIONS: { label: string; value: CustomerStatus }[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Blocked', value: 'BLOCKED' },
];
