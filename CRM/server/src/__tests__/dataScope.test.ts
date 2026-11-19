import { describe, expect, it } from 'vitest';
import type { AuthUser } from '@/shared/types';
import { assigneeScope, buildDataScope, customerScope } from '@/shared/utils/dataScope';

const baseUser: AuthUser = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'SALES',
  permissions: [],
};

describe('data scoping', () => {
  it('scopes customers to their linked customer', () => {
    const user: AuthUser = { ...baseUser, role: 'CUSTOMER', customerId: 'customer-1' };

    expect(buildDataScope(user, [customerScope()])).toEqual({ customerId: 'customer-1' });
  });

  it('rejects customer accounts without a customer link', () => {
    const user: AuthUser = { ...baseUser, role: 'CUSTOMER' };

    expect(() => buildDataScope(user, [customerScope()])).toThrow(
      'Customer account is not linked to a customer',
    );
  });

  it('scopes China operations to assigned records', () => {
    const user: AuthUser = { ...baseUser, role: 'CHINA_OPERATIONS' };

    expect(buildDataScope(user, [assigneeScope()])).toEqual({ assignedUserId: 'user-1' });
  });

  it('returns an empty scope for unrestricted roles', () => {
    expect(buildDataScope(baseUser, [customerScope(), assigneeScope()])).toEqual({});
  });
});
