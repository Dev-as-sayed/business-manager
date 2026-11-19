import httpStatus from 'http-status';
import { env } from '@/config/env';
import { ApiError } from '@/shared/errors/ApiError';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  isMobileClient,
  setRefreshTokenCookie,
} from '@/modules/auth/auth.cookies';
import * as authService from '@/modules/auth/auth.service';

export const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body, getRequestMeta(req));
  if (!isMobileClient(req)) {
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Registration successful',
    data: result,
  });
});

export const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body, getRequestMeta(req));
  if (!isMobileClient(req)) {
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
  }

  sendResponse(res, {
    message: 'Login successful',
    data: result,
  });
});

export const refresh = catchAsync(async (req, res) => {
  const token = getRefreshTokenFromRequest(req, req.body?.refreshToken);

  if (!token) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  const result = await authService.refresh(token, getRequestMeta(req));
  if (!isMobileClient(req)) {
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
  }

  sendResponse(res, {
    message: 'Token refreshed',
    data: result,
  });
});

export const logout = catchAsync(async (req, res) => {
  const token = getRefreshTokenFromRequest(req, req.body?.refreshToken);

  if (token) {
    await authService.logout(token, getRequestMeta(req));
  }

  if (!isMobileClient(req)) {
    clearRefreshTokenCookie(res);
  }
  sendResponse(res, {
    message: 'Logged out successfully',
    data: null,
  });
});

export const logoutAll = catchAsync(async (req, res) => {
  await authService.logoutAll(req.user!.id, getRequestMeta(req));

  if (!isMobileClient(req)) {
    clearRefreshTokenCookie(res);
  }
  sendResponse(res, {
    message: 'All sessions revoked',
    data: null,
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email, getRequestMeta(req));

  sendResponse(res, {
    message: 'If an account exists, a password reset link has been sent',
    data: env.NODE_ENV === 'production' ? null : result,
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body, getRequestMeta(req));

  if (!isMobileClient(req)) {
    clearRefreshTokenCookie(res);
  }
  sendResponse(res, {
    message: 'Password reset successful',
    data: null,
  });
});

export const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user!.id, req.body, getRequestMeta(req));

  if (!isMobileClient(req)) {
    clearRefreshTokenCookie(res);
  }
  sendResponse(res, {
    message: 'Password changed successfully. Please sign in again.',
    data: null,
  });
});

export const me = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user!.id);

  sendResponse(res, {
    message: 'Current user',
    data: user,
  });
});
