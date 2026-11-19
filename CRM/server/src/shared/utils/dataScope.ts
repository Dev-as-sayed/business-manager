import { ApiError } from '@/shared/errors/ApiError';
import type { AuthUser } from '@/shared/types';

export interface ScopeRule {
  roles: string[];
  build: (user: AuthUser) => Record<string, unknown>;
}

export const buildDataScope = (user: AuthUser, rules: ScopeRule[]): Record<string, unknown> => {
  const rule = rules.find((candidate) => candidate.roles.includes(user.role));
  return rule ? rule.build(user) : {};
};

export const customerScope = (field = 'customerId'): ScopeRule => ({
  roles: ['CUSTOMER'],
  build: (user) => {
    if (!user.customerId) {
      throw ApiError.forbidden('Customer account is not linked to a customer');
    }

    return { [field]: user.customerId };
  },
});

export const assigneeScope = (field = 'assignedUserId'): ScopeRule => ({
  roles: ['CHINA_OPERATIONS'],
  build: (user) => ({ [field]: user.id }),
});
