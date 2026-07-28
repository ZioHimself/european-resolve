---
plan_id: "02"
title: "Frontend Activation: Interactive Registration with Confirmation"
phase: 2
wave: 2
depends_on: ["01"]
files_modified:
  - src/app/events/2026-run-for-ukraine/register/page.tsx
  - src/components/ui/RegisterClient.tsx
  - src/components/ui/RegisterClient.module.css
  - src/components/ui/TierCard.tsx
  - src/components/ui/TierCard.module.css
  - src/components/ui/TierGrid.tsx
  - src/components/ui/RegistrationForm.tsx
  - src/components/ui/RegistrationForm.module.css
  - src/components/ui/ConfirmationPanel.tsx
  - src/components/ui/ConfirmationPanel.module.css
autonomous: true
requirements_addressed: [REGA-06, REGA-07, DESX-05]
---

# Plan 02: Frontend Activation — Interactive Registration with Confirmation

<objective>
Transform the preview registration page into a fully interactive client-side experience: tier selection, form validation with dual error display, API submission, and inline confirmation panel with Monobank jar redirect.
</objective>

<must_haves>
- Tier cards are clickable, selected tier is visually highlighted and communicated to form
- Registration form is fully interactive (no disabled state, no preview banner)
- Custom client-side validation with error summary at top + inline per-field errors
- Form submits to backend API and handles success/error responses
- On success: inline confirmation panel replaces form (participant ID, tier, amount, rewards, Monobank CTA)
- Monobank CTA opens in new tab
- Visa/Mastercard notice appears near tier cards AND on confirmation panel CTA
- Backend validation errors display using same pattern as client-side errors

<truths>
- D-13: Inline confirmation (form replaced, no page redirect)
- D-14: Confirmation shows participant ID, name, tier, amount, rewards, Monobank CTA
- D-15: Monobank link opens in new tab
- D-16: Visa/Mastercard notice in two places (near tiers + on CTA)
- D-17: Preview state removed, form always live
- D-18: Custom validation, no form library
- D-19: Errors in both places (summary + inline)
- D-20: Backend errors displayed with same pattern
</truths>
</must_haves>

<tasks>

<task id="02.1">
<title>Create RegisterClient wrapper component</title>
<read_first>
- src/app/events/2026-run-for-ukraine/register/page.tsx (current page structure)
- src/components/ui/TierGrid.tsx (current static tier grid)
- src/components/ui/RegistrationForm.tsx (current preview form)
- src/data/event.ts (tier data, Tier type)
</read_first>
<action>
Create `src/components/ui/RegisterClient.tsx` with `'use client'` directive:

**State:** `selectedTierId: TierId | null`, `registrationResult: RegisterResponse | null`

**Renders:**
1. `<TierSelection>` — interactive tier cards (receives selectedTierId + onSelect callback)
2. Visa/Mastercard notice below tiers (subtle text using `--color-text-secondary`)
3. If no registrationResult: `<RegistrationForm>` (receives selectedTier prop)
4. If registrationResult: `<ConfirmationPanel>` (receives registration data)

**CSS Module:** `RegisterClient.module.css` with layout gap, Visa notice styling.

Update `register/page.tsx` to import `RegisterClient` instead of `TierGrid` + `RegistrationForm`. Page stays a server component (keeps metadata export). Render `<RegisterClient />` inside the sections div.
</action>
<acceptance_criteria>
- `RegisterClient.tsx` has `'use client'` directive
- Component manages `selectedTierId` state and `registrationResult` state
- `register/page.tsx` still exports `metadata` (server component)
- `register/page.tsx` renders `<RegisterClient />` instead of direct `<TierGrid />` + `<RegistrationForm />`
- `npm run typecheck` exits 0
- `npm run build` succeeds (static export)
</acceptance_criteria>
</task>

<task id="02.2">
<title>Make TierCard and TierGrid interactive</title>
<read_first>
- src/components/ui/TierCard.tsx (current disabled card)
- src/components/ui/TierCard.module.css (current styles)
- src/components/ui/TierGrid.tsx (current static grid)
- src/data/event.ts (Tier type)
</read_first>
<action>
**Modify `TierCard.tsx`:**
- Add props: `isSelected: boolean`, `onSelect: () => void`
- Remove `disabled` and `aria-disabled="true"` from button
- Button text: "Select" → onClick calls `onSelect`
- Add `styles.selected` class when `isSelected` is true
- Add `aria-pressed={isSelected}` to button for accessibility

