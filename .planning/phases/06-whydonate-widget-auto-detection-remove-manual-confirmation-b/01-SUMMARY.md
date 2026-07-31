---
phase: "6"
plan: "01"
subsystem: backend
tags: [api, payments, tiers]
requires: []
provides: [confirm-payment-amount, register-email, tier-module]
affects: [confirm-payment, register, sheets-service]
tech-stack:
  added: []
  patterns: [shared-module-extraction]
key-files:
  created:
    - backend/src/tiers.ts
  modified:
    - backend/src/types.ts
    - backend/src/routes/register.ts
    - backend/src/routes/confirm-payment.ts
    - backend/src/services/sheets.ts
    - backend/src/routes/fundraiser.ts
    - src/components/ui/registerTypes.ts
key-decisions:
  - Tier definitions consolidated into backend/src/tiers.ts as single source of truth
  - getEffectiveTier uses threshold-based matching (>=95 patron, >=35 champion, else supporter)
  - Amount falls back to tier price when not provided (backward compat)
requirements-completed: [REGA-06]
duration: "~8 min"
completed: "2026-07-31"
---

# Phase 6 Plan 01: Backend: Amount-Based Payment Confirmation & Email Response Summary

Extended the backend to support amount-based payment confirmation with effective tier computation, and added email to registration response for widget pre-fill.

## Tasks Completed: 3/3

1. **Add email to RegisterResponse** — Added `email: string` to both backend and frontend RegisterResponse interfaces, updated both response construction sites in register route
2. **Extract shared tier data** — Created `backend/src/tiers.ts` with TIER_DATA, RUNNER_ONLY_REWARDS, filterRewards, getTierPrice, getEffectiveTier; updated register.ts, sheets.ts, and fundraiser.ts to import from shared module
3. **Accept amount in confirm-payment** — Extended ConfirmPaymentRequest with optional `amount`, added effectiveTierId/effectiveTierName/rewards to response, updated sheetsService.confirmPayment to record actual amount and compute effective tier

## Deviations from Plan

- Also updated `backend/src/routes/fundraiser.ts` to import TIER_DATA from the shared tiers module (had a duplicate definition not mentioned in the plan)

## Self-Check: PASSED
- `npx tsc --noEmit` passes in backend/
- RegisterResponse contains email field in both backend and frontend types
- tiers.ts exports all required functions
- confirm-payment parses optional amount and returns effective tier data
