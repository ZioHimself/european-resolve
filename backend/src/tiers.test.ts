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
    expect(rewards).toEqual(["Thank you for supporting Ukraine's defenders"]);
  });

  it("returns relay-runner tier rewards only, not lower tiers", () => {
    const rewards = getCumulativeRewards("relay-runner", "English");
    expect(rewards).not.toContain("Hear how your donation helped");
    expect(rewards).toContain("Running socks");
    expect(rewards).toContain("1 raffle ticket");
  });

  it("returns marathoner tier rewards only", () => {
    const rewards = getCumulativeRewards("marathoner", "English");
    expect(rewards).toContain("T-shirt");
    expect(rewards).toContain("3 raffle tickets");
    expect(rewards).not.toContain("Running socks");
  });

  it("returns ultramarathoner tier rewards only", () => {
    const rewards = getCumulativeRewards("ultramarathoner", "English");
    expect(rewards).toContain("Silk scarf by a Ukrainian designer brand");
    expect(rewards).toContain("5 raffle tickets");
    expect(rewards).not.toContain("T-shirt");
    expect(rewards).not.toContain("Running socks");
  });
});
