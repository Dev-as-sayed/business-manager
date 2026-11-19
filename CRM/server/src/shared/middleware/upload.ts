import multer, { MulterError } from 'multer';
import type { RequestHandler } from 'express';
import { env } from '@/config/env';
import { ApiError } from '@/shared/errors/ApiError';

const maxFileSizeBytes = env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeBytes,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!env.UPLOAD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
      return;
    }

    callback(null, true);
  },
});

export const uploadSingleFile = (fieldName = 'file'): RequestHandler => {
  const handler = upload.single(fieldName);

  return (req, res, next) => {
    handler(req, res, (error: unknown) => {
      if (error instanceof MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          next(ApiError.badRequest(`File exceeds the ${env.UPLOAD_MAX_FILE_SIZE_MB}MB size limit`));
          return;
        }

        next(ApiError.badRequest(error.message));
        return;
      }

      next(error);
    });
  };
};
