import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { uploadLimiter } from '@/shared/middleware/rateLimiters';
import { uploadSingleFile } from '@/shared/middleware/upload';
import { validate } from '@/shared/middleware/validate';
import * as attachmentsController from '@/modules/attachments/attachments.controller';
import {
  attachmentIdParamsSchema,
  listAttachmentsQuerySchema,
  uploadAttachmentBodySchema,
} from '@/modules/attachments/attachments.validation';

const attachmentsRouter = Router();

attachmentsRouter.use(auth);

attachmentsRouter.post(
  '/',
  uploadLimiter,
  authorize('attachments', 'create'),
  uploadSingleFile('file'),
  validate({ body: uploadAttachmentBodySchema }),
  attachmentsController.createAttachment,
);
attachmentsRouter.get(
  '/',
  authorize('attachments', 'read'),
  validate({ query: listAttachmentsQuerySchema }),
  attachmentsController.listAttachments,
);
attachmentsRouter.get(
  '/:id',
  authorize('attachments', 'read'),
  validate({ params: attachmentIdParamsSchema }),
  attachmentsController.getAttachment,
);
attachmentsRouter.delete(
  '/:id',
  authorize('attachments', 'delete'),
  validate({ params: attachmentIdParamsSchema }),
  attachmentsController.deleteAttachment,
);

export { attachmentsRouter };
