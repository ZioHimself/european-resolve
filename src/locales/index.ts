import type { Locale } from "./types";
import { en } from "./en";
import { nl } from "./nl";
import { fr } from "./fr";
import { de } from "./de";
import { uk } from "./uk";

export type { Locale };

export type LocaleCode = "en" | "fr" | "uk" | "nl" | "de";

export const locales: Record<string, Locale> = { en, nl, fr, de, uk };

export const localeLabels: Record<LocaleCode, string> = {
  en: "EN",
  fr: "FR",
  uk: "UK",
  nl: "NL",
  de: "DE",
};

let currentLocale: LocaleCode = "en";

type LocaleListener = (code: LocaleCode) => void;
const listeners: Set<LocaleListener> = new Set();

export function getLocale(): LocaleCode {
  return currentLocale;
}

export function setLocale(code: string): void {
  if (code in locales && code !== currentLocale) {
    currentLocale = code as LocaleCode;
    listeners.forEach((fn) => fn(currentLocale));
  }
}

export function subscribeLocale(fn: LocaleListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function tWithLocale(
  localeCode: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  const locale = locales[localeCode];
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
