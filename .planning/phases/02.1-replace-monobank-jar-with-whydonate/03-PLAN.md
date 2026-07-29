---
phase: "02.1"
plan_id: "03"
title: "Frontend: WhyDonate widget and payment confirmation flow"
wave: 2
depends_on: ["01", "02"]
files_modified:
  - src/components/ui/ConfirmationPanel.tsx
  - src/components/ui/ConfirmationPanel.module.css
  - src/components/ui/RegisterClient.tsx
  - src/components/ui/RegisterClient.module.css
autonomous: true
requirements_addressed: []
---

# Plan 03: Frontend — WhyDonate Widget & Payment Confirmation Flow

<objective>
Replace the Monobank CTA button and Visa/Mastercard notices with a WhyDonate donation link/button in the confirmation panel. Handle payment redirect callback (URL query params) to confirm payment via backend and show "payment received" state.
</objective>

<must_haves>
- Monobank CTA button removed from ConfirmationPanel
- Visa/Mastercard-only notice removed from ConfirmationPanel and RegisterClient
- WhyDonate donation CTA shown after registration (link to WhyDonate campaign with amount)
- Payment confirmation flow: detect token+pid query params → call confirm-payment API → show confirmed state
- Graceful handling of stale/invalid tokens (show registration form normally)
</must_haves>

<tasks>

<task id="03.1">
<title>Replace Monobank CTA with WhyDonate in ConfirmationPanel</title>
<read_first>
- src/components/ui/ConfirmationPanel.tsx
- src/components/ui/ConfirmationPanel.module.css
- src/components/ui/registerTypes.ts
</read_first>
<action>
In `ConfirmationPanel.tsx`:
- Change the `ctaSection` conditional from `result.monobankJarUrl` to `result.whydonateWidgetUrl`
- Replace the `<a href={result.monobankJarUrl}>` link with an `<a href>` that constructs the WhyDonate URL with amount parameter: `${result.whydonateWidgetUrl}?amount=${result.amountEur}`
- Change link text from "Proceed to donate — Monobank" to "Complete your donation"
- Remove the `<p className={styles.visaNotice}>` paragraph entirely (WhyDonate supports many payment methods — no limitation notice needed)
- Keep `target="_blank"` and `rel="noopener noreferrer"` on the link

In `ConfirmationPanel.module.css`:
- Remove the `.visaNotice` class if it exists
- Keep other CTA section styles (they'll apply to the new link)
</action>
<acceptance_criteria>
- `ConfirmationPanel.tsx` does NOT contain "monobank", "Monobank", "monobankJarUrl", "Visa", "Mastercard", or "Bancontact"
- `ConfirmationPanel.tsx` renders `result.whydonateWidgetUrl` link with text "Complete your donation"
- Link href includes `?amount=${result.amountEur}` appended to the widget URL
- Visa notice paragraph is removed
- `npm run build` passes (no build errors)
</acceptance_criteria>
</task>

<task id="03.2">
<title>Remove Monobank payment notice from RegisterClient</title>
<read_first>
- src/components/ui/RegisterClient.tsx
- src/components/ui/RegisterClient.module.css
</read_first>
<action>
In `RegisterClient.tsx`:
- Remove the `<p className={styles.paymentNotice}>` paragraph that says "All tiers are paid via Monobank jar (Visa/Mastercard only)..."
- No replacement needed — WhyDonate supports many payment methods, so no limitation notice is required

In `RegisterClient.module.css`:
- Remove the `.paymentNotice` style rule if it exists (dead CSS)
</action>
<acceptance_criteria>
- `RegisterClient.tsx` does NOT contain "Monobank", "monobank", "Visa", "Mastercard", or "Bancontact"
- `RegisterClient.tsx` does NOT contain the `.paymentNotice` paragraph
- `RegisterClient.module.css` does NOT contain `.paymentNotice` (if it was defined there)
- `npm run build` passes
</acceptance_criteria>
</task>

<task id="03.3">
<title>Add payment confirmation state to RegisterClient</title>
<read_first>
- src/components/ui/RegisterClient.tsx
- src/components/ui/ConfirmationPanel.tsx
- src/components/ui/registerTypes.ts
</read_first>
<action>
In `RegisterClient.tsx`:
- Import `useSearchParams` from `next/navigation` (or use `window.location.search` since this is a static export — prefer URLSearchParams in a useEffect)
- Add state: `const [paymentConfirmed, setPaymentConfirmed] = useState(false)`
- Add state: `const [confirmError, setConfirmError] = useState<string | null>(null)`
- Add a `useEffect` that runs on mount:
  1. Read `token` and `pid` from URL search params
  2. If both present: call `POST /api/register/confirm-payment` with `{ token, participantId: pid }`
  3. On success (200, data.confirmed=true): set `paymentConfirmed` to true
  4. On failure: set `confirmError` to the error message (but don't block — show registration form normally)
  5. Clean up: remove query params from URL (use `window.history.replaceState` to clean the URL without reload)
- Add a payment-confirmed banner/section that shows when `paymentConfirmed` is true:
  - Green checkmark icon
  - "Payment received — thank you!" heading
  - "Your registration is now complete. You'll receive your race materials at the event."
  - Show below or instead of the confirmation panel

Use the backend URL from an env var: `process.env.NEXT_PUBLIC_API_URL` (already used for registration submission)
</action>
<acceptance_criteria>
- `RegisterClient.tsx` reads `token` and `pid` query params on mount
- If params present: calls `/api/register/confirm-payment` endpoint
- On success: renders a "Payment received" confirmation section
- On failure: gracefully degrades (shows form/normal state, no crash)
- URL is cleaned of token/pid params after processing
- `npm run build` passes
</acceptance_criteria>
</task>

<task id="03.4">
<title>Style payment confirmed state</title>
<read_first>
- src/components/ui/RegisterClient.module.css
- src/components/ui/ConfirmationPanel.module.css
</read_first>
<action>
In `RegisterClient.module.css` add styles for the payment-confirmed state:
- `.paymentConfirmed` — container with success styling: background using `--color-ua-blue` at 5% opacity, border with `--color-ua-blue`, padding `--space-6`, border-radius matching other panels
- `.paymentConfirmedIcon` — large green checkmark, using existing icon pattern from ConfirmationPanel
- `.paymentConfirmedHeading` — `--text-lg` font size, `--font-semibold`
- `.paymentConfirmedMessage` — `--text-sm`, `--color-text-secondary`

Match the existing design system tokens and patterns from ConfirmationPanel.module.css.
</action>
<acceptance_criteria>
- `.paymentConfirmed` class defined in `RegisterClient.module.css`
- Styles use project design tokens (--space-*, --text-*, --color-*, --font-*)
- Visual appearance is consistent with existing ConfirmationPanel success styling
- No hardcoded color values — all from CSS custom properties
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` exits 0 (static export succeeds)
- No references to "monobank" (case-insensitive) in src/components/ui/ directory
- ConfirmationPanel renders WhyDonate CTA with correct URL construction
- RegisterClient handles payment callback query params gracefully
</verification>
