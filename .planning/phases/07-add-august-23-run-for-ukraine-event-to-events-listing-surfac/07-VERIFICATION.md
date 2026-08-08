---
phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
verified: 2026-08-08T21:25:00Z
status: passed
score: 10/10 must-haves verified
overrides_applied: 1
overrides:
  - must_have: "Static export artifact at out/events/index.html"
    reason: "Next.js 16 static export writes out/events.html (flat file), not out/events/index.html. Verified against actual build output path documented in 07-03-SUMMARY.md."
    accepted_by: gsd-verifier
    accepted_at: 2026-08-08T21:25:00Z
re_verification: false
---

# Phase 7: Run for Ukraine Events Listing Verification Report

**Phase Goal:** Add the August 23 Run for Ukraine 2026 event to the public `/events` timeline as a regular Events DB spreadsheet entry that links to the dedicated event pages.
**Verified:** 2026-08-08T21:25:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                      | Status     | Evidence                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Events DB spreadsheet contains Run for Ukraine 2026 row dated 2026-08-23                   | ✓ VERIFIED | Live API returns entry: `date: 2026-08-23`, `name: Run for Ukraine 2026`, internal `announcement_url`                                    |
| 2   | `/events` renders the entry via `fetchRawEvents` → `parseEvents` (no special-case UI)      | ✓ VERIFIED | `src/app/events/page.tsx` uses standard pipeline; `out/events.html` contains card HTML with no Run-for-Ukraine-specific branches in code |
| 3   | Card announcement link navigates to `/events/2026-run-for-ukraine/` in same tab             | ✓ VERIFIED | `EventCard.tsx` conditional link attrs; `out/events.html` has `href="/events/2026-run-for-ukraine/"`; BDD scenario passes                |
| 4   | Thumbnail processes at build when `thumbnail_url` provided                                 | ✓ VERIFIED | API has Drive `thumbnail_url`; build produced `public/events/2026-08-23.jpg` (69,610 bytes); HTML references `/events/2026-08-23.jpg`  |
| 5   | `npm run build` succeeds with spreadsheet row present                                      | ✓ VERIFIED | Clean build (`rm -rf .next && npm run build`) exit 0; 18 static pages generated                                                          |
| 6   | `npm test` discovers and runs `events-page.spec.tsx` BDD suite                             | ✓ VERIFIED | `vitest.config.ts` includes `src/**/*.spec.{ts,tsx}`; 80 BDD scenarios pass in isolation; full suite 262/262                             |
| 7   | Internal announcement URLs same-tab; external URLs new-tab with `rel="noopener noreferrer"` | ✓ VERIFIED | `isInternalAnnouncementUrl` + conditional spread in `EventCard.tsx`; unit + BDD tests pass                                               |
| 8   | Future/today-dated events show "Upcoming" badge beside type; past events omit it           | ✓ VERIFIED | `isEventUpcoming` helper + `EventCard` badge row; `out/events.html` contains "Upcoming"; BDD show/hide scenarios pass                    |
| 9   | Run for Ukraine card has no Facebook URL or special-case UI                                | ✓ VERIFIED | API `announcement_url` is internal path; `out/events.html` has 0 matches for `facebook.com/events/1826555465375638`; no date-specific code |
| 10  | EVNT-04 bidirectional navigation: hub breadcrumbs → `/events` and list card → hub          | ✓ VERIFIED | Hub page breadcrumbs `{ label: t("nav.events"), href: "/events" }` in `page.tsx`; list card links to hub per truth #3                   |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact                         | Expected                                      | Status     | Details                                                                                  |
| -------------------------------- | --------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `vitest.config.ts`               | Includes `src/**/*.spec.{ts,tsx}`             | ✓ VERIFIED | Three include patterns present (test, spec, backend test)                                |
| `src/lib/events.ts`              | `isInternalAnnouncementUrl`, `isEventUpcoming` | ✓ VERIFIED | Both exported; date-only local midnight comparison with optional `now` param             |
| `src/components/ui/EventCard.tsx` | Conditional links + Upcoming badge            | ✓ VERIFIED | Imports helpers; `.badges` row with type + Upcoming; conditional link spread             |
| `src/components/ui/EventCard.module.css` | Badge row layout                         | ✓ VERIFIED | `.badges` flex container + `.badgeUpcoming` styles present                               |
| `src/__tests__/events.test.ts`   | Unit tests for helpers                        | ✓ VERIFIED | describe blocks for both helpers; 102 tests pass with events-page spec                     |
| `src/__tests__/events-page.spec.tsx` | BDD link + Upcoming + Run for Ukraine    | ✓ VERIFIED | 80 scenarios pass including participation fixture                                        |
| `public/events/2026-08-23.jpg`   | Build-time thumbnail                          | ✓ VERIFIED | Generated at build (69,610 bytes); gitignored per project convention                     |
| `out/events.html`                | Static listing with Run for Ukraine card      | ✓ VERIFIED (override) | Plan cited `out/events/index.html`; Next.js 16 writes `out/events.html` — verified there |

