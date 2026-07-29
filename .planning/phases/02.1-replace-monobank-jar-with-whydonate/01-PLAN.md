---
phase: "02.1"
plan_id: "01"
title: "Backend: WhyDonate config and payment token generation"
wave: 1
depends_on: []
files_modified:
  - backend/src/config.ts
  - backend/src/types.ts
  - backend/src/routes/register.ts
  - backend/src/services/sheets.ts
  - backend/.env.example
autonomous: true
requirements_addressed: []
---

# Plan 01: Backend — WhyDonate Config & Payment Token Generation

<objective>
Replace Monobank jar configuration with WhyDonate URL, add payment token generation at registration time, store token in Google Sheets, and return WhyDonate + token data in the registration response.
</objective>

<must_haves>
- Registration response no longer contains monobankJarUrl
- Registration response contains paymentToken (UUID) and whydonateWidgetUrl
- Payment token is stored in the Sheets row alongside the registration
- New columns added to Sheets schema: payment_token, payment_status, paid_amount_eur, paid_at
- WHYDONATE_WIDGET_URL replaces MONOBANK_JAR_URL in config
</must_haves>

<tasks>

<task id="01.1">
<title>Replace Monobank config with WhyDonate</title>
<read_first>
- backend/src/config.ts
- backend/.env.example
</read_first>
<action>
In `backend/src/config.ts`: rename `monobankJarUrl` to `whydonateWidgetUrl`, source from `WHYDONATE_WIDGET_URL` env var with empty string default.

In `backend/.env.example`: replace the `MONOBANK_JAR_URL` line with `WHYDONATE_WIDGET_URL=https://whydonate.com/en/fundraising/run-for-ukraine-2026` and update the comment from "Monobank jar URL for donation redirect" to "WhyDonate campaign URL for donation widget".
</action>
<acceptance_criteria>
- `backend/src/config.ts` contains `whydonateWidgetUrl: process.env.WHYDONATE_WIDGET_URL`
- `backend/src/config.ts` does NOT contain `monobankJarUrl` or `MONOBANK`
- `backend/.env.example` contains `WHYDONATE_WIDGET_URL=`
- `backend/.env.example` does NOT contain `MONOBANK`
- `npx tsc --noEmit` in backend dir passes (no type errors from config change)
</acceptance_criteria>
</task>

<task id="01.2">
<title>Update types to replace Monobank with WhyDonate + token</title>
<read_first>
- backend/src/types.ts
- src/components/ui/registerTypes.ts
</read_first>
<action>
In `backend/src/types.ts`: replace `monobankJarUrl: string` in `RegisterResponse` with `paymentToken: string` and `whydonateWidgetUrl: string`.

In `src/components/ui/registerTypes.ts`: replace `monobankJarUrl: string` in `RegisterResponse` with `paymentToken: string` and `whydonateWidgetUrl: string`.
</action>
<acceptance_criteria>
- `backend/src/types.ts` `RegisterResponse` has fields `paymentToken: string` and `whydonateWidgetUrl: string`
- `backend/src/types.ts` does NOT contain `monobankJarUrl`
- `src/components/ui/registerTypes.ts` has matching fields `paymentToken: string` and `whydonateWidgetUrl: string`
- `src/components/ui/registerTypes.ts` does NOT contain `monobankJarUrl`
</acceptance_criteria>
</task>

<task id="01.3">
<title>Update Sheets service to store payment token and new columns</title>
<read_first>
- backend/src/services/sheets.ts
</read_first>
<action>
In `SheetsService.appendRegistration()`: generate a payment token via `crypto.randomUUID()`, append 4 new columns to the row array after the existing 12 columns:
- Column M: payment_token (the generated UUID)
- Column N: payment_status ("pending")
- Column O: paid_amount_eur (empty string — filled on confirmation)
- Column P: paid_at (empty string — filled on confirmation)

Return `{ participantId, paymentToken }` instead of just `{ participantId }`.

Update the `findByEmail` method to also return `paymentToken` from column index 12 (M) in the `ExistingRegistration` interface. Add `paymentToken: string` to the `ExistingRegistration` interface.

Update the range in `findByEmail` from `A:L` to `A:P` to cover new columns.

Import `crypto` from Node.js (`import { randomUUID } from "node:crypto"`).
</action>
<acceptance_criteria>
- `sheets.ts` imports `randomUUID` from `node:crypto`
- `appendRegistration` returns `{ participantId: string; paymentToken: string }`
- Appended row array has 16 elements (A through P)
- `ExistingRegistration` interface includes `paymentToken: string`
- `findByEmail` reads range `A:P` and returns `paymentToken` from `row[12]`
- `npx tsc --noEmit` in backend dir passes
</acceptance_criteria>
</task>

<task id="01.4">
<title>Update register route to return WhyDonate data</title>
<read_first>
- backend/src/routes/register.ts
- backend/src/config.ts
- backend/src/services/sheets.ts
</read_first>
<action>
In `backend/src/routes/register.ts`:
- For new registrations: destructure `{ participantId, paymentToken }` from `sheetsService.appendRegistration(data)`. Build response with `paymentToken` and `whydonateWidgetUrl: config.whydonateWidgetUrl` instead of `monobankJarUrl: config.monobankJarUrl`.
- For existing registrations (email match): use the `paymentToken` from `existing.paymentToken`. Build response with `paymentToken: existing.paymentToken` and `whydonateWidgetUrl: config.whydonateWidgetUrl`.
- Remove all `monobankJarUrl` references.
</action>
<acceptance_criteria>
- `register.ts` does NOT contain `monobankJarUrl` or `monobank`
- `register.ts` response objects include `paymentToken` and `whydonateWidgetUrl`
- Both new-registration and existing-registration code paths return these fields
- `npx tsc --noEmit` in backend dir passes
</acceptance_criteria>
</task>

</tasks>

<verification>
- `cd backend && npx tsc --noEmit` exits 0
- All references to "monobank" removed from backend/src/ (case-insensitive grep returns 0 matches)
- Registration response shape matches new contract: { participantId, fullName, tierId, tierName, amountEur, rewards, paymentToken, whydonateWidgetUrl }
</verification>
