export interface Meta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Meta;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
}

export interface Paginated<T> {
  items: T[];
  meta: Meta;
}

export interface NormalizedApiError {
  status: number | 'NETWORK';
  message: string;
  errors: ApiErrorDetail[];
  raw?: unknown;
}

export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface EntityRef {
  id: string;
  name: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export const emptyMeta = (): Meta => ({ page: 1, limit: 20, total: 0 });

export const isNormalizedApiError = (value: unknown): value is NormalizedApiError =>
  typeof value === 'object' &&
  value !== null &&
  'status' in value &&
  'message' in value &&
  'errors' in value;
