export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const STATUS_TONES: Record<string, StatusTone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  REVIEWING: 'info',
  SENT: 'info',
  PENDING: 'warning',
  PENDING_APPROVAL: 'warning',
  PREPARING: 'warning',
  IN_PROGRESS: 'info',
  IN_REVIEW: 'info',
  APPROVED: 'success',
  QUOTED: 'info',
  PASSED: 'success',
  CLEARED: 'success',
  DELIVERED: 'success',
  COMPLETED: 'success',
  ACTIVE: 'success',
  IN_PRODUCTION: 'info',
  IN_TRANSIT: 'info',
  SHIPPED: 'info',
  HELD: 'danger',
  FAILED: 'danger',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  EXPIRED: 'neutral',
  INACTIVE: 'neutral',
  SUSPENDED: 'danger',
};

export const getStatusTone = (status: string): StatusTone => STATUS_TONES[status] ?? 'neutral';
