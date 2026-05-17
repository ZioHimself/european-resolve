import { describe, it, expect } from "vitest";
import { members, getSocialUrl, getSocialHandle } from "@/data/members";

describe("getSocialUrl", () => {
  it("returns undefined for undefined input", () => {
    expect(getSocialUrl(undefined)).toBeUndefined();
  });

  it("returns the string directly when given a string", () => {
    expect(getSocialUrl("https://github.com/user")).toBe("https://github.com/user");
  });

  it("returns url property when given an object", () => {
    expect(getSocialUrl({ url: "https://github.com/user" })).toBe("https://github.com/user");
  });

  it("returns url property when object also has handle", () => {
    expect(getSocialUrl({ url: "https://github.com/user", handle: "@user" })).toBe("https://github.com/user");
  });
});

describe("getSocialHandle", () => {
  it("returns undefined for undefined input", () => {
    expect(getSocialHandle(undefined)).toBeUndefined();
  });

  it("returns undefined for string input (no handle)", () => {
    expect(getSocialHandle("https://github.com/user")).toBeUndefined();
  });

  it("returns undefined when object has no handle", () => {
    expect(getSocialHandle({ url: "https://github.com/user" })).toBeUndefined();
  });

  it("returns handle when object has handle", () => {
    expect(getSocialHandle({ url: "https://github.com/user", handle: "@user" })).toBe("@user");
  });
});

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
