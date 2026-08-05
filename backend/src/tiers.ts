import type { TierId, ParticipationType } from "./types.js";

export const RUNNER_ONLY_REWARDS = new Set([
  "Running",
  "Running t-shirt",
]);

export const TIER_DATA: Record<TierId, { name: string; price: number; rewards: string[] }> = {
  supporter: {
    name: "Supporter",
    price: 10,
    rewards: ["Hear how your donation helped"],
  },
  sprinter: {
    name: "Sprinter",
    price: 15,
    rewards: ["Running", "Sticker pack"],
  },
  "relay-runner": {
    name: "Relay runner",
    price: 30,
    rewards: ["Running", "Sticker pack", "Running socks", "1 raffle ticket"],
  },
  marathoner: {
    name: "Marathoner",
    price: 60,
    rewards: [
      "Running",
      "Sticker pack",
      "Running t-shirt",
      "Traditional Ukrainian meal",
      "3 raffle tickets",
    ],
  },
  ultramarathoner: {
    name: "Ultramarathoner",
    price: 100,
    rewards: [
      "Running",
      "Sticker pack",
      "Silk scarf by a Ukrainian designer brand",
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
