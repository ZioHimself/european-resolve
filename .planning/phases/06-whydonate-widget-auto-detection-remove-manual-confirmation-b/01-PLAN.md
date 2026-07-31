---
phase: "6"
plan_id: "01"
title: "Backend: Amount-Based Payment Confirmation & Email Response"
objective: "Extend the confirm-payment endpoint to accept an actual donated amount, compute the effective tier/rewards from it, and return the effective tier in the response. Also add email to the registration response for downstream pre-fill."
wave: 1
depends_on: []
files_modified:
  - "backend/src/types.ts"
  - "backend/src/routes/register.ts"
  - "backend/src/routes/confirm-payment.ts"
  - "backend/src/services/sheets.ts"
  - "src/components/ui/registerTypes.ts"
autonomous: true
requirements_addressed: [REGA-06]
---

# Plan 01: Backend: Amount-Based Payment Confirmation & Email Response

## Objective

The current confirm-payment endpoint accepts only `{ token }` and records the tier price from registration as the donated amount — it has no concept of the actual amount donated in the WhyDonate widget. This plan extends the endpoint to accept an optional `amount` field, compute the effective tier and rewards based on actual donated amount, and return them in the response. It also adds `email` to the registration response so the frontend can pre-fill widget donor fields.

## Tasks

<task id="01.1">
<title>Add email to RegisterResponse types</title>

<read_first>
- `backend/src/types.ts` (RegisterResponse interface at line 27)
- `src/components/ui/registerTypes.ts` (frontend RegisterResponse mirror)
- `backend/src/routes/register.ts` (where response objects are constructed, lines 138-148 and 154-163)
</read_first>

<action>
Add `email: string` field to `RegisterResponse` in both:

1. `backend/src/types.ts` — add `email: string` after `fullName` in the `RegisterResponse` interface
2. `src/components/ui/registerTypes.ts` — add `email: string` after `fullName` in the frontend `RegisterResponse` interface

Then update `backend/src/routes/register.ts` to include `email` in both response construction sites:
- Line ~139 (existing registration path): add `email: existing.email`
- Line ~157 (new registration path): add `email: data.email`
</action>

<acceptance_criteria>
- `backend/src/types.ts` RegisterResponse contains `email: string`
- `src/components/ui/registerTypes.ts` RegisterResponse contains `email: string`
- `backend/src/routes/register.ts` both response objects include `email` field
- `npx tsc --noEmit` passes in `backend/` directory
</acceptance_criteria>
</task>

<task id="01.2">
<title>Extract shared tier data and effective tier calculator</title>

<read_first>
- `backend/src/routes/register.ts` (TIER_DATA constant at lines 27-58, RUNNER_ONLY_REWARDS at lines 22-25, filterRewards at lines 115-118)
- `backend/src/services/sheets.ts` (getTierPrice method at lines 178-185)
- `backend/src/types.ts` (TierId type)
</read_first>

<action>
Create `backend/src/tiers.ts` as the single source of truth for tier definitions (D-13):

1. Move `TIER_DATA` from `register.ts` into `backend/src/tiers.ts` as an exported constant
2. Move `RUNNER_ONLY_REWARDS` and `filterRewards()` into the same file
3. Add `getEffectiveTier(amount: number): TierId` function that determines the effective tier from the actual donated amount:
   - amount >= 95 → `"patron"`
   - amount >= 35 → `"champion"`
   - amount >= 10 → `"supporter"`
   - amount < 10 → `"supporter"` (minimum)
4. Add `getTierPrice(tierId: TierId): number` function (move from SheetsService private method)
5. Update `register.ts` to import `TIER_DATA`, `filterRewards`, `RUNNER_ONLY_REWARDS` from `../tiers.js`
6. Update `sheets.ts` to import `getTierPrice` from `../tiers.js` and remove the private method

Threshold values: supporter=10, champion=35, patron=95 (matching D-09).
</action>

