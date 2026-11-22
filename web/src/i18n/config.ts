import { messages } from "@/i18n/messages/en";

export const locales = ["en", "es", "fr", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "中文",
};

export const localeStatus: Record<Locale, "ready" | "coming-soon"> = {
  en: "ready",
  es: "coming-soon",
  fr: "coming-soon",
  zh: "coming-soon",
};

export function getMessages(_locale: Locale = defaultLocale) {
  return messages;
}
