---
phase: "02.1"
plan_id: "02"
title: "Backend: Payment confirmation endpoint"
wave: 1
depends_on: []
files_modified:
  - backend/src/routes/confirm-payment.ts
  - backend/src/services/sheets.ts
  - backend/src/types.ts
  - backend/src/index.ts
autonomous: true
requirements_addressed: []
---

# Plan 02: Backend — Payment Confirmation Endpoint

<objective>
Create a new POST /api/register/confirm-payment endpoint that validates a one-time payment token, marks the registration as "paid" in Google Sheets, and returns confirmation status to the frontend.
</objective>

<must_haves>
- POST /api/register/confirm-payment accepts { token, participantId }
- Validates token exists in Sheets, matches participantId, and hasn't been used
- On success: marks payment_status as "paid", records paid_amount_eur and paid_at
- Invalidates token after use (prevents replay)
- Returns structured success/error response
</must_haves>

<tasks>

<task id="02.1">
<title>Add confirm-payment types</title>
<read_first>
- backend/src/types.ts
</read_first>
<action>
Add to `backend/src/types.ts`:

`ConfirmPaymentRequest` interface with fields: `token: string`, `participantId: string`.

`ConfirmPaymentResponse` interface with fields: `confirmed: boolean`, `participantId: string`, `tierName: string`, `amountEur: number`.
</action>
<acceptance_criteria>
- `types.ts` exports `ConfirmPaymentRequest` with `token: string` and `participantId: string`
- `types.ts` exports `ConfirmPaymentResponse` with `confirmed: boolean`, `participantId: string`, `tierName: string`, `amountEur: number`
</acceptance_criteria>
</task>

<task id="02.2">
<title>Add Sheets confirmPayment method</title>
<read_first>
- backend/src/services/sheets.ts
</read_first>
<action>
Add method `confirmPayment(token: string, participantId: string)` to `SheetsService`:

1. Read range `Registrations!A:P` to find the row where column M (index 12) matches `token` AND column A (index 0) matches `participantId`
2. If no match: return `{ success: false, error: "invalid_token" }`
3. If column N (index 13) is already "paid": return `{ success: false, error: "already_confirmed" }`
4. Update the row (using `spreadsheets.values.update` with the row range):
   - Column N (payment_status): set to "paid"
   - Column O (paid_amount_eur): copy value from column I (amount_eur, index 8)
   - Column P (paid_at): set to `new Date().toISOString()`
   - Column M (payment_token): clear/empty the token (invalidate)
5. Return `{ success: true, tierName: row[7], amountEur: Number(row[8]) }`

The return type: `Promise<{ success: true; tierName: string; amountEur: number } | { success: false; error: string }>`
</action>
<acceptance_criteria>
- `SheetsService` has method `confirmPayment(token: string, participantId: string)`
- Method returns success with tierName and amountEur on valid token
- Method returns `{ success: false, error: "invalid_token" }` for non-matching token/pid
- Method returns `{ success: false, error: "already_confirmed" }` for already-paid rows
- Method clears the token column after successful confirmation (invalidation)
- Method writes "paid" to payment_status, copies amount, writes ISO timestamp to paid_at
</acceptance_criteria>
</task>

<task id="02.3">
<title>Create confirm-payment route</title>
<read_first>
- backend/src/routes/register.ts
- backend/src/index.ts
</read_first>
<action>
Create `backend/src/routes/confirm-payment.ts`:

- Import Hono, SheetsService, types
- Create `confirmPaymentRoute = new Hono()`
- POST "/" handler:
  - Parse body as `{ token, participantId }`
  - Validate: both fields must be non-empty strings. If invalid, return 400 with `{ success: false, errors: [{ field, message }] }`
  - Call `sheetsService.confirmPayment(token, participantId)`
  - If `success: false`: return 400 with error mapping:
    - `"invalid_token"` → `{ field: "token", message: "Invalid or expired payment token" }`
    - `"already_confirmed"` → `{ field: "token", message: "Payment already confirmed" }`
  - If `success: true`: return 200 with `{ success: true, data: { confirmed: true, participantId, tierName, amountEur } }`
</action>
<acceptance_criteria>
- `backend/src/routes/confirm-payment.ts` exists and exports `confirmPaymentRoute`
- Route handles POST "/" with token + participantId validation
- Returns 400 for missing fields, invalid token, or already-confirmed
- Returns 200 with ConfirmPaymentResponse for valid confirmation
- `npx tsc --noEmit` in backend dir passes
</acceptance_criteria>
</task>

<task id="02.4">
<title>Register confirm-payment route in app</title>
<read_first>
- backend/src/index.ts
</read_first>
<action>
In `backend/src/index.ts`:
- Import `confirmPaymentRoute` from `"./routes/confirm-payment.js"`
- Add route: `app.route("/api/register/confirm-payment", confirmPaymentRoute)` — place it BEFORE the existing `/api/register` route to ensure the more-specific path matches first
</action>
<acceptance_criteria>
- `index.ts` imports `confirmPaymentRoute`
- `app.route("/api/register/confirm-payment", confirmPaymentRoute)` is registered
- The confirm-payment route is registered before the generic /api/register route
- `npx tsc --noEmit` in backend dir passes
</acceptance_criteria>
</task>

</tasks>

<verification>
- `cd backend && npx tsc --noEmit` exits 0
- New endpoint registered at `/api/register/confirm-payment`
- Token validation logic: invalid token → 400, already used → 400, valid → 200 + marks paid
</verification>
