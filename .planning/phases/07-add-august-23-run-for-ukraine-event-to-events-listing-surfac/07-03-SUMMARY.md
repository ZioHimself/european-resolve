---
phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
plan: 03
subsystem: infra
tags: [events, spreadsheet, build-verification, google-drive, static-export]

# Dependency graph
requires:
  - phase: 07-02
    provides: EventCard internal links, Upcoming badge, BDD coverage
provides:
  - Live Events DB row for Run for Ukraine 2026 (2026-08-23)
  - Build-time thumbnail at public/events/2026-08-23.jpg (gitignored, generated at build)
  - Static /events listing with Run for Ukraine card, hub link, Upcoming badge
  - Phase 7 roadmap success criteria 1–5 verified
affects:
  - deployment (Cloudflare Pages build must fetch live API + Drive thumbnail)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Manual Events DB spreadsheet row is operational source for new timeline entries"
    - "Next.js 16 static export writes out/events.html (not out/events/index.html)"
    - "Clean .next cache required when API data changes mid-session"

key-files:
  created: []
  modified: []

key-decisions:
  - "Organizer name typo in spreadsheet left as ops fix — not corrected in code"

patterns-established:
  - "Build verification greps out/events.html for Next.js 16 export layout"

requirements-completed: [EVNT-04]

# Metrics
duration: 25min
completed: 2026-08-08
---

# Phase 07 Plan 03: Spreadsheet Row + Build Verification Summary

**Run for Ukraine 2026 live in Events DB with Drive thumbnail pipeline; static export renders card with same-tab hub link and Upcoming badge**

## Performance

- **Duration:** 25 min (includes manual Tasks 1–2 + Task 3 verification)
- **Started:** 2026-08-08T20:58:00Z
- **Completed:** 2026-08-08T21:22:23Z
- **Tasks:** 3
- **Files modified:** 0 (manual ops + build artifacts; thumbnail gitignored)

## Accomplishments

- Events DB spreadsheet row live: date `2026-08-23`, name `Run for Ukraine 2026`, hub `announcement_url` `/events/2026-run-for-ukraine/`
- Drive `thumbnail_url` fetchable; build writes `public/events/2026-08-23.jpg` (69 KB)
- `out/events.html` contains event name, internal hub href, and `Upcoming` badge text
- No Facebook event URL `1826555465375638` in listing HTML
- `npm run build` exit 0; `npm test` 13 files, 262/262 pass

## Task Commits

Tasks 1–2 were manual operational steps (Google Sheets + Drive) with no repository changes.

1. **Task 1: Spreadsheet row** — N/A (manual ops, verified via API)
2. **Task 2: Drive thumbnail** — N/A (manual ops, verified via curl + build)
3. **Task 3: Build verification** — N/A (verification-only; no tracked file changes)

**Plan metadata:** pending (docs: complete plan)

## Spreadsheet & Build Verification

| Check | Result |
|-------|--------|
| API returns `Run for Ukraine 2026` | PASS |
| `announcement_url` = `/events/2026-run-for-ukraine/` | PASS |
| `out/events.html` contains event name | PASS |
| Hub link in static HTML | PASS |
| `Upcoming` badge in static HTML | PASS |
| No Facebook URL in listing | PASS |
| `public/events/2026-08-23.jpg` after build | PASS (69,610 bytes) |
| `npm test` | PASS (262/262) |

## Ops Notes

- **Organizer typo:** Spreadsheet/API may show `Embassy of Ukrainein the Kingdom of Belgium` (missing space between "Ukraine" and "in"). Cosmetic ops fix in Events DB only; not corrected in application code.
- **Static export path:** Next.js 16 writes `out/events.html`, not `out/events/index.html` as stated in PLAN.md — verification updated accordingly.
- **Build cache:** First `npm run build` after row add served stale cached `/events` HTML (5 events, no Run for Ukraine). `rm -rf .next && npm run build` fetched live API (6 events) and processed thumbnail. CI fresh builds unaffected.

## Files Created/Modified

- `public/events/2026-08-23.jpg` — generated at build (gitignored per `public/events/`)
- `out/events.html` — static listing with Run for Ukraine card (gitignored build output)

## Decisions Made

- Organizer name typo documented for team spreadsheet correction; no code-side normalization added

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written after clean rebuild resolved stale cache.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** Verification path adjusted for Next.js 16 `out/events.html` output location (documented, not a code change).

## Issues Encountered

- Stale `.next` cache caused first post-row build to omit new event; resolved by clean rebuild before final verification

## User Setup Required

None beyond manual spreadsheet row and Drive thumbnail (completed by operator).

## Next Phase Readiness

- Phase 7 complete: EVNT-04 bidirectional nav (breadcrumbs + events card) live in production static export
- Deploy push to `main` will rebuild with live API row and thumbnail
- Optional ops: fix Embassy organizer typo in spreadsheet

---
*Phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac*
*Completed: 2026-08-08*

## Self-Check: PASSED

- FOUND: public/events/2026-08-23.jpg (build artifact, gitignored)
- FOUND: out/events.html with Run for Ukraine 2026, hub link, Upcoming
- FOUND: .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-03-SUMMARY.md
- npm test: 262/262 passed
