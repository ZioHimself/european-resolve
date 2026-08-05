import type { TierId, ParticipationType } from "./types.js";

export const RUNNER_ONLY_REWARDS = new Set(["Running", "Running t-shirt"]);

export const TIER_DATA: Record<TierId, { name: string; price: number; rewards: string[] }> = {
  supporter: {
    name: "Supporter",
    price: 15,
    rewards: ["Running", "Sticker pack"],
  },
  champion: {
    name: "Champion",
    price: 30,
    rewards: [
      "Running",
      "Sticker pack",
      "Running socks",
      "1 raffle ticket",
    ],
  },
  patron: {
    name: "Patron",
    price: 60,
    rewards: [
      "Running",
      "Sticker pack",
      "Running t-shirt",
      "Traditional Ukrainian meal",
      "3 raffle tickets",
    ],
  },
  hero: {
    name: "Hero",
    price: 100,
    rewards: [
      "Running",
      "Sticker pack",
      "Silk scarf from a Ukrainian designer brand",
      "Traditional Ukrainian meal",
      "5 raffle tickets",
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
 * Thresholds: supporter=15, champion=30, patron=60, hero=100.
 * Amounts below 15 still map to supporter (minimum tier floor).
 */
export function getEffectiveTier(amount: number): TierId {
  if (amount >= 100) return "hero";
  if (amount >= 60) return "patron";
  if (amount >= 30) return "champion";
  return "supporter";
}
