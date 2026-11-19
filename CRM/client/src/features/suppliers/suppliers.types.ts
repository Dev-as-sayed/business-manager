export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Supplier {
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
  status: SupplierStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: SupplierStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SupplierInput {
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

export interface UpdateSupplierStatusInput {
  id: string;
  status: SupplierStatus;
}

export const SUPPLIER_STATUS_TRANSITIONS: Record<SupplierStatus, SupplierStatus[]> = {
  ACTIVE: ['INACTIVE', 'BLOCKED'],
  INACTIVE: ['ACTIVE'],
  BLOCKED: ['INACTIVE'],
};

export const SUPPLIER_STATUS_OPTIONS: { label: string; value: SupplierStatus }[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Blocked', value: 'BLOCKED' },
];
