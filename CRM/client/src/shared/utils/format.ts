import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';
import type { UserRef } from '@/shared/types';

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) ? date : null;
};

export const formatDate = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? format(date, 'dd MMM yyyy') : '—';
};

export const formatDateTime = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? format(date, 'dd MMM yyyy, HH:mm') : '—';
};

export const formatRelative = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? formatDistanceToNowStrict(date, { addSuffix: true }) : '—';
};

const moneyFormatter = (currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  });

export const formatMoney = (
  value: string | number | null | undefined,
  currency = 'USD',
): string => {
  if (value === null || value === undefined || value === '') return '—';
  const numeric = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(numeric) ? moneyFormatter(currency).format(numeric) : '—';
};

export const formatNumber = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '—';
  const numeric = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(numeric)
    : '—';
};

export const formatPercent = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '—';
  const numeric = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(numeric) ? `${(numeric * 100).toFixed(2)}%` : '—';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const displayUserName = (user: UserRef | null | undefined): string => {
  if (!user) return '—';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
};

export const initials = (firstName: string, lastName: string): string =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

export const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
