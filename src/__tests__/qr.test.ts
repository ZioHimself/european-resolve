import { describe, it, expect } from "vitest";
import {
  generateVCard,
  parseFirstName,
  parseLastName,
} from "@/lib/qr";
import type { Member } from "@/data/members";

function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    slug: "john-doe",
    name: "John Doe",
    title: "Developer",
    city: "Brussels",
    photo: "/team/john-doe.png",
    ...overrides,
  };
}

describe("parseFirstName", () => {
  it("extracts first word from simple name", () => {
    expect(parseFirstName("John Doe")).toBe("John");
  });

  it("extracts first word when last name has multiple parts", () => {
    expect(parseFirstName("John Van Der Berg")).toBe("John");
  });

  it("returns entire string for single-word name", () => {
    expect(parseFirstName("Madonna")).toBe("Madonna");
  });

  it("handles empty string", () => {
    expect(parseFirstName("")).toBe("");
  });
});

describe("parseLastName", () => {
  it("extracts second word from simple name", () => {
    expect(parseLastName("John Doe")).toBe("Doe");
  });

  it("extracts all words after first for multi-part last name", () => {
    expect(parseLastName("John Van Der Berg")).toBe("Van Der Berg");
  });

  it("returns empty string for single-word name", () => {
    expect(parseLastName("Madonna")).toBe("");
  });

  it("handles empty string", () => {
    expect(parseLastName("")).toBe("");
  });
});

describe("generateVCard", () => {
  it("generates valid vCard 3.0 with all fields", () => {
    const member = makeMember({
      name: "John Doe",
      title: "Developer",
      email: "john.doe@european-resolve.org",
      phone: "+32 123 456 789",
    });

    const vcard = generateVCard(member);

    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("VERSION:3.0");
    expect(vcard).toContain("N:Doe;John;;;");
    expect(vcard).toContain("FN:John Doe");
    expect(vcard).toContain("ORG:European Resolve VZW");
    expect(vcard).toContain("TITLE:Developer");
    expect(vcard).toContain("EMAIL;TYPE=WORK:john.doe@european-resolve.org");
    expect(vcard).toContain("TEL;TYPE=WORK:+32 123 456 789");
    expect(vcard).toContain("END:VCARD");
  });

  it("generates vCard without EMAIL line when email is absent", () => {
    const member = makeMember({
      email: undefined,
      phone: "+32 123 456 789",
    });

    const vcard = generateVCard(member);

    expect(vcard).not.toContain("EMAIL");
    expect(vcard).toContain("TEL;TYPE=WORK:+32 123 456 789");
  });

  it("generates vCard without TEL line when phone is absent", () => {
    const member = makeMember({
      email: "john.doe@european-resolve.org",
      phone: undefined,
    });

    const vcard = generateVCard(member);

    expect(vcard).toContain("EMAIL;TYPE=WORK:john.doe@european-resolve.org");
    expect(vcard).not.toContain("TEL");
  });

  it("generates valid vCard with only required fields", () => {
    const member = makeMember({
      email: undefined,
      phone: undefined,
    });

    const vcard = generateVCard(member);

    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("VERSION:3.0");
    expect(vcard).toContain("FN:John Doe");
    expect(vcard).toContain("ORG:European Resolve VZW");
    expect(vcard).toContain("TITLE:Developer");
    expect(vcard).toContain("END:VCARD");
    expect(vcard).not.toContain("EMAIL");
    expect(vcard).not.toContain("TEL");
  });

  it("uses CRLF line endings per vCard spec", () => {
    const member = makeMember();

    const vcard = generateVCard(member);

    expect(vcard).toContain("\r\n");
    expect(vcard.split("\r\n").length).toBeGreaterThan(5);
  });

  it("handles multi-word last names correctly in N field", () => {
    const member = makeMember({
      name: "John Van Der Berg",
    });

    const vcard = generateVCard(member);

    expect(vcard).toContain("N:Van Der Berg;John;;;");
    expect(vcard).toContain("FN:John Van Der Berg");
  });

  it("does NOT include PHOTO field", () => {
    const member = makeMember({
      photo: "/team/john-doe.png",
    });

    const vcard = generateVCard(member);

    expect(vcard).not.toContain("PHOTO");
  });

  it("does NOT include URL field", () => {
    const member = makeMember();

    const vcard = generateVCard(member);

    expect(vcard).not.toContain("URL");
  });

  it("handles single-word name gracefully", () => {
    const member = makeMember({
      name: "Madonna",
    });

    const vcard = generateVCard(member);

    expect(vcard).toContain("N:;Madonna;;;");
    expect(vcard).toContain("FN:Madonna");
  });
});
