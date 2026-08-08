# Phase 7: Run for Ukraine Events Listing - Research

**Researched:** 2026-08-08
**Domain:** Static events timeline (Google Sheets → parseEvents → EventCard), internal vs external announcement links, build-time thumbnail pipeline
**Confidence:** HIGH

## Summary

Phase 7 is primarily a **data + small UX fix** phase, not a greenfield feature. The `/events` pipeline already exists: `fetchRawEvents()` → `processEventThumbnails()` → `parseEvents()` → `EventTimeline` → `EventCard`. The new Run for Ukraine 2026 row is added **manually** to the Events DB spreadsheet (D-21) with field values locked in CONTEXT.md (D-04–D-20). No special-case UI is required.

The **only code change** implied by locked decisions is generic **internal announcement link handling** in `EventCard.tsx`: relative paths like `/events/2026-run-for-ukraine/` must open in the **same tab** (D-15, D-17), while external URLs (historically Facebook) keep `target="_blank"`. Today every announcement link hardcodes `target="_blank"` and `rel="noopener noreferrer"` regardless of URL — confirmed in source. [VERIFIED: codebase grep + `EventCard.tsx` read]

EVNT-04 is satisfied bidirectionally once the spreadsheet row exists: breadcrumbs on the hub already link back to `/events` (Phase 1); the events card links forward to `/events/2026-run-for-ukraine/` via `announcement_url` (D-13).

**TDD/testing pyramid:** Unit tests cover `parseEvents` / `groupOrganizersByRole` well (`events.test.ts`). BDD scenarios exist in `events-page.feature` + `events-page.spec.tsx`, but **`events-page.spec.tsx` is excluded from `npm test`** because `vitest.config.ts` only includes `*.test.{ts,tsx}`, not `*.spec.tsx`. This must be fixed in Wave 0 before red-green BDD work. New scenarios should cover internal vs external announcement link behavior; build verification remains a manual/integration gate (live spreadsheet + Drive thumbnail).

**Primary recommendation:** Fix Vitest include pattern → add failing BDD + unit tests for `isInternalAnnouncementUrl` → implement conditional link attrs in `EventCard` → manual spreadsheet row + `npm run build` checkpoint.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Spreadsheet row (event metadata) | Database / Storage (Google Sheets) | — | Operational source of truth; manual entry per D-21 |
| Build-time event fetch | Frontend Server (Next.js RSC at build) | CDN / Static | `fetchRawEvents()` in `events/page.tsx` runs at static export build [VERIFIED: codebase] |
| Thumbnail download + resize | Frontend Server (build) | CDN / Static | `processEventThumbnails()` writes `public/events/{date}.jpg` via sharp [VERIFIED: codebase] |
| Client-side refresh | Browser / Client | — | `EventTimeline` calls `fetchEvents()` on hydrate [VERIFIED: codebase] |
| Raw → display transform | Shared lib (`events.ts`) | — | Pure `parseEvents()` — unit-testable |
| Card link behavior (same-tab vs new tab) | Browser (rendered HTML) | Shared lib if helper extracted | `EventCard` renders `<a>`; logic belongs in component or co-located pure helper |
| Hub landing page | CDN / Static | — | Pre-rendered `/events/2026-run-for-ukraine/` (Phase 1) |
| EVNT-04 bidirectional nav | CDN / Static (links) | — | Breadcrumbs (hub → list) + card CTA (list → hub) |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Event UX Goals (derived via discussion)
- **D-01:** The `/events` card for this event serves **participation**, not archive. Job-to-be-done: discover → understand → **act** (register / donate / create fundraising page).
- **D-02:** `/events` audience is people **already on european-resolve.org** who should convert on-site. Facebook is **outbound marketing** for people who never visit the site — not part of `/events` card UX.
- **D-03:** Unlike past civic actions (manifestations, protests), this is a **future participatory event** with a full registration hub. Card behavior should reflect "invitation to join," not "reference link to external recap."

