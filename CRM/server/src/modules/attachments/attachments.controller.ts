import httpStatus from 'http-status';
import { ApiError } from '@/shared/errors/ApiError';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as attachmentsService from '@/modules/attachments/attachments.service';
import type {
  ListAttachmentsQuery,
  UploadAttachmentInput,
} from '@/modules/attachments/attachments.types';

export const createAttachment = catchAsync(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('File is required');
  }

  const attachment = await attachmentsService.createAttachment(
    {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
    req.body as UploadAttachmentInput,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Attachment uploaded',
    data: attachment,
  });
});

export const listAttachments = catchAsync(async (req, res) => {
  const result = await attachmentsService.listAttachments(
    req.query as unknown as ListAttachmentsQuery,
    req.user!,
  );

  sendResponse(res, {
    message: 'Attachments retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getAttachment = catchAsync(async (req, res) => {
  const attachment = await attachmentsService.getAttachment(req.params.id as string, req.user!);

  sendResponse(res, {
    message: 'Attachment retrieved',
    data: attachment,
  });
});

export const deleteAttachment = catchAsync(async (req, res) => {
  await attachmentsService.deleteAttachment(
    req.params.id as string,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Attachment deleted',
    data: null,
  });
});
