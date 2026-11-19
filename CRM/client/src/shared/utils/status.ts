export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type StatusDomain =
  | 'user'
  | 'customer'
  | 'supplier'
  | 'productRequest'
  | 'quotation'
  | 'purchaseOrder'
  | 'qc'
  | 'shipment'
  | 'customs'
  | 'ledger'
  | 'ledgerType'
  | 'generic';

const toneMap: Record<string, StatusTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  BLOCKED: 'danger',
  SUSPENDED: 'warning',

  DRAFT: 'neutral',
  SUBMITTED: 'info',
  REVIEWING: 'warning',
  QUOTED: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  EXPIRED: 'warning',

  PENDING_APPROVAL: 'warning',
  IN_PRODUCTION: 'info',
  SHIPPED: 'info',
  COMPLETED: 'success',

  PENDING: 'warning',
  IN_PROGRESS: 'info',
  PASSED: 'success',
  FAILED: 'danger',

  PREPARING: 'info',
  IN_TRANSIT: 'info',
  DELIVERED: 'success',

  IN_REVIEW: 'info',
  CLEARED: 'success',
  HELD: 'danger',

  VOID: 'neutral',

  REVENUE: 'success',
  COST: 'danger',
  PAYMENT: 'info',
  REFUND: 'warning',
  ADJUSTMENT: 'neutral',
};

export const statusTone = (status: string): StatusTone => toneMap[status] ?? 'neutral';

export const statusLabel = (status: string): string =>
  status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  REVIEWING: 'Reviewing',
  QUOTED: 'Quoted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  PENDING: 'Pending',
  PENDING_APPROVAL: 'Pending approval',
  IN_PRODUCTION: 'In production',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In progress',
  PASSED: 'Passed',
  FAILED: 'Failed',
  PREPARING: 'Preparing',
  IN_TRANSIT: 'In transit',
  DELIVERED: 'Delivered',
  IN_REVIEW: 'In review',
  CLEARED: 'Cleared',
  HELD: 'Held',
  VOID: 'Void',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  BLOCKED: 'Blocked',
  SUSPENDED: 'Suspended',
  REVENUE: 'Revenue',
  COST: 'Cost',
  PAYMENT: 'Payment',
  REFUND: 'Refund',
  ADJUSTMENT: 'Adjustment',
};

export const labelForStatus = (status: string): string =>
  STATUS_LABELS[status] ?? statusLabel(status);