**Modify `TierCard.module.css`:**
- Add `.selected` class: border color `var(--color-ua-blue)`, box-shadow or border-width increase
- Remove `cursor: not-allowed` from button, add `cursor: pointer`
- Selected button style: background `var(--color-ua-blue)`, color white

**Modify `TierGrid.tsx`:**
- Add props: `selectedTierId: TierId | null`, `onSelectTier: (id: TierId) => void`
- Pass `isSelected` and `onSelect` to each TierCard
- Remove `'use client'` from TierGrid — it receives callbacks from parent client component

Note: TierCard and TierGrid become presentational components that receive state from RegisterClient.
</action>
<acceptance_criteria>
- `TierCard` renders a clickable button (no disabled attributes)
- `TierCard` accepts `isSelected` prop and applies `.selected` CSS class
- `TierCard` accepts `onSelect` prop and calls it on button click
- `TierCard` button has `aria-pressed` attribute matching `isSelected`
- `TierGrid` accepts `selectedTierId` and `onSelectTier` props
- Clicking a tier card calls the parent's state setter
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="02.3">
<title>Rewrite RegistrationForm as interactive client component</title>
<read_first>
- src/components/ui/RegistrationForm.tsx (current preview form — full structure)
- src/components/ui/RegistrationForm.module.css (current styles)
- src/data/event.ts (Tier type for price display)
- .planning/phases/02-backend-api-registration/02-CONTEXT.md (D-18, D-19 validation)
- .planning/phases/02-backend-api-registration/02-RESEARCH.md (API contract, validation shape)
</read_first>
<action>
**Rewrite `RegistrationForm.tsx`** (no `'use client'` needed — it's rendered inside RegisterClient which is already a client component):

**Props:** `selectedTier: Tier | null`, `onSuccess: (result: RegisterResponse) => void`

**State:** form field values (controlled inputs), `errors: ValidationError[]`, `isSubmitting: boolean`

**Remove:**
- Preview banner
- All `aria-disabled`, `readOnly`, `tabIndex={-1}` attributes
- `pointer-events: none` from CSS
- `cursor: not-allowed` and `opacity: 0.5` from submit button CSS

**Add:**
- Controlled input state for all fields
- Submit handler with validation:
  - `fullName`: required
  - `email`: required + format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
  - `phone`: optional
  - `tshirtSize`: required (default from select is fine)
  - `language`: required (default from select is fine)
  - `country`: required
  - `gdprConsent`: must be checked
- Error display: error summary `<div>` before the form grid (lists all errors), inline error `<span>` under each field
- Submit button: disabled when `!selectedTier` or `isSubmitting`, text "Register — €{tier.price}" when tier selected
- On submit: POST to backend API URL (from env var `NEXT_PUBLIC_API_URL` or default), handle response
- On success: call `onSuccess(data)`
- On API validation error: set `errors` from response

**CSS updates to `RegistrationForm.module.css`:**
- Remove `pointer-events: none` from `.input`
- Add `.input` active state (remove background tint, add focus ring)
- Add `.error` class for field error text (red, small)
- Add `.errorSummary` class for top error block
- Add `.submitButton` enabled state (full opacity, cursor pointer, hover effect)
- Remove `cursor: not-allowed` and `opacity: 0.5` from `.submitButton`
</action>
<acceptance_criteria>
- No preview banner rendered
- No disabled/readonly/tabIndex attributes on any input
- Form fields are controlled inputs (value + onChange)
- Submit validates: missing fullName shows "Full name is required" error
- Submit validates: invalid email shows "Valid email address is required" error
- Submit validates: unchecked gdprConsent shows "GDPR consent is required to register" error
- Error summary renders above form grid when errors exist
- Inline error text appears below each invalid field
- Submit button shows tier price when tier is selected
- Submit button is disabled when no tier selected or when submitting
- Successful API response calls `onSuccess` callback
- API validation errors (400) are displayed using same error UI
- `npm run typecheck` exits 0
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="02.4">
<title>Create ConfirmationPanel component</title>
<read_first>
- src/components/ui/RegistrationForm.module.css (existing card pattern for consistent styling)
- src/data/event.ts (Tier type, tier rewards)
- .planning/phases/02-backend-api-registration/02-CONTEXT.md (D-13, D-14, D-15, D-16 confirmation spec)
- .planning/phases/02-backend-api-registration/02-RESEARCH.md (RegisterResponse shape)
</read_first>
<action>
Create `src/components/ui/ConfirmationPanel.tsx`:

**Props:** `result: RegisterResponse` (participantId, fullName, tierName, amountEur, rewards, monobankJarUrl)

**Renders:**
1. Success icon/checkmark
2. Heading: "Registration confirmed!"
3. Participant ID prominently: "Your ID: R4U-42"
4. Summary: name, tier name, amount in EUR
5. Rewards list for selected tier
6. Monobank CTA button: "Proceed to donate — Monobank" → opens `monobankJarUrl` in new tab (`target="_blank"`, `rel="noopener noreferrer"`)
7. Visa/Mastercard notice below CTA: "Monobank jar accepts Visa and Mastercard only. Bancontact and bank transfers are not supported."

Create `src/components/ui/ConfirmationPanel.module.css`:
- Card styling matching existing `.card` pattern (border, radius, padding)
- Participant ID: large font, bold, color `var(--color-ua-blue)`
- CTA button: background `var(--color-ua-yellow)`, color `var(--color-black)`, bold, large padding
- Visa notice: `var(--text-sm)`, `var(--color-text-secondary)`, margin-top
- Success checkmark: green or `var(--color-ua-blue)`
</action>
<acceptance_criteria>
- `ConfirmationPanel.tsx` exports named `ConfirmationPanel` component
- Renders participant ID prominently (R4U-{n} format)
- Renders tier name, amount in EUR, and rewards list
- Monobank CTA is an `<a>` with `target="_blank"` and `rel="noopener noreferrer"`
- Visa/Mastercard notice text is present below the CTA
- CSS uses existing design tokens (no raw color values)
- `npm run typecheck` exits 0
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="02.5">
<title>Add Visa/Mastercard notice near tier cards</title>
<read_first>
- src/components/ui/RegisterClient.tsx (wrapper that renders tiers + form)
- src/components/ui/RegisterClient.module.css (layout styles)
- .planning/phases/02-backend-api-registration/02-CONTEXT.md (D-16: notice in two places)
</read_first>
<action>
In `RegisterClient.tsx`, add a notice element between the TierGrid and the RegistrationForm:

Text: "All tiers are paid via Monobank jar (Visa/Mastercard only). Bancontact and bank transfers are not supported."

Style in `RegisterClient.module.css`:
- `.paymentNotice`: `font-size: var(--text-sm)`, `color: var(--color-text-secondary)`, `text-align: center`, subtle icon or info marker

This is the first instance of the D-16 notice. The second instance is in ConfirmationPanel (task 02.4).
</action>
<acceptance_criteria>
- Visa/Mastercard notice appears between tier cards and registration form
- Notice mentions "Visa/Mastercard only" and "Bancontact and bank transfers are not supported"
- Styled with secondary text color and small font
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="02.6">
<title>Add NEXT_PUBLIC_API_URL environment variable support</title>
<read_first>
- src/components/ui/RegistrationForm.tsx (form submission code)
- next.config.ts (current Next.js config)
</read_first>
<action>
The frontend needs to know where the backend API lives. Since this is a static export:

1. In `RegistrationForm.tsx`, the API URL is read from `process.env.NEXT_PUBLIC_API_URL` at build time. Default fallback: `http://localhost:8080` for development.
2. Create `.env.local.example` with: `NEXT_PUBLIC_API_URL=http://localhost:8080`
3. For production build, set `NEXT_PUBLIC_API_URL=https://run-for-ukraine-api-HASH.run.app` (or the actual Cloud Run URL)

No changes to `next.config.ts` needed — Next.js automatically inlines `NEXT_PUBLIC_*` vars at build time.
</action>
<acceptance_criteria>
- `RegistrationForm.tsx` references `process.env.NEXT_PUBLIC_API_URL` for API calls
- Fallback to `http://localhost:8080` when env var is not set
- `.env.local.example` file documents the variable
- `npm run build` succeeds without the env var set (uses fallback)
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run typecheck` exits 0 (all new components type-check)
- `npm run build` succeeds (static export with client components)
- Tier cards are clickable and show selected state
- Clicking a tier card updates the submit button to show the price
- Submitting with empty required fields shows validation errors (summary + inline)
- Submitting with valid data to running backend shows confirmation panel
- Confirmation panel displays participant ID, tier info, and Monobank CTA
- Monobank CTA link has `target="_blank"`
- Visa/Mastercard notice appears in two locations (near tiers + on confirmation CTA)
- No horizontal scroll at 320px viewport width
</verification>