### Key Link Verification

| From                          | To                              | Via                                      | Status     | Details                                                         |
| ----------------------------- | ------------------------------- | ---------------------------------------- | ---------- | --------------------------------------------------------------- |
| Events DB spreadsheet row     | `out/events.html`               | `fetchRawEvents` → `parseEvents` → build | ✓ WIRED    | Build fetches live API (6 events); HTML contains Run for Ukraine |
| `spreadsheet thumbnail_url`   | `public/events/2026-08-23.jpg`  | `processEventThumbnails` at build        | ✓ WIRED    | Drive URL fetchable; JPEG written during build                  |
| `EventCard.tsx`               | `src/lib/events.ts`             | `isInternalAnnouncementUrl` + `isEventUpcoming` | ✓ WIRED | Imported and called in render                                   |
| `EventCard.module.css`        | `EventCard.tsx`                 | `styles.badges` in meta row              | ✓ WIRED    | JSX uses `styles.badges` and `styles.badgeUpcoming`             |
| `npm test`                    | `events-page.spec.tsx`          | vitest include glob                      | ✓ WIRED    | Spec file discovered and executed                               |
| Run for Ukraine hub breadcrumbs | `/events`                     | breadcrumb `href`                        | ✓ WIRED    | `src/app/events/2026-run-for-ukraine/page.tsx` line 25          |

### Data-Flow Trace (Level 4)

| Artifact              | Data Variable        | Source                          | Produces Real Data | Status      |
| --------------------- | -------------------- | ------------------------------- | ------------------ | ----------- |
| `src/app/events/page.tsx` | `events` array   | `fetchRawEvents()` at build     | Yes — live API     | ✓ FLOWING   |
| `EventCard.tsx`       | `event.date`, `event.announcement_url` | `parseEvents(raw, thumbnailMap)` | Yes — Run for Ukraine row from API | ✓ FLOWING |
| `EventCard.tsx`       | Upcoming badge       | `isEventUpcoming(event.date)`   | Yes — 2026-08-23 is future-dated | ✓ FLOWING |
| Build thumbnail       | `event.thumbnail`    | Drive `thumbnail_url` in API row | Yes — `/events/2026-08-23.jpg` | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior                              | Command                                                                 | Result                                      | Status  |
| ------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------- | ------- |
| Full test suite                       | `npm test`                                                              | 13 files, 262/262 pass                      | ✓ PASS  |
| BDD spec discoverable                 | `npx vitest run src/__tests__/events-page.spec.tsx`                     | 80/80 pass                                  | ✓ PASS  |
| Events API has Run for Ukraine        | `curl -sfL $API_URL \| grep -c "Run for Ukraine 2026"`                  | 1                                           | ✓ PASS  |
| Static export contains card + badge   | `grep` on `out/events.html` after `npm run build`                       | name, hub link, Upcoming present; no Facebook | ✓ PASS |
| Thumbnail generated                   | `ls public/events/2026-08-23.jpg` after build                           | 69,610 bytes                                | ✓ PASS  |

### Probe Execution

Step 7c: SKIPPED — no probe scripts declared or conventional for this phase.

### Requirements Coverage

| Requirement | Source Plan | Description                                              | Status      | Evidence                                           |
| ----------- | ----------- | -------------------------------------------------------- | ----------- | -------------------------------------------------- |
| EVNT-04     | 01, 02, 03  | User can navigate back to events list via breadcrumbs    | ✓ SATISFIED | Hub breadcrumbs to `/events` (Phase 1) + inverse list card link (Phase 7) verified |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| —    | —    | None    | —        | —      |

No `TBD`, `FIXME`, `XXX`, stub handlers, or placeholder returns in phase-modified production files.

### Human Verification Required

None — all phase must-haves verified programmatically via live API fetch, clean build, static HTML inspection, and test suite execution.

### Gaps Summary

No gaps found. Phase 7 goal achieved:

- Live Events DB row with correct field values (verified via API JSON, not spreadsheet UI alone)
- Generic EventCard enhancements (same-tab internal links, Upcoming badge) implemented and tested
- Static export at `out/events.html` renders Run for Ukraine card with hub link, CTA "View event & register", and Upcoming badge
- Build and test gates pass

**Note:** Plan 03 artifact path `out/events/index.html` does not match Next.js 16 export layout; override applied — verification used `out/events.html` per actual build output.

---

_Verified: 2026-08-08T21:25:00Z_
_Verifier: Claude (gsd-verifier)_
