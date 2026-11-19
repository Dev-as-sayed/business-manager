import type { Request } from 'express';
import type { RequestMeta } from '@/shared/types';

export const getRequestMeta = (req: Request): RequestMeta => ({
  ip: req.ip ?? req.socket.remoteAddress ?? null,
  userAgent: req.get('user-agent') ?? null,
});
