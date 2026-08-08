# Phase 7: Run for Ukraine Events Listing - Pattern Map

**Mapped:** 2026-08-08
**Files analyzed:** 7 (6 code/config/test + 1 manual ops)
**Analogs found:** 6 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/events.ts` | utility | transform | `src/lib/events.ts` (`groupOrganizersByRole`) | exact |
| `src/components/ui/EventCard.tsx` | component | render | `src/components/ui/EventCard.tsx` (organizer + announcement links) | exact |
| `vitest.config.ts` | config | — | `vitest.config.ts` (existing `include` array) | exact |
| `src/__tests__/events.test.ts` | test | transform | `src/__tests__/events.test.ts` (`groupOrganizersByRole` describe) | exact |
| `src/__tests__/events-page.spec.tsx` | test | render | `src/__tests__/events-page.spec.tsx` ("Show announcement link" scenario) | exact |
| `src/__tests__/features/events-page.feature` | test | — | `src/__tests__/features/events-page.feature` (announcement scenario) | exact |
| Events DB spreadsheet row | model (external) | CRUD | — | no analog |

**Unchanged (reference only):** `src/lib/events-server.ts`, `src/app/events/page.tsx`, `src/components/ui/EventTimeline.tsx`, `src/data/event.ts`, `src/app/events/2026-run-for-ukraine/page.tsx`

## Pattern Assignments

### `src/lib/events.ts` (utility, transform)

**Analog:** `src/lib/events.ts` — co-located pure helpers alongside `parseEvents`

**Co-located helper pattern** (lines 79-91):

```typescript
export function groupOrganizersByRole(
  organizers: { name: string; website?: string; role: string }[],
): OrganizersByRole {
  const map = new Map<string, { name: string; website?: string }[]>();
  for (const org of organizers) {
    const role = org.role || "Organizer";
    if (!map.has(role)) map.set(role, []);
    map
      .get(role)!
      .push({ name: org.name, ...(org.website && { website: org.website }) });
  }
  return Array.from(map, ([role, members]) => ({ role, members }));
}
```

**Placement rule:** Add `isInternalAnnouncementUrl` after `groupOrganizersByRole`, before `fetchEvents`. Same file as `parseEvents` keeps lib imports unified (`EventCard` already imports from `@/lib/events`).

**Recommended implementation pattern:**

```typescript
export function isInternalAnnouncementUrl(url: string): boolean {
  return url.startsWith("/");
}
```

**Export convention:** Named export, no default. Pure function, no side effects, no async — matches `groupOrganizersByRole`.

---

### `src/components/ui/EventCard.tsx` (component, render)

**Analog:** `src/components/ui/EventCard.tsx` — existing link rendering with conditional external attrs

**Import pattern** (lines 1-3):

```typescript
import type { EventDisplay } from "@/lib/events";
import { groupOrganizersByRole } from "@/lib/events";
import styles from "./EventCard.module.css";
```

**Extend import to:**

```typescript
import { groupOrganizersByRole, isInternalAnnouncementUrl } from "@/lib/events";
```

**External link pattern (organizer websites)** (lines 51-58) — keep `target="_blank"` + `rel` for external URLs:

```typescript
{m.website ? (
  <a
    href={m.website}
    target="_blank"
    rel="noopener noreferrer"
  >
    {m.name}
  </a>
) : (
  <span>{m.name}</span>
)}
```

**Current announcement link (to change)** (lines 69-80):

```typescript
{event.announcement_url && (
  <div className={styles.links}>
    {event.announcement_url && (
      <a
        href={event.announcement_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {event.announcement_title || "Announcement"}
      </a>
    )}
  </div>
)}
```

**Target pattern — conditional attrs via spread:**

```typescript
{event.announcement_url && (
  <div className={styles.links}>
    <a
      href={event.announcement_url}
      {...(!isInternalAnnouncementUrl(event.announcement_url) && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
    >
      {event.announcement_title || "Announcement"}
    </a>
  </div>
)}
```

**Component conventions:** Named export `EventCard`, server component (no `'use client'`), CSS Module co-located, plain `<a>` (not Next.js `<Link>`) — consistent with existing announcement and organizer links.

---

### `vitest.config.ts` (config)

**Analog:** `vitest.config.ts` — extend existing `include` array

**Current include pattern** (lines 7-11):

```typescript
test: {
  environment: "jsdom",
  setupFiles: ["./vitest.setup.ts"],
  include: ["src/**/*.test.{ts,tsx}", "backend/src/**/*.test.ts"],
},
```

**Target pattern — add spec suffix without removing backend pattern:**

```typescript
include: [
  "src/**/*.test.{ts,tsx}",
  "src/**/*.spec.{ts,tsx}",
  "backend/src/**/*.test.ts",
],
```

**Note:** Only `events-page.spec.tsx` uses `.spec.tsx` today. Minimal diff preferred over rename (per RESEARCH.md).

---

### `src/__tests__/events.test.ts` (test, transform)

**Analog:** `src/__tests__/events.test.ts` — `groupOrganizersByRole` describe block

**Import + fixture pattern** (lines 1-3, 5-30):

```typescript
import { describe, it, expect } from "vitest";
import { parseEvents, groupOrganizersByRole } from "@/lib/events";
import type { RawEvent } from "@/lib/events";
```

**Describe block structure** (lines 216-284):

```typescript
describe("groupOrganizersByRole", () => {
  it("groups organizers by their role", () => {
    const organizers = [ /* ... */ ];
    const result = groupOrganizersByRole(organizers);
    expect(result).toEqual([ /* ... */ ]);
  });

  it("returns empty array for empty input", () => {
    expect(groupOrganizersByRole([])).toEqual([]);
  });
});
```

**Add after `groupOrganizersByRole` describe:**

```typescript
describe("isInternalAnnouncementUrl", () => {
  it("returns true for root-relative paths", () => {
    expect(isInternalAnnouncementUrl("/events/2026-run-for-ukraine/")).toBe(true);
  });

  it("returns false for external https URLs", () => {
    expect(isInternalAnnouncementUrl("https://facebook.com/events/123")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isInternalAnnouncementUrl("")).toBe(false);
  });
});
```

**Update import:** Add `isInternalAnnouncementUrl` to the import from `@/lib/events`.

---

### `src/__tests__/events-page.spec.tsx` (test, render)

**Analog:** `src/__tests__/events-page.spec.tsx` — "Show announcement link when URL is present" scenario (lines 195-232)

**File header + mocks** (lines 1-29):

```typescript
import { vi, expect } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import type { EventDisplay } from "@/lib/events";
import { fetchEvents } from "@/lib/events";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/lib/events", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/events")>();
  return { ...actual, fetchEvents: vi.fn().mockResolvedValue([]) };
});
```

**Fixture factory** (lines 31-46):

```typescript
function makeEvent(overrides: Partial<EventDisplay> = {}): EventDisplay {
  return {
    date: "2026-01-15",
    name: "Test Event",
    place: "Brussels",
    type: "Protest",
    thumbnail: "",
    image_credit: "",
    announcement_url: "",
    announcement_title: "",
    organizers: [],
    media_features: [],
    tags: [],
    ...overrides,
  };
}
```

**Announcement link assertion pattern** (lines 218-230):

```typescript
Then('a link labelled "Official Event Announcement" is displayed', () => {
  expect(screen.getByText("Official Event Announcement")).toBeInTheDocument();
});

