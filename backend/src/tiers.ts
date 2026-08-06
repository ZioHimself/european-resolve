import type { TierId, ParticipationType, Language } from "./types.js";
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
 * emails. `runnerOnly` items are prepended before `base` items, and only
 * included for participationType "runner".
 */
export function getLocalizedRewards(
  tierId: TierId,
  participationType: ParticipationType,
  language: string,
): string[] {
  const localeCode = LANGUAGE_TO_LOCALE[language as Language] ?? "en";
  const { base, runnerOnly } = getEmailLocale(localeCode).tierRewards[tierId];
  const baseList = base.split(" · ").filter(Boolean);
  if (participationType !== "runner") return baseList;
  return [...runnerOnly.split(" · ").filter(Boolean), ...baseList];
}

export function getTierPrice(tierId: string): number {
  const tier = TIER_DATA[tierId as TierId];
  return tier?.price ?? 0;
}
