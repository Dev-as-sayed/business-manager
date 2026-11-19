import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { catchAsync } from '@/shared/utils/catchAsync';
import { authUserInclude, toAuthUser } from '@/modules/auth/auth.service';
import { verifyAccessToken } from '@/modules/auth/auth.tokens';

export const auth = catchAsync(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication required');
  }

  const token = header.slice('Bearer '.length).trim();

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  const payload = verifyAccessToken(token);
  const user = await prisma.user.findFirst({
    where: { id: payload.sub, deletedAt: null, status: 'ACTIVE' },
    include: authUserInclude,
  });

  if (!user) {
    throw ApiError.unauthorized('User is no longer active');
  }

  req.user = toAuthUser(user);
  next();
});
