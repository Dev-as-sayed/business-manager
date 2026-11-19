import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as roleController from '@/modules/roles/roles.controller';
import {
  createRoleBodySchema,
  listRolesQuerySchema,
  roleIdParamsSchema,
  updateRoleBodySchema,
} from '@/modules/roles/roles.validation';

const rolesRouter = Router();

rolesRouter.use(auth);

rolesRouter.get('/permissions', authorize('roles', 'read'), roleController.listPermissions);
rolesRouter.post(
  '/',
  authorize('roles', 'create'),
  validate({ body: createRoleBodySchema }),
  roleController.createRole,
);
rolesRouter.get(
  '/',
  authorize('roles', 'read'),
  validate({ query: listRolesQuerySchema }),
  roleController.listRoles,
);
rolesRouter.get(
  '/:id',
  authorize('roles', 'read'),
  validate({ params: roleIdParamsSchema }),
  roleController.getRole,
);
rolesRouter.patch(
  '/:id',
  authorize('roles', 'update'),
  validate({ params: roleIdParamsSchema, body: updateRoleBodySchema }),
  roleController.updateRole,
);
rolesRouter.delete(
  '/:id',
  authorize('roles', 'delete'),
  validate({ params: roleIdParamsSchema }),
  roleController.deleteRole,
);

export { rolesRouter };
