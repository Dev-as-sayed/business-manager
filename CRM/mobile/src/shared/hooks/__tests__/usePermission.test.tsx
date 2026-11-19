import { renderHook } from '@testing-library/react-native';
import { usePermission } from '@/shared/hooks/usePermission';
import type { AuthUser } from '@/features/auth/auth.types';

const mockUseAppSelector = jest.fn();

jest.mock('@/store/hooks', () => ({
  useAppSelector: () => mockUseAppSelector(),
}));

const user: AuthUser = {
  id: 'user-1',
  email: 'customer@example.com',
  firstName: 'Casey',
  lastName: 'Customer',
  role: 'CUSTOMER',
  permissions: ['quotations:read', 'quotations:approve'],
  phone: null,
  status: 'ACTIVE',
  customerId: 'customer-1',
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('usePermission', () => {
  it('checks resource-action permissions from the authenticated user', async () => {
    mockUseAppSelector.mockReturnValue(user);

    const { result } = await renderHook(() => usePermission());

    expect(result.current.role).toBe('CUSTOMER');
    expect(result.current.can('quotations', 'approve')).toBe(true);
    expect(result.current.can('quotations', 'delete')).toBe(false);
  });

  it('denies everything when there is no authenticated user', async () => {
    mockUseAppSelector.mockReturnValue(null);

    const { result } = await renderHook(() => usePermission());

    expect(result.current.role).toBeNull();
    expect(result.current.can('quotations', 'read')).toBe(false);
  });
});
