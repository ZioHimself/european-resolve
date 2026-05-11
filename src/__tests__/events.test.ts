import { describe, it, expect } from "vitest";
import { parseEvents } from "@/lib/events";
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
        organizers: [
          { name: "European Resolve", website: "https://european-resolve.org", role: "Speakers" },
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
      announcement_url: "https://facebook.com/events/123",
      announcement_title: "Official Event Announcement",
      organizers: [
        { name: "European Resolve", website: "https://european-resolve.org", role: "Speakers" },
      ],
      media_features: ["https://example.com/article"],
      tags: ["Belgium", "Ukraine"],
    });
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
    expect(output).not.toHaveProperty("drive_url");
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
      { name: "European Resolve", website: "https://european-resolve.org", role: "Lead Organizer" },
      { name: "Partner Org", role: "Co-Organizer" },
    ];
    const raw = [makeRawEvent({ organizers })];

    const result = parseEvents(raw, {});

    expect(result[0].organizers).toEqual(organizers);
  });
});
