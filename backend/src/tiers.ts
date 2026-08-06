import type { TierId, Language } from "./types.js";
import { LANGUAGE_TO_LOCALE } from "./types.js";
import { getEmailLocale } from "./email/locales/index.js";

export const TIER_DATA: Record<TierId, { name: string; price: number }> = {
  supporter: {
    name: "Supporter",
    price: 10,
  },
  sprinter: {
    name: "Sprinter",
    price: 15,
  },
  "relay-runner": {
    name: "Relay runner",
    price: 30,
  },
  marathoner: {
    name: "Marathoner",
    price: 60,
  },
  ultramarathoner: {
    name: "Ultramarathoner",
    price: 100,
  },
};

/**
 * Reward text lives per-language in the email locales (tierRewards) so the
 * same list is reused for both the API response and the confirmation
 * emails.
 */
export function getLocalizedRewards(tierId: TierId, language: string): string[] {
  const localeCode = LANGUAGE_TO_LOCALE[language as Language] ?? "en";
  return getEmailLocale(localeCode)
    .tierRewards[tierId].split(" · ")
    .filter(Boolean);
}

export function getTierPrice(tierId: string): number {
  const tier = TIER_DATA[tierId as TierId];
  return tier?.price ?? 0;
}
