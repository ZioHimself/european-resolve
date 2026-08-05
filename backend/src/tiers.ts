import type { TierId, ParticipationType } from "./types.js";

export const RUNNER_ONLY_REWARDS = new Set([
  "Race bib",
  "Technical race t-shirt",
]);

export const TIER_DATA: Record<TierId, { name: string; price: number; rewards: string[] }> = {
  supporter: {
    name: "Supporter",
    price: 10,
    rewards: ["Race bib", "Digital certificate", "Hurkit keychain"],
  },
  champion: {
    name: "Champion",
    price: 35,
    rewards: [
      "Race bib",
      "Digital certificate",
      "Technical race t-shirt",
      "Name on digital wall",
      "Hurkit military branch coin",
      "Hurkit branded sports socks",
    ],
  },
  patron: {
    name: "Patron",
    price: 95,
    rewards: [
      "Race bib",
      "Digital certificate",
      "Technical race t-shirt",
      "Name on digital wall",
      "Hurkit military branch coin",
      "Hurkit branded sports socks",
      "Hurkit silk scarf",
    ],
  },
};

export function filterRewards(rewards: string[], participationType: ParticipationType): string[] {
  if (participationType === "runner") return rewards;
  return rewards.filter((r) => !RUNNER_ONLY_REWARDS.has(r));
}

export function getTierPrice(tierId: string): number {
  const tier = TIER_DATA[tierId as TierId];
  return tier?.price ?? 0;
}

/**
 * Determine effective tier from actual donated amount.
 * Thresholds: supporter=10, champion=35, patron=95.
 * Amounts below 10 still map to supporter (minimum tier floor).
 */
export function getEffectiveTier(amount: number): TierId {
  if (amount >= 95) return "patron";
  if (amount >= 35) return "champion";
  return "supporter";
}