#### Spreadsheet Field Values
- **D-04:** `date`: `2026-08-23`
- **D-05:** `name`: `Run for Ukraine 2026` (short brand name; not the full hero title from locales)
- **D-06:** `type`: `Charity run`
- **D-07:** `place`: `Place du Luxembourg, Brussels`
- **D-08:** `organizers`: Embassy of Ukraine in the Kingdom of Belgium, Ukrainian Voices, European Resolve — all with role `Co-organiser`
- **D-09:** Organizer websites: include URLs for all three where known (European Resolve, Embassy, Ukrainian Voices)
- **D-10:** `tags`: `Ukraine`, `Independence`, `Belgium`, `Run`
- **D-11:** Non-displayed fields (`description`, `notes`, `contacts`, attendance, media counts): **leave empty for now** — only fill fields the card uses plus announcement/thumbnail
- **D-12:** `image_credit`: **not set** (empty)

#### Card Navigation & Announcement Link
- **D-13:** `announcement_url`: `/events/2026-run-for-ukraine/` (internal event hub — satisfies roadmap success criterion #3)
- **D-14:** `announcement_title`: `View event & register` — action-oriented CTA for entering the hub (not the Facebook-style long title)
- **D-15:** Clicking the announcement link should feel like **entering the event** — navigate in the **same tab**, not `target="_blank"` (differs from current EventCard behavior for external links)
- **D-16:** **No Facebook link on the card.** Facebook event URL (`https://www.facebook.com/events/1826555465375638`) is for social/outbound distribution only; not surfaced in `/events` UX
- **D-17:** No special-case card UI for this event — use standard `EventCard`; any same-tab / internal-link behavior applies generically to internal `announcement_url` values (relative paths or same-origin URLs)

#### Thumbnail
- **D-18:** Use the charity run **promo banner** as the event thumbnail (CHARITY RUN for UKRAINE, Pl. du Luxembourg, 23.08 | 10:00, co-organiser logos)
- **D-19:** Provide banner via **`thumbnail_url` in the spreadsheet** pointing to a Google Drive (or equivalent) downloadable URL — standard `processEventThumbnails` pipeline → `public/events/2026-08-23.jpg`
- **D-20:** Team uploads banner to Drive; spreadsheet row holds the URL. Do not hardcode banner in repo unless Drive upload fails.

#### Data Sync (not discussed — planner discretion)
- **D-21:** Spreadsheet row is added **manually** to Events DB. Use `src/data/event.ts` and `src/locales/en.ts` (`hero.title`, location, co-organisers) as reference when filling fields — no automated export/validation script required for this phase unless planner finds it trivial.

### Claude's Discretion

- Exact organizer website URLs (Embassy, Ukrainian Voices) — use official URLs
- Whether internal-link same-tab behavior keys off relative path (`/events/...`) vs same-origin absolute URL
- `announcement_title` exact wording if "View event & register" needs i18n consideration (events page is EN-only today)
- Google Drive sharing settings for thumbnail URL (must be fetchable at build time)

### Deferred Ideas (OUT OF SCOPE)

- **Facebook link on EventCard** — secondary "Find on Facebook" link; user chose nowhere on card
- **Hidden spreadsheet fields** — description, notes, contacts for team reference; defer until needed
- **`image_credit`** on thumbnail — user declined
- **Whole-card clickable** — only announcement link is interactive today; acceptable unless planner finds low-friction improvement trivial with internal-link work
- **Build-time validation** comparing spreadsheet row vs `event.ts` — not required this phase
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EVNT-04 | User can navigate back to events list via breadcrumbs | **Inverse link (Phase 7):** spreadsheet `announcement_url` → `/events/2026-run-for-ukraine/` on card; **Return link (Phase 1):** hub breadcrumbs `{ label: t("nav.events"), href: "/events" }` in `src/app/events/2026-run-for-ukraine/page.tsx`. BDD test: internal announcement link same-tab + href assertion. Build: card appears on `/events` after spreadsheet row. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Static export only** — `output: "export"`; no API routes, ISR, or server runtime at deploy time [VERIFIED: `next.config.ts`]
- **CSS Modules + design tokens** — no Tailwind, no CSS-in-JS
- **Graceful degradation** — API/thumbnail failures must not throw; empty arrays / skip failed downloads [VERIFIED: `events.ts`, `events-server.ts`]
- **No payment processing** on platform
- **GDPR** — Belgian NGO; data minimization (N/A for this phase — no new forms)
- **Named exports**, path alias `@/`, double quotes, semicolons
- **Never use em dash (—)** in user-facing copy
- **Human commits only** — agents do not commit application code unless explicitly asked

## Standard Stack

### Core (existing — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.2.6 | App Router, static export | Project framework [VERIFIED: `package.json`] |
| React | ^19.2.6 | UI | Project stack |
| sharp | ^0.35.3 | Thumbnail resize at build | Already used by `processEventThumbnails` |
| Vitest | ^4.1.5 | Unit + BDD tests | Project test runner |
| @amiceli/vitest-cucumber | ^6.5.0 | Gherkin scenarios | Already used by `events-page.spec.tsx` |
| @testing-library/react | ^16.3.2 | Component rendering | Project convention |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| server-only | ^0.0.1 | Guard `events-server.ts` | Already in place — do not import from client |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain `<a>` with conditional attrs | Next.js `<Link>` for internal URLs | Link adds prefetch; existing EventCard uses plain `<a>` for announcements — stay consistent unless planner wants prefetch |
| Relative-path-only internal detection | Same-origin absolute URL check | Relative path matches D-13 exactly and avoids localhost/production origin branching; extend later if needed |

**Installation:** None required for this phase.

## Package Legitimacy Audit

> No new external packages. Phase uses existing dependencies only.

| Package | Disposition |
|---------|-------------|
| (none) | N/A — no installs |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
Google Sheets (Events DB)
        │
        ▼ build time + client refresh
┌───────────────────┐
│ Apps Script API   │  NEXT_PUBLIC_EVENTS_API_URL
└─────────┬─────────┘
          │ RawEvent[]
          ▼
┌───────────────────┐     thumbnail_url (Drive)
│ fetchRawEvents()  │─────────────────────────────┐
│ (events-server)   │                             ▼
└─────────┬─────────┘              ┌──────────────────────────┐
          │                        │ processEventThumbnails() │
          │                        │ sharp → public/events/   │
          │                        │   {date}.jpg             │
          ▼                        └────────────┬─────────────┘
┌───────────────────┐                          │ thumbnailMap
│ parseEvents()     │◄─────────────────────────┘
│ (events.ts)       │
└─────────┬─────────┘
          │ EventDisplay[]
          ▼
┌───────────────────┐     hydrate: fetchEvents()
│ EventTimeline     │◄──── client refresh (preserves build thumbnails)
│ ('use client')    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ EventCard         │
│ announcement <a>  │── internal? same tab → /events/2026-run-for-ukraine/
│                   │── external? target=_blank → facebook.com/...
└───────────────────┘
```

### Recommended Project Structure

```
src/
├── lib/
│   ├── events.ts              # parseEvents, groupOrganizersByRole, + isInternalAnnouncementUrl (new)
│   └── events-server.ts       # fetchRawEvents, processEventThumbnails (unchanged)
├── components/ui/
│   ├── EventCard.tsx          # conditional link attrs (change)
│   └── EventTimeline.tsx      # unchanged
├── app/events/page.tsx        # unchanged orchestration
└── __tests__/
    ├── events.test.ts         # + unit tests for isInternalAnnouncementUrl
    ├── events-page.spec.tsx   # + BDD scenarios; fix vitest include
    └── features/events-page.feature
```

### Pattern 1: Pure helper + component conditional attrs (TDD-friendly)

**What:** Extract `isInternalAnnouncementUrl(url: string): boolean` to `events.ts` (unit-testable). `EventCard` uses it to omit `target`/`rel` for internal links.

**When to use:** Any announcement URL that should navigate within the site (D-15, D-17).

**Recommended rule (planner discretion resolved):** Treat URLs starting with `/` as internal first; optionally extend to same-origin absolute URLs later. Matches D-13 exactly.

**Example:**

```typescript
// src/lib/events.ts — recommended pattern
export function isInternalAnnouncementUrl(url: string): boolean {
  return url.startsWith("/");
}

// src/components/ui/EventCard.tsx — recommended pattern
const isInternal = isInternalAnnouncementUrl(event.announcement_url);

<a
  href={event.announcement_url}
  {...(!isInternal && {
    target: "_blank",
    rel: "noopener noreferrer",
  })}
>
  {event.announcement_title || "Announcement"}
</a>
```

[VERIFIED: pattern derived from existing `EventCard.tsx` structure; helper placement matches co-located lib pattern for `groupOrganizersByRole`]

### Pattern 2: BDD scenario for Run for Ukraine card (fixture-driven)

**What:** Add Gherkin scenario using `makeEvent()` fixture with D-04–D-16 field values. Assert card content + internal link behavior without live API.

**When to use:** Acceptance criteria for participation CTA UX.

**Example fixture fields:**

```typescript
makeEvent({
  date: "2026-08-23",
  name: "Run for Ukraine 2026",
  type: "Charity run",
  place: "Place du Luxembourg, Brussels",
  announcement_url: "/events/2026-run-for-ukraine/",
  announcement_title: "View event & register",
  tags: ["Ukraine", "Independence", "Belgium", "Run"],
  organizers: [/* three Co-organisers with websites */],
  thumbnail: "/events/2026-08-23.jpg",
})
```

### Pattern 3: Spreadsheet row reference (manual ops)

**What:** Human adds row to Events DB; code consumes via existing API.

**Reference URLs for D-09:**

| Organizer | Suggested website | Confidence |
|-----------|-------------------|------------|
| European Resolve | `https://european-resolve.org` | HIGH [VERIFIED: codebase] |
| Embassy of Ukraine in the Kingdom of Belgium | `https://belgium.mfa.gov.ua/en` | HIGH [VERIFIED: `events-page.spec.tsx` uses this URL] |
| Ukrainian Voices | `https://uv-rc.org/` | MEDIUM [CITED: https://uv-rc.org/about/ — org formerly "Ukrainian Voices RC"; confirm with team] |

**Note:** Organizer display name in spreadsheet (D-08) uses "Embassy of Ukraine in the Kingdom of Belgium"; `event.ts` coOrganisers uses "Embassy of Ukraine in Belgium". Both are acceptable; pick one and stay consistent in the row.

### Anti-Patterns to Avoid

- **Hardcoding Run for Ukraine in EventCard:** Violates D-17; use generic internal-link detection.
- **Adding Facebook to card:** Violates D-16; URL exists only for outbound marketing.
- **Hardcoding banner in repo first:** Violates D-20; Drive URL in spreadsheet is primary path.
- **Special-casing date `2026-08-23` in code:** Use data-driven spreadsheet row only.
- **Using Next.js `<Link>` with `target="_blank"` for internal paths:** Defeats D-15 purpose.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Thumbnail resize | Custom canvas/image pipeline | Existing `processEventThumbnails` + sharp | Already handles 800px JPEG, graceful skip on failure |
| Events API client | New fetch wrapper | `fetchRawEvents` / `fetchEvents` | Timeout, error handling exist |
| Event sorting | Custom sort in EventCard | `parseEvents` + EventTimeline sort | Already newest-first |
| CMS / export script | Spreadsheet ↔ event.ts sync tool | Manual row per D-21 | Explicitly deferred |
| E2E browser tests for /events | Playwright/Cypress setup | Vitest BDD + build checkpoint | Matches project pyramid; static export |

**Key insight:** This phase is 90% operational data entry and one small link-attribute fix. Avoid scope creep into validation tooling or card redesign.

## Common Pitfalls

### Pitfall 1: BDD tests not running in CI

**What goes wrong:** `events-page.spec.tsx` passes locally only if run manually; `npm test` skips it.

**Why it happens:** `vitest.config.ts` `include: ["src/**/*.test.{ts,tsx}"]` excludes `*.spec.tsx`. [VERIFIED: `npx vitest run src/__tests__/events-page.spec.tsx` → "No test files found"]

**How to avoid:** Add `src/**/*.spec.{ts,tsx}` to include, or rename to `events-page.test.tsx`.

**Warning signs:** Test count stays at 176 after adding BDD scenarios; feature file changes have no effect on CI.

### Pitfall 2: EventCard still opens internal hub in new tab

**What goes wrong:** D-15 violated; users leave site context unnecessarily.

**Why it happens:** Lines 72–75 hardcode `target="_blank"` on all announcement links. [VERIFIED: `EventCard.tsx`]

**How to avoid:** TDD: failing BDD asserts `link.closest("a")` has no `target` attribute for `/events/...` URLs.

### Pitfall 3: Google Drive thumbnail not fetchable at build

**What goes wrong:** Build succeeds but card has no thumbnail; `processEventThumbnails` silently skips.

**Why it happens:** Drive sharing link is view-only HTML, not direct download; or fetch times out (15s limit). [VERIFIED: `events-server.ts` THUMBNAIL_TIMEOUT_MS = 15_000]

**How to avoid:** Use direct-download URL format; verify with `curl -I <url>` before build. Manual checkpoint in plan.

### Pitfall 4: Spreadsheet row missing before build verification

**What goes wrong:** `/events` does not show Run for Ukraine; success criterion #2 fails.

**Why it happens:** D-21 manual row not added yet.

**How to avoid:** Separate **code tasks** (link fix + tests) from **ops checkpoint** (spreadsheet row + build).

### Pitfall 5: Client refresh strips thumbnails

**What goes wrong:** Hydrate replaces build-time thumbnail with empty client fetch.

**Why it happens:** `fetchEvents()` returns `parseEvents(raw, {})` with empty thumbnailMap; EventTimeline merges from `initialEvents`. [VERIFIED: `EventTimeline.tsx`]

**How to avoid:** Already handled — do not regress merge logic. Existing BDD scenario "Client-side refresh does not clear build-time data on failure" covers related behavior.

### Pitfall 6: Asserting wrong link target in BDD

**What goes wrong:** External Facebook scenarios pass while internal scenario untested.

**Why it happens:** Current scenario "Show announcement link when URL is present" checks href only, not `target="_blank"`.

**How to avoid:** Extend external scenario to assert `target="_blank"`; add parallel internal scenario asserting absence of `target`.

## Code Examples

### Unit test: isInternalAnnouncementUrl

```typescript
// src/__tests__/events.test.ts — add alongside parseEvents tests
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

### BDD: internal announcement link (same tab)

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

```typescript
// Step implementation pattern (events-page.spec.tsx)
Then("the link opens in the same tab", () => {
  const link = screen.getByText("View event & register").closest("a")!;
  expect(link).not.toHaveAttribute("target");
  expect(link).not.toHaveAttribute("rel");
});
```

### Spreadsheet row field checklist (ops)

```
date:                2026-08-23
name:                Run for Ukraine 2026
type:                Charity run
place:               Place du Luxembourg, Brussels
announcement_url:    /events/2026-run-for-ukraine/
announcement_title:  View event & register
thumbnail_url:       <Drive direct-download URL>
tags:                Ukraine, Independence, Belgium, Run
organizers:          [Embassy, Ukrainian Voices, European Resolve — Co-organiser + websites]
(description, notes, contacts, image_credit: empty)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Facebook `announcement_url` on all cards | Internal hub URL for participatory events | Phase 7 decision D-13–D-16 | Requires generic same-tab link handling |
| All announcement links `target="_blank"` | Conditional: internal same-tab, external new tab | Phase 7 code change | EventCard + tests |
| BDD spec file excluded from Vitest | Include `*.spec.tsx` in config | Wave 0 fix needed | Restores testing pyramid integrity |

**Deprecated/outdated:**
- Roadmap mention of Facebook-style announcement for this event — overridden by CONTEXT D-13, D-16.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Ukrainian Voices official website is `https://uv-rc.org/` | Pattern 3 | Broken organizer link on card |
| A2 | Relative path (`/events/...`) is sufficient for internal detection; same-origin absolute URLs not needed yet | Pattern 1 | Edge case if spreadsheet uses full `https://european-resolve.org/events/...` |
| A3 | Events page remains EN-only; `announcement_title` need not go through `t()` | Claude's Discretion | Minor copy inconsistency if i18n added later |
| A4 | Google Drive URL will be direct-download and reachable within 15s at build | Pitfall 3 | Missing thumbnail on card |

## Open Questions

1. **Ukrainian Voices URL confirmation**
   - What we know: Web presence at `uv-rc.org` for "Ukrainian Voices RC" / UVRC in Belgium [CITED: https://uv-rc.org/about/]
   - What's unclear: Whether team prefers `uv-rc.org` vs another domain
   - Recommendation: Use `https://uv-rc.org/` in spreadsheet; flag `[ASSUMED]` for human verify at ops checkpoint

2. **Vitest include fix: rename vs config change**
   - What we know: Only `events-page.spec.tsx` uses `.spec.tsx` suffix
   - What's unclear: Team preference
   - Recommendation: Add `src/**/*.spec.{ts,tsx}` to `vitest.config.ts` (minimal diff, preserves filename convention in TESTING.md)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build, test | ✓ | v22.19.0 | — |
| npm | scripts | ✓ | 10.9.3 | — |
| Vitest | unit/BDD tests | ✓ | ^4.1.5 | — |
| sharp | thumbnail processing | ✓ | ^0.35.3 (installed) | Skip thumbnails silently |
| Google Apps Script API | event fetch | ✓ (network) | — | Empty events array |
| Events DB spreadsheet row | Run for Ukraine card | ✗ (manual) | — | **Blocking for success criteria 1–3** — ops checkpoint |
| Google Drive thumbnail URL | build thumbnail | ✗ (manual) | — | Card renders without image; build still succeeds |

**Missing dependencies with no fallback:**
- Spreadsheet row for 2026-08-23 (manual ops before production verification)

**Missing dependencies with fallback:**
- Thumbnail URL — card works without image (existing hide-thumbnail behavior)

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.5 + @amiceli/vitest-cucumber ^6.5.0 |
| Config file | `vitest.config.ts` (needs `*.spec.tsx` include — Wave 0) |
| Quick run command | `npx vitest run src/__tests__/events.test.ts -x` |
| BDD run command | `npx vitest run src/__tests__/events-page.spec.tsx -x` (after Wave 0 fix) |
| Full suite command | `npm test` |
| Build gate | `npm run build` |

### TDD / Testing Pyramid (recommended plan order)

```
                    ┌─────────────────┐
                    │  npm run build  │  manual + live spreadsheet/Drive
                    │  (integration)  │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │  BDD: events-page.feature │  EventCard, EventTimeline scenarios
              │  events-page.spec.tsx     │
              └──────────────┬────────────┘
                             │
              ┌──────────────┴──────────────┐
              │  Unit: events.test.ts       │  isInternalAnnouncementUrl, parseEvents
              └─────────────────────────────┘
```

**Red-green order:**
1. Wave 0: Fix Vitest include for `*.spec.tsx`
2. Red: Add unit tests for `isInternalAnnouncementUrl` (function does not exist yet)
3. Red: Add BDD scenarios (internal same-tab, external new-tab, optional Run for Ukraine fixture)
4. Green: Implement helper + `EventCard` conditional attrs
5. Refactor: Extend existing external announcement scenario to assert `target="_blank"`
6. Gate: Manual spreadsheet row → `npm run build` → verify `/events` HTML contains card + thumbnail file exists

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EVNT-04 (inverse) | Events list card links to `/events/2026-run-for-ukraine/` | BDD unit | `npx vitest run src/__tests__/events-page.spec.tsx -x` (after Wave 0) | ✅ spec exists; ❌ not in Vitest include |
| EVNT-04 (inverse) | Internal announcement opens same tab | BDD unit | same | ❌ scenario missing |
| EVNT-04 (return) | Hub breadcrumbs link to `/events` | BDD/manual | Phase 1 — out of Phase 7 code scope | ✅ hub exists |
| D-15/D-17 | External announcements still open new tab | BDD unit | same | ❌ assertion missing |
| D-05–D-10 | Card displays Run for Ukraine fields | BDD unit | same | ❌ fixture scenario missing |
| D-19/D-20 | Thumbnail maps to `/events/2026-08-23.jpg` | unit (parseEvents) + build | `npx vitest run src/__tests__/events.test.ts -x` / `npm run build` | ✅ thumbnail map test exists |
| Pipeline | parseEvents sorts/filters correctly with new row shape | unit | `npx vitest run src/__tests__/events.test.ts -x` | ✅ |
| Success #5 | Build succeeds | integration | `npm run build` | manual |

### Sampling Rate

- **Per task commit:** `npx vitest run src/__tests__/events.test.ts src/__tests__/events-page.spec.tsx -x` (after Wave 0)
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test` + `npm run build` (with spreadsheet row present)

### Wave 0 Gaps

- [ ] `vitest.config.ts` — add `src/**/*.spec.{ts,tsx}` to `include` (or rename `events-page.spec.tsx`)
- [ ] `src/lib/events.ts` — `isInternalAnnouncementUrl` helper (planned)
- [ ] `src/__tests__/events.test.ts` — unit tests for helper
- [ ] `src/__tests__/features/events-page.feature` — internal/external link scenarios + optional Run for Ukraine card scenario
- [ ] `src/__tests__/events-page.spec.tsx` — step implementations for new scenarios
- [ ] Manual ops checklist — spreadsheet row + Drive URL (not automatable in CI)

*(Existing `parseEvents` / `groupOrganizersByRole` coverage is solid — no Wave 0 gap there.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | low | Spreadsheet data is trusted team input; `parseEvents` already normalises `media_features` |
| V5 Output Encoding | yes | React JSX escapes text fields; URLs rendered in `href` — use helper to avoid `javascript:` URLs (not currently in spreadsheet workflow) |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect via `announcement_url` | Spoofing | Only team edits spreadsheet; relative internal paths preferred (D-13) |
| `target="_blank"` tabnabbing | Information disclosure | Keep `rel="noopener noreferrer"` on **external** links only |
| Malicious thumbnail URL at build | Tampering | Trust spreadsheet ops; fetch timeout + skip on failure |

## Sources

### Primary (HIGH confidence)
- Codebase: `src/lib/events.ts`, `src/lib/events-server.ts`, `src/components/ui/EventCard.tsx`, `src/app/events/page.tsx`, `src/__tests__/events.test.ts`, `src/__tests__/events-page.spec.tsx`, `vitest.config.ts`
- `.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md`
- `.planning/codebase/TESTING.md`
- `package.json`, `next.config.ts`

### Secondary (MEDIUM confidence)
- https://uv-rc.org/about/ — Ukrainian Voices / UVRC organisation website
- https://belgium.mfa.gov.ua/en — Embassy website (also used in existing tests)

### Tertiary (LOW confidence)
- None requiring validation beyond assumptions log

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; existing pipeline verified in codebase
- Architecture: HIGH — clear data flow; single code change point (EventCard + optional helper)
- Pitfalls: HIGH — Vitest include gap verified by running vitest; EventCard gap verified in source

**Research date:** 2026-08-08
**Valid until:** 2026-09-08 (stable domain; ops URLs may need confirmation sooner)
