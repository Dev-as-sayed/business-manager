import { cloudinaryStorageProvider } from '@/shared/services/storage/cloudinary.provider';
import type { StorageProvider } from '@/shared/services/storage/storage.types';

export const storage: StorageProvider = cloudinaryStorageProvider;