And('the link points to "https://facebook.com/events/123"', () => {
  const link = screen.getByText("Official Event Announcement");
  expect(link.closest("a")).toHaveAttribute(
    "href",
    "https://facebook.com/events/123",
  );
});
```

**New step implementations to mirror:**

```typescript
Then("the link opens in the same tab", () => {
  const link = screen.getByText("View event & register").closest("a")!;
  expect(link).not.toHaveAttribute("target");
  expect(link).not.toHaveAttribute("rel");
});

Then("the announcement link opens in a new tab", () => {
  const link = screen.getByText("Official Event Announcement").closest("a")!;
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
});
```

**Run for Ukraine fixture scenario** — use `makeEvent` with D-04–D-16 values:

```typescript
makeEvent({
  date: "2026-08-23",
  name: "Run for Ukraine 2026",
  type: "Charity run",
  place: "Place du Luxembourg, Brussels",
  announcement_url: "/events/2026-run-for-ukraine/",
  announcement_title: "View event & register",
  thumbnail: "/events/2026-08-23.jpg",
  tags: ["Ukraine", "Independence", "Belgium", "Run"],
  organizers: [
    { name: "Embassy of Ukraine in the Kingdom of Belgium", website: "https://belgium.mfa.gov.ua/en", role: "Co-organiser" },
    { name: "Ukrainian Voices", website: "https://uv-rc.org/", role: "Co-organiser" },
    { name: "European Resolve", website: "https://european-resolve.org", role: "Co-organiser" },
  ],
})
```

**Scenario structure conventions:** `AfterEachScenario(() => cleanup())`, dynamic import of component under test, `let event: EventDisplay` in closure.

---

### `src/__tests__/features/events-page.feature` (test, —)

**Analog:** Existing announcement scenario (lines 37-42)

```gherkin
  Scenario: Show announcement link when URL is present
    Given an event with announcement URL "https://facebook.com/events/123"
    And the announcement title is "Official Event Announcement"
    When the event card is rendered
    Then a link labelled "Official Event Announcement" is displayed
    And the link points to "https://facebook.com/events/123"
