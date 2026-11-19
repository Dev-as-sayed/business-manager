import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as userController from '@/modules/users/users.controller';
import {
  createUserBodySchema,
  listUsersQuerySchema,
  updateUserBodySchema,
  updateUserStatusBodySchema,
  userIdParamsSchema,
} from '@/modules/users/users.validation';

const usersRouter = Router();

usersRouter.use(auth);

usersRouter.post(
  '/',
  authorize('users', 'create'),
  validate({ body: createUserBodySchema }),
  userController.createUser,
);
usersRouter.get(
  '/',
  authorize('users', 'read'),
  validate({ query: listUsersQuerySchema }),
  userController.listUsers,
);
usersRouter.get(
  '/:id',
  authorize('users', 'read'),
  validate({ params: userIdParamsSchema }),
  userController.getUser,
);
usersRouter.patch(
  '/:id/status',
  authorize('users', 'update'),
  validate({ params: userIdParamsSchema, body: updateUserStatusBodySchema }),
  userController.updateUserStatus,
);
usersRouter.patch(
  '/:id',
  authorize('users', 'update'),
  validate({ params: userIdParamsSchema, body: updateUserBodySchema }),
  userController.updateUser,
);
usersRouter.delete(
  '/:id',
  authorize('users', 'delete'),
  validate({ params: userIdParamsSchema }),
  userController.deleteUser,
);

export { usersRouter };
