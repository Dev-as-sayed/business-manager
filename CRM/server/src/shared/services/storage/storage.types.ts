export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface StoredFile {
  storageProvider: string;
  storageKey: string;
  resourceType: string;
  format: string | null;
}

export interface StorageFileReference {
  storageKey: string;
  resourceType: string;
  format?: string | null;
}

export interface StorageProvider {
  upload(file: UploadFileInput): Promise<StoredFile>;
  delete(file: StorageFileReference): Promise<void>;
  getSignedUrl(file: StorageFileReference): Promise<string>;
}
