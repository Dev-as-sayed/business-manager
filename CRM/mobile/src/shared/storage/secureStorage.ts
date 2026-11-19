import * as SecureStore from 'expo-secure-store';
import { tokenStore } from '@/api/token-store';

const REFRESH_TOKEN_KEY = 'omnia.refresh-token';
let cachedRefreshToken: string | null = null;

const persistRefreshToken = async (token: string | null): Promise<void> => {
  cachedRefreshToken = token;

  try {
    if (token) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch {
    cachedRefreshToken = token;
  }
};

export const secureStorage = {
  getRefreshToken: async (): Promise<string | null> => {
    if (cachedRefreshToken) {
      return cachedRefreshToken;
    }

    try {
      cachedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      cachedRefreshToken = null;
    }

    return cachedRefreshToken;
  },
  peekRefreshToken: (): string | null => cachedRefreshToken,
  setRefreshToken: persistRefreshToken,
  setTokens: async (tokens: {
    accessToken: string;
    refreshToken?: string | null;
  }): Promise<void> => {
    tokenStore.set(tokens.accessToken);

    if (tokens.refreshToken) {
      await persistRefreshToken(tokens.refreshToken);
    }
  },
  clear: async (): Promise<void> => {
    tokenStore.clear();
    await persistRefreshToken(null);
  },
};
