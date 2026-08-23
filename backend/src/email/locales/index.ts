import type { EmailLocale } from "./types.js";
import { en } from "./en.js";
import { fr } from "./fr.js";
import { uk } from "./uk.js";
import { nl } from "./nl.js";
import { de } from "./de.js";

export type { EmailLocale, DelayedRewardKey } from "./types.js";

const locales: Record<string, EmailLocale> = { en, fr, uk, nl, de };

export function getEmailLocale(localeCode: string): EmailLocale {
  return locales[localeCode] ?? en;
}
