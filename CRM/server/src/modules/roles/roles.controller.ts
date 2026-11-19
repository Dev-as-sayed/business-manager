import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as roleService from '@/modules/roles/roles.service';
import type { ListRolesQuery } from '@/modules/roles/roles.types';

export const listPermissions = catchAsync(async (_req, res) => {
  const permissions = await roleService.listPermissions();

  sendResponse(res, {
    message: 'Permissions retrieved',
    data: permissions,
  });
});

export const listRoles = catchAsync(async (req, res) => {
  const result = await roleService.listRoles(req.query as unknown as ListRolesQuery);

  sendResponse(res, {
    message: 'Roles retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getRole = catchAsync(async (req, res) => {
  const role = await roleService.getRole(req.params.id as string);

  sendResponse(res, {
    message: 'Role retrieved',
    data: role,
  });
});

export const createRole = catchAsync(async (req, res) => {
  const role = await roleService.createRole(req.body, req.user!, getRequestMeta(req));

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Role created',
    data: role,
  });
});

export const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.updateRole(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Role updated',
    data: role,
  });
});

export const deleteRole = catchAsync(async (req, res) => {
  await roleService.deleteRole(req.params.id as string, req.user!, getRequestMeta(req));

  sendResponse(res, {
    message: 'Role deleted',
    data: null,
  });
});
