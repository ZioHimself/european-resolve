# Phase 2: Backend API & Registration - Context

**Gathered:** 2026-07-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy a GCP Cloud Run backend (Hono, TypeScript) that accepts Track A registrations via `POST /api/register`, validates input, persists to Google Sheets, and returns a participant ID. The frontend registration form (currently preview/disabled from Phase 1) becomes fully functional — custom validation, error display, inline confirmation panel with Monobank jar redirect. Completes the registration user journey end-to-end.

</domain>

<decisions>
## Implementation Decisions

### Backend Project Structure
- **D-01:** Backend lives in a subfolder of this repo (e.g. `backend/` or `api/`), not a separate repository.
- **D-02:** Framework is **Hono** (TypeScript-first, lightweight, good Cloud Run fit). Not Express — despite only-facts using Express, Hono is preferred for this project.
- **D-03:** Deployment patterns (WIF auth, Artifact Registry, multi-stage Dockerfile, GitHub Actions) borrowed from only-facts, adapted for Cloud Run (not GKE).

### GCP Deployment
- **D-04:** Same GCP project as only-facts (`dev-serhiy`). Reuses existing Workload Identity Federation setup for GitHub Actions → GCP auth.
- **D-05:** Deploys to **Cloud Run** (not GKE). Simpler operational model for a focused API.
- **D-06:** **Cloud Run service identity** for Google Sheets auth — the Cloud Run service account is shared on the Google Spreadsheet as an Editor. No JSON key files. For local dev, use `gcloud auth application-default login`.
- **D-07:** GitHub Actions CI/CD in this repo. Deploy triggers on push to `main`, scoped to `backend/` changes only.

### Google Sheets Schema
- **D-08:** Single **"Registrations" tab** for Phase 2. Fundraiser and wall entry tabs added in Phase 3.
- **D-09:** Columns: `participant_id`, `full_name`, `email`, `phone`, `tshirt_size`, `language`, `country`, `tier_id`, `amount_eur`, `gdpr_consent`, `comms_optin`, `registered_at`.
- **D-10:** **Idempotent by email** — if the same email submits again, return the existing participant ID and registration data. No new row created, no error shown. Users who want to edit data contact the team directly.

### Participant ID
- **D-11:** Format is `R4U-{n}` — sequential integer, no zero-padding. Examples: `R4U-1`, `R4U-2`, `R4U-42`.
- **D-12:** Derived from the row number in Google Sheets (or a counter in the sheet).

### Post-Registration Confirmation Flow
- **D-13:** **Inline confirmation** — the registration form is replaced by a confirmation panel on the same page (no redirect to a separate page).
- **D-14:** Confirmation panel shows: participant ID, registrant name, tier name, amount (EUR), selected tier rewards, and a Monobank jar CTA button.
- **D-15:** Monobank jar link **opens in a new tab** — user retains the confirmation page.
- **D-16:** **Visa/Mastercard-only notice** appears in two places: (1) subtle note near the tier cards before registration, and (2) on/near the Monobank CTA button in the confirmation panel.

### Frontend Form Activation
- **D-17:** Preview state is removed — form is always live once Phase 2 code ships. No feature flag, no date-based toggle.
- **D-18:** **Custom validation logic** in the component — no external form library (react-hook-form, zod, etc.).
- **D-19:** Validation errors displayed in **both** places: error summary at top of form + inline error text under each invalid field.
- **D-20:** Backend also validates (server-side) and returns structured validation errors. Frontend displays backend errors using the same inline + summary pattern.

### CORS
- **D-21:** CORS allows requests from `european-resolve.org` and `localhost` (for dev). Configurable via environment variable.

