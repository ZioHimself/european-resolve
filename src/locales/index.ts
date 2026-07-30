import type { Locale } from "./types";
import { en } from "./en";
import { nl } from "./nl";
import { fr } from "./fr";
import { de } from "./de";
import { uk } from "./uk";

export type { Locale };

export const locales: Record<string, Locale> = { en, nl, fr, de, uk };

let currentLocale = "en";

export function getLocale(): string {
  return currentLocale;
}

export function setLocale(code: string): void {
  if (code in locales) {
    currentLocale = code;
  }
}

export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const locale = locales[currentLocale];
  let value = locale?.[key as keyof Locale] ?? "";

  if (!value) {
    value = en[key as keyof Locale] ?? "";
  }

  if (!value) {
    return key;
  }

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replaceAll(`{${paramKey}}`, String(paramValue));
    }
  }

  return value;
}
