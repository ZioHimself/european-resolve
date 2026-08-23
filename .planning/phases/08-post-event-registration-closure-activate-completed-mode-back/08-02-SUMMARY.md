---
phase: 08-post-event-registration-closure-activate-completed-mode-back
plan: 02
subsystem: ui
tags: [nextjs, vitest, completed-mode, register, token-deep-link]

requires:
  - phase: 08-post-event-registration-closure-activate-completed-mode-back
    provides: Backend closure guards with confirm-payment exempt (Plan 01)
provides:
  - Register page token exception for late payment in completed mode
  - Component tests for D-06 closed-banner vs RegisterClient gating
affects:
  - 08-04-PLAN.md

tech-stack:
  added: []
  patterns:
    - "showClosedBanner = isCompleted && !hasToken on register page only"
    - "useSearchParams for token presence without Suspense wrapper (client page)"

key-files:
  created:
    - src/__tests__/register-page-completed.test.tsx
  modified:
    - src/app/events/2026-run-for-ukraine/register/page.tsx

key-decisions:
  - "Token param gates UI visibility only; invalid tokens still fail at API lookup (T-8-04 accept)"
  - "Fundraise page remains fully closed with no token exception per D-09 scope"

patterns-established:
  - "Completed-mode register page: closed banner for visitors, RegisterClient for ?token= deep links"

requirements-completed: [REGA-06, EVNT-02]

duration: 10min
completed: 2026-08-23
---

# Phase 8 Plan 02: Register Page Token Exception Summary

**Register page completed-mode gate with `?token=` deep-link exception so pending registrants can complete payment after closure**

## Performance

- **Duration:** 10 min
- **Started:** 2026-08-23T12:05:00Z
- **Completed:** 2026-08-23T12:07:42Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- `showClosedBanner = isCompleted && !hasToken` replaces blanket `isCompleted` ternary on register page
- Closed banner (D-09) still shown for completed mode without token; no redirect to landing
- RegisterClient and payment confirmation flow visible when `?token=` present in completed mode (D-06)
- Three component test cases covering completed/no-token, completed/token, and active modes

## Task Commits

Each task was committed atomically:

1. **Task 1: Register page token exception + component tests (TDD)** - `6868ea2` (test RED), `ebc7951` (feat GREEN)

**Plan metadata:** pending (docs commit after state update)

## Files Created/Modified

- `src/__tests__/register-page-completed.test.tsx` - Vitest tests for completed-mode token exception
- `src/app/events/2026-run-for-ukraine/register/page.tsx` - `useSearchParams`, `showClosedBanner` logic

## Decisions Made

- Token exception applies only to register page; fundraise page unchanged (fully closed in completed mode)
- No Suspense wrapper added; client page uses `useSearchParams` directly (consistent with FundraiserPage pattern)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Frontend D-06/D-09 register-page behavior complete; ready for snapshot script (08-03) and deploy checklist (08-04)
- Backend confirm-payment already exempt from closure guards (Plan 01)

## Self-Check: PASSED

- `src/__tests__/register-page-completed.test.tsx` — FOUND
- `src/app/events/2026-run-for-ukraine/register/page.tsx` — FOUND
- Commit `6868ea2` (test RED) — FOUND
- Commit `ebc7951` (feat GREEN) — FOUND

---
*Phase: 08-post-event-registration-closure-activate-completed-mode-back*
*Completed: 2026-08-23*