### Claude's Discretion
- Hono middleware setup (CORS, JSON parsing, error handling)
- Exact Dockerfile configuration (base image, build steps)
- GitHub Actions workflow structure (jobs, steps)
- Google Sheets API client setup and row-append logic
- Validation rules for each field (email format, required fields, etc.)
- Error response shape (`ApiResponse<T>` envelope or similar)
- Confirmation panel component structure and styling

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Deployment Reference (only-facts patterns)
- `/Users/serhiy/dev/github/ziohimself/only-facts/.github/workflows/ci.yml` — GitHub Actions CI/CD with WIF auth, Artifact Registry push (adapt for Cloud Run instead of GKE)
- `/Users/serhiy/dev/github/ziohimself/only-facts/packages/engine/Dockerfile` — multi-stage Node.js Dockerfile pattern
- `/Users/serhiy/dev/github/ziohimself/only-facts/packages/engine/src/config/index.ts` — typed config from env vars pattern
- `/Users/serhiy/dev/github/ziohimself/only-facts/packages/engine/src/utils/errors.ts` — AppError class pattern
- `/Users/serhiy/dev/github/ziohimself/only-facts/packages/engine/src/routes/health.ts` — health check endpoint pattern

### Project Architecture
- `.planning/PROJECT.md` — project overview, constraints, tier structure, donation model
- `.planning/REQUIREMENTS.md` — v1 requirements (Phase 2: REGA-06, REGA-07, REGA-08, API-01, API-02, DESX-05)
- `.planning/ROADMAP.md` — Phase 2 success criteria (7 items)

### Phase 1 Context
- `.planning/phases/01-static-event-pages/01-CONTEXT.md` — Phase 1 decisions (form preview state, UA tokens, etc.)

### Existing Frontend Code (to be activated)
- `src/components/ui/RegistrationForm.tsx` — current preview form (disabled fields, "coming soon" banner to be removed)
- `src/components/ui/TierCard.tsx` — tier selection cards (need to communicate selected tier to form)
- `src/components/ui/TierGrid.tsx` — tier grid layout
- `src/data/event.ts` — tier definitions (id, price, causeFee, logisticsFee, rewards)
- `src/app/events/2026-run-for-ukraine/register/page.tsx` — register page layout

</canonical_refs>

<code_context>
## Existing Code Insights

### Registration Form (Preview State)
- `RegistrationForm.tsx` renders all form fields (name, email, phone, t-shirt, language, country) with `aria-disabled="true"`, `readOnly`, `tabIndex={-1}`
- GDPR consent and comms opt-in checkboxes exist but are disabled
- Submit button says "Continue to payment →" and is disabled
- Total shows "€—" (placeholder)
- Banner at top: "Registration opens soon. This is a preview..."

### Tier Data
- `src/data/event.ts` exports `tiers` array with `Tier` type: `id`, `name`, `price`, `causeFee`, `logisticsFee`, `rewards`, `highlighted`
- Three tiers: supporter (€35), champion (€75), patron (€150)
- `TierCard` renders individual cards; `TierGrid` wraps them

### Phase 2 Activation Changes Needed
- Remove `readOnly`, `aria-disabled`, `tabIndex={-1}` from form fields
- Remove preview banner
- Add `'use client'` directive (form needs state + submission)
- Add tier selection state (flow from TierCard click → form)
- Add form state management, validation, submission to backend
- Replace submit button with active "Continue to payment →"
- Add confirmation panel component (shown after successful registration)
- Add Visa/Mastercard notice near tiers

</code_context>

<specifics>
## Specific Ideas

- Tier selection: clicking a TierCard sets the selected tier, scrolls to the registration form, and populates the total. Tier cards get a selected state (border highlight or check mark).
- Confirmation panel replaces the entire form section — a success state with a check icon, participant ID prominently displayed, and a clear "Proceed to Monobank" CTA button.
- Error summary at top of form uses the existing design token `--color-red` (or similar) for error styling.
- Monobank CTA button should be visually distinct — possibly using `--color-ua-yellow` to signal "external action" and differentiate from the registration submit button.

</specifics>

<deferred>
## Deferred Ideas

- **Protected edit page** — Allow participants to edit their registration via a URL with password query param. Deferred; for now, participants contact the team to make changes.
- **International card testing** — Verify non-Ukrainian Visa/Mastercard works with the Monobank jar before launch. Manual test, not a platform feature.
- **Registration close date** — Auto-disable registration after a cutoff date. Not needed for Phase 2 (manual control via code deploy is sufficient).
- **Email confirmation** — Sending confirmation emails is Phase 4 scope. Phase 2 only has on-page confirmation.

</deferred>

---

*Phase: 2-Backend API & Registration*
*Context gathered: 2026-07-28*
