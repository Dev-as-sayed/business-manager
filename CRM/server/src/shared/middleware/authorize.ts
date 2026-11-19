import type { RequestHandler } from 'express';
import { ApiError } from '@/shared/errors/ApiError';

export const authorize = (resource: string, action: string): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    const requiredPermission = `${resource}:${action}`;

    if (!req.user.permissions.includes(requiredPermission)) {
      next(ApiError.forbidden(`Missing permission: ${requiredPermission}`));
      return;
    }

    next();
  };
};
