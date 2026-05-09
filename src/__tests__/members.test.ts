import { describe, it, expect } from "vitest";
import { members } from "@/data/members";

describe("members data", () => {
  it("is non-empty", () => {
    expect(members.length).toBeGreaterThan(0);
  });

  it("all entries have required fields", () => {
    for (const m of members) {
      expect(m.slug).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.title).toBeTruthy();
      expect(m.city).toBeTruthy();
      expect(m.photo).toBeTruthy();
    }
  });

  it("slugs are unique", () => {
    const slugs = members.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("slugs are valid URL segments", () => {
    for (const m of members) {
      expect(m.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("photo paths match slug pattern", () => {
    for (const m of members) {
      expect(m.photo).toBe(`/team/${m.slug}.png`);
    }
  });

  it("generateStaticParams returns all members", () => {
    const params = members.map((m) => ({ slug: m.slug }));
    expect(params).toHaveLength(members.length);
    for (const p of params) {
      expect(p.slug).toBeTruthy();
    }
  });
});
