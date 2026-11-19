import { createMMKV, type MMKV } from 'react-native-mmkv';

interface PersistStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

let mmkv: MMKV | null = null;

const getStore = (): MMKV => {
  mmkv ??= createMMKV({ id: 'omnia-cache' });
  return mmkv;
};

export const readCache = (key: string): string | null => getStore().getString(key) ?? null;

export const writeCache = (key: string, value: string): void => {
  getStore().set(key, value);
};

export const cacheStorage: PersistStorage = {
  getItem: async (key) => getStore().getString(key) ?? null,
  setItem: async (key, value) => {
    getStore().set(key, value);
  },
  removeItem: async (key) => {
    getStore().remove(key);
  },
};