<acceptance_criteria>
- `backend/src/tiers.ts` exists and exports `TIER_DATA`, `RUNNER_ONLY_REWARDS`, `filterRewards`, `getEffectiveTier`, `getTierPrice`
- `getEffectiveTier(95)` returns `"patron"`, `getEffectiveTier(35)` returns `"champion"`, `getEffectiveTier(10)` returns `"supporter"`
- `getEffectiveTier(150)` returns `"patron"` (overpay)
- `getEffectiveTier(5)` returns `"supporter"` (underpay floor)
- `register.ts` no longer defines TIER_DATA locally — imports from `../tiers.js`
- `sheets.ts` no longer has a private `getTierPrice` method — imports from `../tiers.js`
- `npx tsc --noEmit` passes in `backend/` directory
</acceptance_criteria>
</task>

<task id="01.3">
<title>Accept amount in confirm-payment and compute effective tier</title>

<read_first>
- `backend/src/routes/confirm-payment.ts` (full file — current endpoint)
- `backend/src/services/sheets.ts` (confirmPayment method at lines 113-165)
- `backend/src/types.ts` (ConfirmPaymentRequest and ConfirmPaymentResponse interfaces)
- `backend/src/tiers.ts` (after task 01.2 — getEffectiveTier, TIER_DATA, filterRewards)
</read_first>

<action>
1. In `backend/src/types.ts`:
   - Add `amount?: number` to `ConfirmPaymentRequest`
   - Add `effectiveTierId: string`, `effectiveTierName: string`, `rewards: string[]` to `ConfirmPaymentResponse`

2. In `backend/src/services/sheets.ts` `confirmPayment()`:
   - Add second parameter `donatedAmount?: number`
   - When `donatedAmount` is a positive number, use it as the recorded amount in Sheets column O (index 14)
   - When `donatedAmount` is absent or non-positive, fall back to `row[8]` (tier price from registration)
   - Return additional fields: `effectiveTierId`, `effectiveTierName`, `rewards`, `participationType` (from `row[16]`)
   - Determine `effectiveTierId` using `getEffectiveTier(recordedAmount)` from `tiers.ts`

3. In `backend/src/routes/confirm-payment.ts`:
   - Parse optional `amount` from request body: `typeof body.amount === "number" && body.amount > 0 ? body.amount : undefined`
   - Pass `amount` to `sheetsService.confirmPayment(token, amount)`
   - Include `effectiveTierId`, `effectiveTierName`, `rewards` in the response

The response shape becomes:
```
{
  confirmed: true,
  participantId: "R4U-5",
  tierName: "Champion",        // original registered tier
  amountEur: 95,               // actual amount recorded
  effectiveTierId: "patron",   // tier determined by actual amount
  effectiveTierName: "Patron",
  rewards: ["Race bib", "Digital certificate", ...]
}
```
</action>

<acceptance_criteria>
- `ConfirmPaymentRequest` in `backend/src/types.ts` has `amount?: number`
- `ConfirmPaymentResponse` in `backend/src/types.ts` has `effectiveTierId`, `effectiveTierName`, `rewards` fields
- `sheetsService.confirmPayment(token)` still works (backward compat — amount optional)
- `sheetsService.confirmPayment(token, 95)` records 95 in Sheets and returns `effectiveTierId: "patron"`
- `sheetsService.confirmPayment(token, 10)` records 10 in Sheets and returns `effectiveTierId: "supporter"`
- Column O in Sheets gets the actual donated amount (not always the tier price)
- `npx tsc --noEmit` passes in `backend/` directory
</acceptance_criteria>
</task>

## Verification

```bash
cd backend && npx tsc --noEmit
# Confirm no type errors after all changes

grep -n "email" src/types.ts | grep RegisterResponse
# Expected: email: string in RegisterResponse

grep -n "amount" src/routes/confirm-payment.ts
# Expected: amount parsed from body

grep -n "getEffectiveTier" src/tiers.ts
# Expected: function definition exists
```

## must_haves

- Registration response includes `email` field for frontend pre-fill (D-17)
- Confirm-payment accepts optional `amount` and records actual donated amount (D-18)
- Effective tier is computed from actual amount, not registered tier (D-09, D-10, D-11)
- Confirm-payment response returns effective tier name and rewards (D-19)
- Backward compatibility: old clients sending only `{ token }` still work (D-18)
- Tier definitions live in one shared module (D-13 backend side)