```

**Add scenarios following same Given/When/Then rhythm:**

```gherkin
  Scenario: Open internal announcement link in same tab
    Given an event with announcement URL "/events/2026-run-for-ukraine/"
    And the announcement title is "View event & register"
    When the event card is rendered
    Then a link labelled "View event & register" is displayed
    And the link points to "/events/2026-run-for-ukraine/"
    And the link opens in the same tab

  Scenario: Open external announcement link in new tab
    Given an event with announcement URL "https://facebook.com/events/123"
    And the announcement title is "Official Event Announcement"
    When the event card is rendered
    Then the announcement link opens in a new tab
```

**Optional:** Extend existing external scenario with `And the announcement link opens in a new tab` instead of duplicating scenario.

**Feature file conventions:** Feature preamble describes page behavior; scenarios use quoted strings for field values; step text must match spec.tsx bindings exactly.

---

## Shared Patterns

### Pure lib helpers co-located with transforms

**Source:** `src/lib/events.ts`
**Apply to:** `isInternalAnnouncementUrl`

```typescript
export function groupOrganizersByRole(/* ... */): OrganizersByRole { /* pure, sync */ }
export function parseEvents(/* ... */): EventDisplay[] { /* pure, sync */ }
```

New helpers belong in `events.ts`, not a separate file. Keeps `@/lib/events` as single import for EventCard and tests.

### External links always use target + rel

**Source:** `src/components/ui/EventCard.tsx` (lines 52-56, 91-96)
**Apply to:** Organizer links, media feature links, external announcement links

```typescript
<a href={url} target="_blank" rel="noopener noreferrer">
```

Internal announcement links omit both attributes (same-tab navigation per D-15).

### Graceful degradation (unchanged pipeline)

**Source:** `src/lib/events-server.ts` (lines 19-26, 43-57)
**Apply to:** Build-time fetch and thumbnail processing — no changes this phase

```typescript
export async function fetchRawEvents(): Promise<RawEvent[]> {
  try {
    const res = await fetchWithTimeout(API_URL, API_TIMEOUT_MS);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
```

Thumbnail failures silently skip; card renders without image. Spreadsheet `thumbnail_url` → `public/events/2026-08-23.jpg` via existing pipeline.

### BDD test infrastructure

**Source:** `.planning/codebase/TESTING.md`, `events-page.spec.tsx`
**Apply to:** All new EventCard scenarios

- Mock `next/link` as plain `<a>`
- Partial mock `@/lib/events` preserving actual exports via `importOriginal`
- `makeEvent()` factory for `EventDisplay` fixtures
- `loadFeature` + `describeFeature` from `@amiceli/vitest-cucumber`

### Spreadsheet field reference (manual ops)

**Source:** `src/data/event.ts` (lines 78-87), `src/__tests__/events-page.spec.tsx` (Embassy URL)
**Apply to:** Events DB row — not code

| Spreadsheet field | Reference value |
|-------------------|-----------------|
| `date` | `2026-08-23` |
| `name` | `Run for Ukraine 2026` |
| `place` | `Place du Luxembourg, Brussels` (from `eventDetails.location`) |
| `organizers` | Embassy, Ukrainian Voices, European Resolve — role `Co-organiser` |
| `announcement_url` | `/events/2026-run-for-ukraine/` |
| `thumbnail_url` | Google Drive direct-download URL → `/events/2026-08-23.jpg` at build |

Organizer websites: `https://european-resolve.org`, `https://belgium.mfa.gov.ua/en`, `https://uv-rc.org/`

### EVNT-04 bidirectional navigation (no new code)

**Source:** `src/app/events/2026-run-for-ukraine/page.tsx` (lines 23-27)

```typescript
<Breadcrumbs
  items={[
    { label: t("nav.events"), href: "/events" },
    { label: t("hero.title") },
  ]}
/>
```

Phase 7 adds inverse link via spreadsheet `announcement_url` on EventCard. Hub breadcrumbs already satisfy return navigation.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Events DB spreadsheet row | model (external) | CRUD | Operational Google Sheets entry; no in-repo spreadsheet schema or export tooling. Use RESEARCH.md ops checklist and `src/data/event.ts` as field reference. |

## Metadata

**Analog search scope:** `src/lib/`, `src/components/ui/`, `src/__tests__/`, `vitest.config.ts`, `src/data/event.ts`, `src/app/events/`
**Files scanned:** 12
**Pattern extraction date:** 2026-08-08
