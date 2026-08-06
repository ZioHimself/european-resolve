import { describe, it, expect } from "vitest";
import { getEffectiveTier, getCumulativeRewards } from "./tiers.js";

describe("getEffectiveTier", () => {
  it("maps sub-€10 amounts to donor", () => {
    expect(getEffectiveTier(9.99)).toBe("donor");
  });

  it("maps tier threshold boundaries", () => {
    expect(getEffectiveTier(10)).toBe("supporter");
    expect(getEffectiveTier(15)).toBe("sprinter");
    expect(getEffectiveTier(30)).toBe("relay-runner");
    expect(getEffectiveTier(60)).toBe("marathoner");
    expect(getEffectiveTier(100)).toBe("ultramarathoner");
  });

  it("caps overpay at ultramarathoner", () => {
    expect(getEffectiveTier(150)).toBe("ultramarathoner");
  });

  it("treats zero and non-finite amounts as donor", () => {
    expect(getEffectiveTier(0)).toBe("donor");
    expect(getEffectiveTier(Number.NaN)).toBe("donor");
  });
});

describe("getCumulativeRewards", () => {
  it("returns donor thank-you only for donor tier", () => {
    const rewards = getCumulativeRewards("donor", "English");
    expect(rewards.length).toBeGreaterThanOrEqual(1);
    expect(rewards).toContain("Thank you for supporting Ukraine's defenders");
  });

  it("merges supporter through relay-runner with dedupe", () => {
    const rewards = getCumulativeRewards("relay-runner", "English");
    expect(rewards).toContain("Hear how your donation helped");
    expect(rewards).toContain("Running");
    expect(rewards).toContain("Sticker pack");
    expect(rewards).toContain("Running socks");
    expect(rewards).toContain("1 raffle ticket");
    expect(new Set(rewards).size).toBe(rewards.length);
  });

  it("includes lower-tier rewards for marathoner", () => {
    const rewards = getCumulativeRewards("marathoner", "English");
    expect(rewards).toContain("Hear how your donation helped");
    expect(rewards).toContain("Running");
    expect(rewards).toContain("Running t-shirt");
    expect(rewards).toContain("3 raffle tickets");
  });
});
