import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) ? date : null;
};

export const formatDate = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? format(date, 'dd MMM yyyy') : 'Not set';
};

export const formatDateTime = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? format(date, 'dd MMM yyyy, HH:mm') : 'Not set';
};

export const formatRelative = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : 'Unknown';
};

export const formatMoney = (
  value: string | number | null | undefined,
  currency = 'USD',
): string => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return `${currency} 0.00`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const initials = (firstName?: string | null, lastName?: string | null): string =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'MC';

export const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
