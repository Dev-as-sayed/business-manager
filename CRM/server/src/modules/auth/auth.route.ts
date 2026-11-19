import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authLimiter } from '@/shared/middleware/rateLimiters';
import { validate } from '@/shared/middleware/validate';
import * as authController from '@/modules/auth/auth.controller';
import {
  changePasswordBodySchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from '@/modules/auth/auth.validation';

const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerBodySchema }),
  authController.register,
);
authRouter.post('/login', authLimiter, validate({ body: loginBodySchema }), authController.login);
authRouter.post('/refresh', validate({ body: refreshBodySchema }), authController.refresh);
authRouter.post('/logout', validate({ body: logoutBodySchema }), authController.logout);
authRouter.post('/logout-all', auth, authController.logoutAll);
authRouter.post(
  '/forgot-password',
  authLimiter,
  validate({ body: forgotPasswordBodySchema }),
  authController.forgotPassword,
);
authRouter.post(
  '/reset-password',
  authLimiter,
  validate({ body: resetPasswordBodySchema }),
  authController.resetPassword,
);
authRouter.post(
  '/change-password',
  auth,
  validate({ body: changePasswordBodySchema }),
  authController.changePassword,
);
authRouter.get('/me', auth, authController.me);

export { authRouter };
