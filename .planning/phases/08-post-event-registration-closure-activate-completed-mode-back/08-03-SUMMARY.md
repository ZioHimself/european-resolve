---
phase: 08-post-event-registration-closure-activate-completed-mode-back
plan: 03
subsystem: api
tags: [google-sheets, ops-script, vitest, finalStats, closure]

requires:
  - phase: 08-post-event-registration-closure-activate-completed-mode-back
    provides: Reconciliation audit tooling and Sheets getProgress (Plans 01–02 context)
provides:
  - snapshot-final-stats ops CLI reading reconciled Sheets totals
  - Exported buildSnapshot and applyFinalStatsPatch helpers for unit tests
  - npm run snapshot-final-stats alias for pre-closure stats freeze
affects:
  - 08-04-PLAN.md

tech-stack:
  added: []
  patterns:
    - "Ops script stdout-first JSON; optional --apply patches event.ts numeric finalStats only"
    - "chargingStations manual via --charging-stations flag, never derived from raised"

key-files:
  created:
    - backend/src/snapshot-final-stats.ts
    - backend/src/snapshot-final-stats.test.ts
  modified:
    - backend/package.json

key-decisions:
  - "Default stdout JSON per D-13; --apply patches raised/participants/donors only"
  - "participants = all registration rows via getProgress(), documented in script header"
  - "chargingStations included in JSON output only when --charging-stations flag present"

patterns-established:
  - "Closure snapshot follows audit-whydonate-records ops script conventions (tsx, .env, main().catch)"

requirements-completed: [DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, EVNT-02, POST-02]

duration: 5min
completed: 2026-08-23
---

# Phase 8 Plan 03: Snapshot Final Stats Summary

**Ops CLI that reads reconciled Sheets totals via getProgress() and outputs reviewable JSON for event.ts finalStats before closure deploy**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-23T12:09:00Z
- **Completed:** 2026-08-23T12:12:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `snapshot-final-stats.ts` reads reconciled totals from `SheetsService.getProgress()` (not pre-reconciliation API)
- Default mode prints `{ raised, participants, donors }` JSON to stdout for ops review (D-13)
- `--charging-stations N` adds manual `chargingStations` to output only; never auto-calculated (D-14)
- Optional `--apply` patches `finalStats.raised`, `.participants`, `.donors` in `src/data/event.ts` with manual-copy warning
- Eight unit tests pass without live Sheets credentials

## Task Commits

Each task was committed atomically:

1. **Task 1: snapshot-final-stats ops script** - `7417660` (feat)
2. **Task 2: Snapshot script unit tests** - `3e5377f` (test)

## Files Created/Modified

- `backend/src/snapshot-final-stats.ts` - Ops CLI with buildSnapshot, applyFinalStatsPatch, runSnapshot
- `backend/src/snapshot-final-stats.test.ts` - Unit tests for mapping, flag behavior, patch safety
- `backend/package.json` - Added `snapshot-final-stats` npm script alias

## Decisions Made

- Exported pure functions (`buildSnapshot`, `applyFinalStatsPatch`, `runSnapshot`) for testability without live Sheets
- `--apply` does not write `chargingStations`; ops updates copy and chargingStations manually in closure commit (D-16)
- Script header documents participant count semantics (all registration rows, not paid-only)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `cd backend && npx tsc --noEmit` fails on pre-existing unrelated file `setup-count-by-color-script.ts` (untracked WIP). Snapshot script and tests verified via `npx vitest run backend/src/snapshot-final-stats.test.ts` (8/8 pass).

## User Setup Required

None - uses existing Sheets credentials via `.env` (same as other backend ops scripts).

## Next Phase Readiness

- Ops can run `npm run audit-whydonate-records` until clean, then `npm run snapshot-final-stats` to review JSON
- Plan 04 can wire deploy env vars and closure verification once stats are committed to `event.ts`

## Self-Check: PASSED

- FOUND: backend/src/snapshot-final-stats.ts
- FOUND: backend/src/snapshot-final-stats.test.ts
- FOUND: commit 7417660
- FOUND: commit 3e5377f

---
*Phase: 08-post-event-registration-closure-activate-completed-mode-back*
*Completed: 2026-08-23*
