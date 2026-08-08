---
phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
plan: 01
subsystem: testing
tags: [vitest, bdd, cucumber, events-page]

# Dependency graph
requires: []
provides:
  - Vitest include pattern for src/**/*.spec.{ts,tsx}
  - BDD events-page.spec.tsx discoverable via npm test
affects:
  - 07-02-PLAN.md (TDD link behavior and Upcoming badge scenarios)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual test suffix convention: *.test.{ts,tsx} for unit tests, *.spec.{ts,tsx} for BDD"

key-files:
  created: []
  modified:
    - vitest.config.ts

key-decisions:
  - "Extended Vitest include rather than renaming events-page.spec.tsx to preserve BDD naming convention"

patterns-established:
  - "BDD spec files use *.spec.tsx suffix and are included alongside *.test.{ts,tsx} in vitest.config.ts"

requirements-completed: [EVNT-04]

# Metrics
duration: 5min
completed: 2026-08-08
---

# Phase 07 Plan 01: Vitest BDD Include Pattern Summary

**Vitest include extended with `src/**/*.spec.{ts,tsx}` so events-page BDD suite (48 scenarios) runs under npm test**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-08T20:53:28Z
- **Completed:** 2026-08-08T20:54:47Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added `src/**/*.spec.{ts,tsx}` to Vitest test.include alongside existing test and backend patterns
- Confirmed `events-page.spec.tsx` discovered and runs (48 tests pass)
- Full `npm test` suite passes with 13 test files, 224 tests (includes BDD layer)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add *.spec.tsx to Vitest include pattern** - `66bbe62` (chore)
2. **Task 2: Verify BDD suite is discoverable by npm test** - verification only (no file changes)

**Plan metadata:** `308ee2b` (docs: complete plan)

## Files Created/Modified
- `vitest.config.ts` - Extended test.include with spec suffix glob for BDD discovery

## Decisions Made
- Extended include pattern rather than renaming `events-page.spec.tsx` — preserves BDD naming convention documented in TESTING.md

## Deviations from Plan

None - plan executed exactly as written.

Note: Plan verify step used `npx vitest run ... -x` but Vitest v4.1.5 does not support `-x` flag; ran without it successfully.

## Issues Encountered
- Vitest `-x` CLI flag unknown in v4.1.5 — ran `npx vitest run src/__tests__/events-page.spec.tsx` without flag; discovery and execution confirmed

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Wave 0 gap closed: BDD layer executable via npm test
- Plan 02 can add failing link-behavior and Upcoming badge scenarios that CI will enforce

---
*Phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac*
*Completed: 2026-08-08*

## Self-Check: PASSED

- FOUND: vitest.config.ts
- FOUND: .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-01-SUMMARY.md
- FOUND: commit 66bbe62
