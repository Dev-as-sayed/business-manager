import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as directoryController from '@/modules/directory/directory.controller';
import {
  createDirectoryUserBodySchema,
  directoryUserParamsSchema,
  listDirectoryUsersQuerySchema,
  updateDirectoryUserBodySchema,
} from '@/modules/directory/directory.validation';

const directoryRouter = Router();

directoryRouter.use(auth);

directoryRouter.get(
  '/users',
  authorize('users', 'read'),
  validate({ query: listDirectoryUsersQuerySchema }),
  directoryController.listDirectoryUsers,
);

directoryRouter.post(
  '/users',
  authorize('users', 'create'),
  validate({ body: createDirectoryUserBodySchema }),
  directoryController.createDirectoryUser,
);

directoryRouter.get(
  '/users/:id',
  authorize('users', 'read'),
  validate({ params: directoryUserParamsSchema }),
  directoryController.getDirectoryUser,
);

directoryRouter.put(
  '/users/:id',
  authorize('users', 'update'),
  validate({ params: directoryUserParamsSchema, body: updateDirectoryUserBodySchema }),
  directoryController.updateDirectoryUser,
);

directoryRouter.delete(
  '/users/:id',
  authorize('users', 'delete'),
  validate({ params: directoryUserParamsSchema }),
  directoryController.deleteDirectoryUser,
);

export { directoryRouter };
