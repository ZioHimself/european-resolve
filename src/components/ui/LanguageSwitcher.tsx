"use client";

import { localeLabels, type LocaleCode } from "@/locales";
import { useLocale } from "./LocaleProvider";
import styles from "./LanguageSwitcher.module.css";

const codes: LocaleCode[] = ["en", "fr", "uk", "nl", "de"];

export function LanguageSwitcher() {
  const { locale, changeLocale } = useLocale();

  return (
    <div className={styles.switcher} role="radiogroup" aria-label="Language">
      {codes.map((code) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={locale === code}
          className={`${styles.pill} ${locale === code ? styles.active : ""}`}
          onClick={() => changeLocale(code)}
        >
          {localeLabels[code]}
        </button>
      ))}
    </div>
  );
}
