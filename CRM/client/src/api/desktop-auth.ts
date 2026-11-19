import { isDesktop } from '@/app/platform';

let cachedToken: string | null = null;
let tokenLoaded = false;

const getBridge = () => window.desktop;

export const desktopAuth = {
  getRefreshToken: async (): Promise<string | null> => {
    if (!isDesktop) {
      return null;
    }

    if (!tokenLoaded) {
      try {
        cachedToken = (await getBridge()?.auth.getRefreshToken()) ?? null;
      } catch (error) {
        console.warn('Could not read the desktop session.', error);
        cachedToken = null;
      }

      tokenLoaded = true;
    }

    return cachedToken;
  },
  persistRefreshToken: async (token: string | undefined): Promise<void> => {
    if (!isDesktop || !token) {
      return;
    }

    cachedToken = token;
    tokenLoaded = true;

    try {
      await getBridge()?.auth.setRefreshToken(token);
    } catch (error) {
      console.warn('Could not save the desktop session.', error);
    }
  },
  clearRefreshToken: async (): Promise<void> => {
    cachedToken = null;
    tokenLoaded = true;

    if (!isDesktop) {
      return;
    }

    try {
      await getBridge()?.auth.clearRefreshToken();
    } catch (error) {
      console.warn('Could not clear the desktop session.', error);
    }
  },
  peekRefreshToken: (): string | null => (isDesktop ? cachedToken : null),
};
