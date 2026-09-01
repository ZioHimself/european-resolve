import { describe, it, expect } from "vitest";
import {
  parseEvents,
  groupOrganizersByRole,
  isInternalAnnouncementUrl,
  isEventUpcoming,
  isParticipationAnnouncementLink,
} from "@/lib/events";
import type { RawEvent } from "@/lib/events";

function makeRawEvent(overrides: Partial<RawEvent> = {}): RawEvent {
  return {
    date: "2026-01-15",
    name: "Test Event",
    place: "Brussels",
    type: "Protest",
    description: "",
    notes: "",
    drive_url: "",
    thumbnail_url: "",
    image_credit: "",
    announcement_url: "",
    announcement_title: "",
    announcement_date: "",
    attendance_estimated: "",
    attendance_confirmed: "",
    media_photos: 0,
    media_videos: 0,
    tags: [],
    organizers: [],
    contacts: "",
    social_hashtags: "",
    media_features: [],
    ...overrides,
  };
}

describe("parseEvents", () => {
  it("maps raw fields to display type", () => {
    const raw = [
      makeRawEvent({
        date: "2026-02-22",
        name: "We Remember",
        place: "Albertine, Brussels",
        type: "Manifestation",
      announcement_url: "https://facebook.com/events/123",
      announcement_title: "Official Event Announcement",
      drive_url: "",
      organizers: [
          {
            name: "European Resolve",
            website: "https://european-resolve.org",
            role: "Speakers",
          },
        ],
        media_features: ["https://example.com/article"],
        tags: ["Belgium", "Ukraine"],
      }),
    ];

    const result = parseEvents(raw, {});

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      date: "2026-02-22",
      name: "We Remember",
      place: "Albertine, Brussels",
      type: "Manifestation",
      thumbnail: "",
      image_credit: "",
      announcement_url: "https://facebook.com/events/123",
      announcement_title: "Official Event Announcement",
      drive_url: "",
      organizers: [
        {
          name: "European Resolve",
          website: "https://european-resolve.org",
          role: "Speakers",
        },
      ],
      media_features: ["https://example.com/article"],
      tags: ["Belgium", "Ukraine"],
    });
  });

  it("maps drive_url to display output", () => {
    const raw = [
      makeRawEvent({
        drive_url:
          "https://drive.google.com/drive/folders/1BHGxjFwjSv7HCKGnIjkMB6qYa0lro-FI",
      }),
    ];

    const result = parseEvents(raw, {});

    expect(result[0].drive_url).toBe(
      "https://drive.google.com/drive/folders/1BHGxjFwjSv7HCKGnIjkMB6qYa0lro-FI",
    );
  });

  it("excludes internal fields from output", () => {
    const raw = [
      makeRawEvent({
        description: "internal desc",
        notes: "internal note",
        drive_url: "https://drive.google.com/...",
        contacts: "private@email.com",
        social_hashtags: "#test",
        attendance_estimated: 200,
        attendance_confirmed: 150,
        media_photos: 38,
        media_videos: 6,
      }),
    ];

    const result = parseEvents(raw, {});
    const output = result[0];

    expect(output).not.toHaveProperty("description");
    expect(output).not.toHaveProperty("notes");
    expect(output).toHaveProperty("drive_url");
    expect(output).not.toHaveProperty("contacts");
    expect(output).not.toHaveProperty("social_hashtags");
    expect(output).not.toHaveProperty("attendance_estimated");
    expect(output).not.toHaveProperty("attendance_confirmed");
    expect(output).not.toHaveProperty("media_photos");
    expect(output).not.toHaveProperty("media_videos");
  });

  it("sorts events by date descending (newest first)", () => {
    const raw = [
      makeRawEvent({ date: "2025-12-12", name: "First" }),
      makeRawEvent({ date: "2026-02-22", name: "Third" }),
      makeRawEvent({ date: "2026-01-01", name: "Second" }),
    ];

    const result = parseEvents(raw, {});

    expect(result.map((e) => e.name)).toEqual(["Third", "Second", "First"]);
  });

  it("normalises media_features from empty string to empty array", () => {
    const raw = [
      makeRawEvent({
        media_features: "" as unknown as string[],
      }),
    ];

    const result = parseEvents(raw, {});

    expect(result[0].media_features).toEqual([]);
  });

  it("preserves media_features when already an array", () => {
    const raw = [
      makeRawEvent({
        media_features: ["https://wsj.com/article", "https://npr.org/story"],
      }),
    ];

    const result = parseEvents(raw, {});

    expect(result[0].media_features).toEqual([
      "https://wsj.com/article",
      "https://npr.org/story",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(parseEvents([], {})).toEqual([]);
  });

  it("maps thumbnail from thumbnailMap when entry exists", () => {
    const raw = [makeRawEvent({ date: "2025-12-12" })];
    const thumbnailMap = { "2025-12-12": "/events/2025-12-12.jpg" };

    const result = parseEvents(raw, thumbnailMap);

    expect(result[0].thumbnail).toBe("/events/2025-12-12.jpg");
  });

  it("sets thumbnail to empty string when no map entry exists", () => {
    const raw = [makeRawEvent({ date: "2025-12-12" })];

    const result = parseEvents(raw, {});

    expect(result[0].thumbnail).toBe("");
  });

  it("handles multiple events with mixed thumbnail availability", () => {
    const raw = [
      makeRawEvent({ date: "2026-02-22", name: "With Thumb" }),
      makeRawEvent({ date: "2025-12-12", name: "No Thumb" }),
      makeRawEvent({ date: "2026-02-15", name: "Also With Thumb" }),
    ];
    const thumbnailMap = {
      "2026-02-22": "/events/2026-02-22.jpg",
      "2026-02-15": "/events/2026-02-15.jpg",
    };

    const result = parseEvents(raw, thumbnailMap);

    expect(result[0].thumbnail).toBe("/events/2026-02-22.jpg");
    expect(result[1].thumbnail).toBe("/events/2026-02-15.jpg");
    expect(result[2].thumbnail).toBe("");
  });

  it("handles empty strings in optional fields gracefully", () => {
    const raw = [
      makeRawEvent({
        announcement_url: "",
        announcement_title: "",
      }),
    ];

    const result = parseEvents(raw, {});

    expect(result[0].announcement_url).toBe("");
    expect(result[0].announcement_title).toBe("");
  });

  it("preserves organizer data including websites", () => {
    const organizers = [
      {
        name: "European Resolve",
        website: "https://european-resolve.org",
        role: "Lead Organizer",
      },
      { name: "Partner Org", role: "Co-Organizer" },
    ];
    const raw = [makeRawEvent({ organizers })];

    const result = parseEvents(raw, {});

    expect(result[0].organizers).toEqual(organizers);
  });
});

