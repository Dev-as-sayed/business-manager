import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as userService from '@/modules/users/users.service';
import type { ListUsersQuery } from '@/modules/users/users.types';

export const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body, req.user!, getRequestMeta(req));

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User created',
    data: user,
  });
});

export const listUsers = catchAsync(async (req, res) => {
  const result = await userService.listUsers(req.query as unknown as ListUsersQuery);

  sendResponse(res, {
    message: 'Users retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUser(req.params.id as string);

  sendResponse(res, {
    message: 'User retrieved',
    data: user,
  });
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'User updated',
    data: user,
  });
});

export const updateUserStatus = catchAsync(async (req, res) => {
  const user = await userService.updateUserStatus(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'User status updated',
    data: user,
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id as string, req.user!, getRequestMeta(req));

  sendResponse(res, {
    message: 'User deleted',
    data: null,
  });
});
