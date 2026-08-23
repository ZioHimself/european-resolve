---
phase: 08-post-event-registration-closure-activate-completed-mode-back
plan: 01
subsystem: api
tags: [hono, vitest, event-closure, EVENT_STATUS]

requires:
  - phase: 04-polish-communications-post-event-readiness
    provides: Frontend completed-mode UI and REGISTRATION_CLOSED error code pattern
provides:
  - eventClosure helper (isEventCompleted, registrationClosedResponse)
  - config.eventStatus from EVENT_STATUS env var
  - Write-route guards on register, fundraiser, donors, record-donation
  - Route-level closure test suite
affects:
  - 08-02-PLAN.md
  - 08-04-PLAN.md

tech-stack:
  added: []
  patterns:
    - "EVENT_STATUS env var gates write handlers via isEventCompleted() first-line guard"
    - "registrationClosedResponse returns 403 REGISTRATION_CLOSED with field _global"

key-files:
  created:
    - backend/src/lib/eventClosure.ts
    - backend/src/lib/eventClosure.test.ts
    - backend/src/routes/fundraiser.closure.test.ts
    - backend/src/routes/donors.closure.test.ts
    - backend/src/routes/record-donation.closure.test.ts
    - backend/src/routes/confirm-payment.closure.test.ts
    - backend/src/routes/register.closure.test.ts
  modified:
    - backend/src/config.ts
    - backend/.env.example
    - backend/src/routes/register.ts
    - backend/src/routes/fundraiser.ts
    - backend/src/routes/donors.ts
    - backend/src/routes/record-donation.ts

key-decisions:
  - "Default EVENT_STATUS to active when unset (safe for local dev and pre-closure production)"
  - "confirm-payment and read endpoints explicitly excluded from closure guards per D-06/D-11"

patterns-established:
  - "Closure guard as first statement in write handlers before body parsing or Sheets I/O"
  - "Route closure tests mock config.eventStatus completed and assert 403 REGISTRATION_CLOSED"

requirements-completed: [API-02, API-03, API-07, REGA-06]

duration: 5min
completed: 2026-08-23
---

# Phase 08 Plan 01: Backend Write Guards Summary

**EVENT_STATUS-driven write guards blocking registrations, fundraiser edits, and donor wall entries while confirm-payment and read APIs stay open**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-23T12:00:00Z
- **Completed:** 2026-08-23T12:05:00Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments

- Added `isEventCompleted()` and `registrationClosedResponse()` shared helpers keyed on `config.eventStatus`
- Guarded six write handlers (register POST, fundraiser POST/PUT/register, donors POST, record-donation POST) with 403 `REGISTRATION_CLOSED`
- Left `confirm-payment` and GET read endpoints unguarded per D-06/D-11
- Eleven closure tests pass; full suite 286/286 green

## Task Commits

Each task was committed atomically:

1. **Task 1: eventClosure helper, config.eventStatus, env docs** - `d113e36` (feat)
2. **Task 2: Apply closure guards to all write routes** - `c25644c` (feat)
3. **Task 3: Route-level closure tests** - `70b63d1` (test)

## Files Created/Modified

- `backend/src/lib/eventClosure.ts` - Shared closure check and 403 response helper
- `backend/src/config.ts` - `eventStatus` from `EVENT_STATUS` env var
- `backend/.env.example` - Documents `EVENT_STATUS` and GitHub Actions var
- `backend/src/routes/register.ts` - Closure guard on POST /
- `backend/src/routes/fundraiser.ts` - Guards on POST /, PUT /:slug, POST /register
- `backend/src/routes/donors.ts` - Guard on POST /
- `backend/src/routes/record-donation.ts` - Guard on POST /:slug
- `backend/src/routes/*.closure.test.ts` - Route-level closure integration tests

## Decisions Made

- Default `EVENT_STATUS` to `active` when unset, mirroring frontend `useEventStatus.ts` ternary
- `registrationClosedResponse` uses `field: "_global"` and `code: "REGISTRATION_CLOSED"` per Phase 4 error code pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Route tests for fundraiser and confirm-payment required class-based `vi.mock` for `SheetsService`/`DriveService` because modules instantiate services at import time
- Pre-existing `setup-count-by-color-script.ts` type error unrelated to this plan; route changes compile and all tests pass

## User Setup Required

None - no external service configuration required. `EVENT_STATUS=completed` is set at closure deploy time (Plan 08-04).

## Next Phase Readiness

- Backend write guards ready for frontend `?token=` late-payment exception (08-02) and deploy workflow `EVENT_STATUS` wiring (08-04)
- No blockers for Wave 2

## Self-Check: PASSED

- FOUND: backend/src/lib/eventClosure.ts
- FOUND: backend/src/routes/fundraiser.closure.test.ts
- FOUND: d113e36
- FOUND: c25644c
- FOUND: 70b63d1

---
*Phase: 08-post-event-registration-closure-activate-completed-mode-back*
*Completed: 2026-08-23*
