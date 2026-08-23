import { describe, expect, it } from "vitest";
import { scoreNameMatch } from "./whydonateOrders.js";

describe("scoreNameMatch", () => {
  it("matches word-level donor names", () => {
    expect(scoreNameMatch("Arthur Bobyshev", "Arthur")).toEqual({
      score: 2,
      reason: "word-match",
    });
    expect(scoreNameMatch("Cyriel Van Damme", "Cyriel")).toEqual({
      score: 2,
      reason: "word-match",
    });
  });

  it("does not match anonymous WD to named registrations", () => {
    expect(scoreNameMatch("anna nyporka", "Anonymous")).toEqual({
      score: 0,
      reason: "anonymous",
    });
  });

  it("does not substring-match business names to Andrea", () => {
    expect(scoreNameMatch("Brows and lashes Bruxelles", "Andrea")).toEqual({
      score: 0,
      reason: "no-match",
    });
  });
});
