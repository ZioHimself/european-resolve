---
phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
plan: 02
subsystem: ui
tags: [vitest, bdd, eventcard, tdd, events]

# Dependency graph
requires:
  - phase: 07-01
    provides: Vitest BDD include pattern for events-page.spec.tsx
provides:
  - isInternalAnnouncementUrl and isEventUpcoming helpers in events.ts
  - EventCard conditional announcement link attrs (same-tab internal, new-tab external)
  - Auto-derived Upcoming badge in meta row with badge row layout
  - BDD coverage for link behavior, Upcoming badge, and Run for Ukraine participation fixture
affects:
  - 07-03-PLAN.md (spreadsheet row + build verification)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Internal announcement URLs detected via root-relative path prefix (startsWith '/')"
    - "Upcoming status derived from date-only local midnight comparison with optional now param for tests"
    - "Badge row flex layout with distinct type and Upcoming badges side by side"

key-files:
  created: []
  modified:
    - src/lib/events.ts
    - src/components/ui/EventCard.tsx
    - src/components/ui/EventCard.module.css
    - src/__tests__/events.test.ts
    - src/__tests__/events-page.spec.tsx
    - src/__tests__/features/events-page.feature

key-decisions:
  - "Upcoming badge uses neutral black-05 background to distinguish from amber type badge"
  - "isEventUpcoming accepts optional now Date for deterministic unit tests without fake timers"

patterns-established:
  - "Conditional link attrs via spread: internal href-only, external target+rel"
  - "BDD Upcoming scenarios use vi.setSystemTime with AfterEachScenario restore"

requirements-completed: [EVNT-04]

# Metrics
duration: 4min
completed: 2026-08-08
---

# Phase 07 Plan 02: EventCard Link Behavior + Upcoming Badge Summary

**Generic EventCard enhancements via TDD: same-tab internal announcement links, external new-tab links with noopener, and auto-derived Upcoming badge beside type badge**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-08T20:56:00Z
- **Completed:** 2026-08-08T20:57:19Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Exported `isInternalAnnouncementUrl` and `isEventUpcoming` pure helpers co-located in `events.ts`
- EventCard renders conditional announcement link attrs and Upcoming badge in a flex badge row
- Full BDD coverage including Run for Ukraine 2026 participation fixture with hub CTA and no Facebook links
- npm test: 13 files, 262 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Failing unit + BDD tests** - `328dd19` (test)
2. **Task 2 (GREEN): Helpers, EventCard, CSS** - `963062f` (feat)
3. **Task 3 (REFACTOR): Run for Ukraine fixture + link hardening** - `7e3c4b1` (refactor)

**Plan metadata:** `pending` (docs: complete plan)

## Files Created/Modified
- `src/lib/events.ts` - Added `isInternalAnnouncementUrl` and `isEventUpcoming` exports
- `src/components/ui/EventCard.tsx` - Conditional link attrs, Upcoming badge in badges row
- `src/components/ui/EventCard.module.css` - `.badges` flex container and `.badgeUpcoming` styling
- `src/__tests__/events.test.ts` - Unit tests for both helpers
- `src/__tests__/events-page.spec.tsx` - BDD step bindings and Run for Ukraine scenario
- `src/__tests__/features/events-page.feature` - Link behavior and Upcoming badge scenarios

## Decisions Made
- Upcoming badge styled with `--color-black-05` background to differentiate from amber type badge while staying within design tokens
- `isEventUpcoming` accepts optional `now` parameter for deterministic unit tests without fake timers in helper itself

## TDD Gate Compliance

| Gate | Commit | State | Evidence |
|------|--------|-------|----------|
| RED | `328dd19` | 8 tests failed | 6 unit tests failed with `is not a function`; 2 BDD tests failed (same-tab link had target, Upcoming badge missing) |
| GREEN | `963062f` | All targeted tests pass | `npx vitest run events.test.ts events-page.spec.tsx` — 88/88 passed |
| REFACTOR | `7e3c4b1` | Full suite green | `npm test` — 13 files, 262/262 passed |

All three TDD gate commits present in order: test → feat → refactor.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Fixed invalid CSS token in Upcoming badge**
- **Found during:** Task 2 (GREEN)
- **Issue:** Initial `.badgeUpcoming` used non-existent `--color-paper-60` token
- **Fix:** Replaced with existing `--color-black-05` from design token scale
- **Files modified:** `src/components/ui/EventCard.module.css`
- **Verification:** CSS renders with valid token; full test suite passes
- **Committed in:** `963062f` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Token fix required for correct styling. No scope creep.

## Issues Encountered
- Plan verify step references Vitest `-x` flag which is unsupported in v4.1.5 — ran without flag successfully (same as Plan 01)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- EventCard generic link and Upcoming behavior complete and tested
- Plan 03 can add spreadsheet row and verify build-time render with thumbnail pipeline
- EVNT-04 inverse navigation (list → hub) verified via Run for Ukraine BDD fixture

---
*Phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac*
*Completed: 2026-08-08*

## Self-Check: PASSED

- FOUND: src/lib/events.ts (helpers exported)
- FOUND: src/components/ui/EventCard.tsx (badges + conditional links)
- FOUND: .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-02-SUMMARY.md
- FOUND: commit 328dd19 (RED)
- FOUND: commit 963062f (GREEN)
- FOUND: commit 7e3c4b1 (REFACTOR)
