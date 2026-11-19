import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/env';
import { ApiError } from '@/shared/errors/ApiError';
import type {
  StorageFileReference,
  StorageProvider,
  StoredFile,
  UploadFileInput,
} from '@/shared/services/storage/storage.types';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const asResourceType = (value: string): 'image' | 'video' | 'raw' => {
  if (value === 'image' || value === 'video' || value === 'raw') {
    return value;
  }

  return 'raw';
};

const upload = (file: UploadFileInput): Promise<StoredFile> =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER,
        resource_type: 'auto',
        type: 'authenticated',
        use_filename: true,
        unique_filename: true,
        filename_override: file.originalName,
      },
      (error, result) => {
        if (error || !result) {
          reject(ApiError.internal('Failed to upload file to Cloudinary'));
          return;
        }

        resolve({
          storageProvider: 'cloudinary',
          storageKey: result.public_id,
          resourceType: result.resource_type ?? 'raw',
          format: result.format ?? null,
        });
      },
    );

    uploadStream.end(file.buffer);
  });

const remove = async (file: StorageFileReference): Promise<void> => {
  await cloudinary.uploader.destroy(file.storageKey, {
    resource_type: asResourceType(file.resourceType),
    type: 'authenticated',
    invalidate: true,
  });
};

const getSignedUrl = async (file: StorageFileReference): Promise<string> =>
  cloudinary.url(file.storageKey, {
    type: 'authenticated',
    resource_type: asResourceType(file.resourceType),
    sign_url: true,
    secure: true,
  });

export const cloudinaryStorageProvider: StorageProvider = {
  upload,
  delete: remove,
  getSignedUrl,
};
