import { app, safeStorage } from 'electron';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

let memoryToken: string | null = null;

const getTokenPath = (): string => join(app.getPath('userData'), 'desktop-auth.bin');

export const readRefreshToken = async (): Promise<string | null> => {
  if (!(await safeStorage.isAsyncEncryptionAvailable())) {
    return memoryToken;
  }

  try {
    const decrypted = await safeStorage.decryptStringAsync(await readFile(getTokenPath()));

    if (decrypted.shouldReEncrypt) {
      await writeRefreshToken(decrypted.result);
    }

    return decrypted.result;
  } catch {
    return memoryToken;
  }
};

export const writeRefreshToken = async (token: string): Promise<void> => {
  memoryToken = token;

  if (!(await safeStorage.isAsyncEncryptionAvailable())) {
    await rm(getTokenPath(), { force: true }).catch(() => undefined);
    return;
  }

  try {
    const tokenPath = getTokenPath();
    await mkdir(dirname(tokenPath), { recursive: true });
    const encrypted = await safeStorage.encryptStringAsync(token);
    await writeFile(tokenPath, encrypted, { mode: 0o600 });
  } catch (error) {
    console.warn('Unable to persist the desktop session securely.', error);
  }
};

export const clearRefreshToken = async (): Promise<void> => {
  memoryToken = null;

  try {
    await rm(getTokenPath(), { force: true });
  } catch (error) {
    console.warn('Unable to clear the persisted desktop session.', error);
  }
};
