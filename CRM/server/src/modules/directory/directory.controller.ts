import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as directoryService from '@/modules/directory/directory.service';
import type { DirectoryRole } from '@/modules/directory/directory.types';

export const listDirectoryUsers = catchAsync(async (req, res) => {
  const { role } = req.query as unknown as { role: DirectoryRole };
  const users = await directoryService.listDirectoryUsers(role);

  sendResponse(res, {
    message: 'Users retrieved',
    data: users,
  });
});

export const createDirectoryUser = catchAsync(async (req, res) => {
  const user = await directoryService.createDirectoryUser(req.body, req.user!, getRequestMeta(req));

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User created',
    data: user,
  });
});

export const getDirectoryUser = catchAsync(async (req, res) => {
  const user = await directoryService.getDirectoryUser(req.params.id as string);

  sendResponse(res, {
    message: 'User retrieved',
    data: user,
  });
});

export const updateDirectoryUser = catchAsync(async (req, res) => {
  const user = await directoryService.updateDirectoryUser(
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

export const deleteDirectoryUser = catchAsync(async (req, res) => {
  await directoryService.deleteDirectoryUser(
    req.params.id as string,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'User deleted',
    data: null,
  });
});