describe("groupOrganizersByRole", () => {
  it("groups organizers by their role", () => {
    const organizers = [
      {
        name: "European Resolve",
        website: "https://european-resolve.org",
        role: "Lead Organizer",
      },
      {
        name: "Promote Ukraine",
        website: "https://promoteukraine.org",
        role: "Lead Organizer",
      },
      { name: "Guest Speaker", role: "Speakers" },
    ];

    const result = groupOrganizersByRole(organizers);

    expect(result).toEqual([
      {
        role: "Lead Organizer",
        members: [
          { name: "European Resolve", website: "https://european-resolve.org" },
          { name: "Promote Ukraine", website: "https://promoteukraine.org" },
        ],
      },
      {
        role: "Speakers",
        members: [{ name: "Guest Speaker" }],
      },
    ]);
  });

  it("defaults missing role to 'Organizer'", () => {
    const organizers = [{ name: "No Role Org", role: "" }];

    const result = groupOrganizersByRole(organizers);

    expect(result).toEqual([
      { role: "Organizer", members: [{ name: "No Role Org" }] },
    ]);
  });

  it("preserves insertion order of roles", () => {
    const organizers = [
      { name: "A", role: "Speakers" },
      { name: "B", role: "Lead Organizer" },
      { name: "C", role: "Speakers" },
    ];

    const result = groupOrganizersByRole(organizers);

    expect(result[0].role).toBe("Speakers");
    expect(result[1].role).toBe("Lead Organizer");
  });

  it("returns empty array for empty input", () => {
    expect(groupOrganizersByRole([])).toEqual([]);
  });

  it("omits website key when not provided", () => {
    const organizers = [{ name: "Solo Org", role: "Partner" }];

    const result = groupOrganizersByRole(organizers);

    expect(result[0].members[0]).toEqual({ name: "Solo Org" });
    expect(result[0].members[0]).not.toHaveProperty("website");
  });
});

describe("isInternalAnnouncementUrl", () => {
  it("returns true for root-relative paths", () => {
    expect(isInternalAnnouncementUrl("/events/2026-run-for-ukraine/")).toBe(
      true,
    );
  });

  it("returns false for external https URLs", () => {
    expect(isInternalAnnouncementUrl("https://facebook.com/events/123")).toBe(
      false,
    );
  });

  it("returns false for empty string", () => {
    expect(isInternalAnnouncementUrl("")).toBe(false);
  });
});

describe("isEventUpcoming", () => {
  it("returns true when event date is today", () => {
    expect(isEventUpcoming("2026-08-23", new Date(2026, 7, 23))).toBe(true);
  });

  it("returns true when event date is in the future", () => {
    expect(isEventUpcoming("2026-08-23", new Date(2026, 7, 1))).toBe(true);
  });

  it("returns false when event date is in the past", () => {
    expect(isEventUpcoming("2026-08-23", new Date(2026, 7, 24))).toBe(false);
  });
});

describe("isParticipationAnnouncementLink", () => {
  const hub = "/events/2026-run-for-ukraine/";
  const now = new Date(2026, 7, 8);

  it("returns true for internal hub when event is upcoming", () => {
    expect(isParticipationAnnouncementLink(hub, "2026-08-23", now)).toBe(true);
  });

  it("returns false for internal hub when event is past", () => {
    expect(isParticipationAnnouncementLink(hub, "2020-01-01", now)).toBe(false);
  });

  it("returns false for external URL even when upcoming", () => {
    expect(
      isParticipationAnnouncementLink(
        "https://facebook.com/events/123",
        "2026-08-23",
        now,
      ),
    ).toBe(false);
  });
});
