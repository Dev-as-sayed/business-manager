import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { readCache, writeCache } from '@/shared/storage/cacheStorage';
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  resources,
  type SupportedLanguage,
} from '@/shared/i18n/resources';

const i18n = createInstance();
const LANGUAGE_CACHE_KEY = 'manifest-language';

const detectLanguage = (): SupportedLanguage => {
  const stored = readCache(LANGUAGE_CACHE_KEY) as SupportedLanguage | null;

  if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
    return stored;
  }

  const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
  return SUPPORTED_LANGUAGES.includes(deviceLanguage as SupportedLanguage)
    ? (deviceLanguage as SupportedLanguage)
    : 'en';
};

void i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export const setLanguage = async (language: SupportedLanguage): Promise<void> => {
  writeCache(LANGUAGE_CACHE_KEY, language);
  await i18n.changeLanguage(language);
};

export { LANGUAGE_LABELS, SUPPORTED_LANGUAGES };
export type { SupportedLanguage };
export default i18n;
