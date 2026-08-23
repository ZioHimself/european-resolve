import type { TierId, Language } from "./types.js";
import { LANGUAGE_TO_LOCALE } from "./types.js";
import { getEmailLocale } from "./email/locales/index.js";

export const TIER_DATA: Record<TierId, { name: string; price: number }> = {
  donor: {
    name: "Donor",
    price: 0,
  },
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

const TIER_THRESHOLDS: { id: TierId; min: number }[] = [
  { id: "ultramarathoner", min: 100 },
  { id: "marathoner", min: 60 },
  { id: "relay-runner", min: 30 },
  { id: "sprinter", min: 15 },
  { id: "supporter", min: 10 },
  { id: "donor", min: 0 },
];

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

export function getEffectiveTier(amountEur: number): TierId {
  if (!Number.isFinite(amountEur) || amountEur <= 0) {
    return "donor";
  }

  for (const threshold of TIER_THRESHOLDS) {
    if (amountEur >= threshold.min) {
      return threshold.id;
    }
  }

  return "donor";
}

/** Rewards for the effective tier only (not stacked from lower tiers). */
export function getCumulativeRewards(tierId: TierId, language: string): string[] {
  return getLocalizedRewards(tierId, language);
}
