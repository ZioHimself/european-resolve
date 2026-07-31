---
phase: "6"
plan_id: "03"
title: "Frontend: Auto-Confirm UX in Confirmation Panels"
objective: "Rewire ConfirmationPanel and FundraiserConfirmation to use auto-detection instead of manual button — with verifying overlay, effective tier display, widget collapse, fallback button, and interrupted session notice"
wave: 2
depends_on: ["01"]
files_modified:
  - "src/components/ui/ConfirmationPanel.tsx"
  - "src/components/ui/ConfirmationPanel.module.css"
  - "src/components/ui/FundraiserConfirmation.tsx"
  - "src/components/ui/FundraiserConfirmation.module.css"
autonomous: true
requirements_addressed: [REGA-06]
---

# Plan 03: Frontend: Auto-Confirm UX in Confirmation Panels

## Objective

Replace the manual "I've completed my donation" honour-system button in both ConfirmationPanel (Track A) and FundraiserConfirmation (Track B) with auto-detection driven by the WhyDonateWidget's `onPaymentSuccess` callback. When payment is detected, show a "Verifying payment..." overlay while calling the confirm-payment API with the actual amount, then display the confirmed state with effective tier and rewards. If auto-detection cannot initialize, fall back to the manual button. Handle interrupted sessions gracefully.

## Tasks

<task id="03.1">
<title>Rewire ConfirmationPanel to auto-confirm on payment detection</title>

<read_first>
- `src/components/ui/ConfirmationPanel.tsx` (full file — current manual confirm flow)
- `src/components/ui/ConfirmationPanel.module.css` (current styles)
- `src/components/ui/WhyDonateWidget.tsx` (after Plan 02 — onPaymentSuccess, onDetectionFailed, donorInfo props)
- `src/components/ui/registerTypes.ts` (RegisterResponse with email field, after Plan 01)
</read_first>

<action>
Restructure the donation section of ConfirmationPanel:

1. **State additions:** Add `detectionActive: boolean` (starts `true`), `verifying: boolean`, `effectiveTierName: string | null`, `effectiveRewards: string[] | null`.

2. **Wire WhyDonateWidget callbacks:**
   - Pass `onPaymentSuccess` callback to WhyDonateWidget. When called with `amount`:
     - Set `verifying = true`
     - Call `POST /api/register/confirm-payment` with `{ token: result.paymentToken, amount }`
     - On success: set `confirmed = true`, read `effectiveTierName` and `rewards` from API response, call `onPaymentConfirmed?.()`
     - On error: set error message, set `verifying = false`
   - Pass `onDetectionFailed` callback. When called: set `detectionActive = false` (shows fallback manual button)
   - Pass `donorInfo={{ fullName: result.fullName, email: result.email }}` for pre-fill

3. **Update confirm-payment API call** in `handleConfirm()` (the existing manual confirm function): include `amount: undefined` in the body so it works as fallback with backward-compatible behavior.

4. **Remove the manual confirm button from the default render.** Instead:
   - If `detectionActive` is true and not `verifying`: show nothing below the widget (auto-detection is silently watching)
   - If `verifying` is true: show "Verifying payment..." overlay (task 03.3)
   - If `detectionActive` is false (fallback): show the original manual "I've completed my donation" button

5. **Confirmed state:** When showing the confirmed panel, display the effective tier name and rewards (from API response) instead of the originally registered tier. This handles overpay/underpay scenarios (D-10, D-11, D-12).

6. **Use env shortcode:** Replace hardcoded `shortcode="nudW7"` with `shortcode={process.env.NEXT_PUBLIC_WHYDONATE_SHORTCODE ?? ""}` (if not already done by Plan 02 task 02.1).
</action>

<acceptance_criteria>
- `ConfirmationPanel` passes `onPaymentSuccess`, `onDetectionFailed`, `donorInfo` props to `WhyDonateWidget`
- When `onPaymentSuccess` fires, the confirm-payment API is called with `{ token, amount }`
- Manual confirm button is hidden when detection is active
- Manual confirm button appears when `onDetectionFailed` fires
- Confirmed state shows effective tier name and rewards from API response
- API errors are displayed to the user (D-02)
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="03.2">
<title>Rewire FundraiserConfirmation to auto-confirm on payment detection</title>

<read_first>
- `src/components/ui/FundraiserConfirmation.tsx` (full file — Track B confirmation with manual button)
- `src/components/ui/FundraiserConfirmation.module.css` (current styles)
- `src/components/ui/ConfirmationPanel.tsx` (after task 03.1 — reference pattern)
</read_first>

<action>
Apply the same auto-detection pattern from task 03.1 to FundraiserConfirmation:

1. Add `detectionActive`, `verifying`, `effectiveTierName`, `effectiveRewards` state variables
2. Wire `onPaymentSuccess`, `onDetectionFailed`, `donorInfo` to the WhyDonateWidget instance
3. The `donorInfo` for Track B comes from `registration` prop: `donorInfo={{ fullName: registration.fullName, email: registration.email }}` (only when `registration` is defined)
4. Replace manual confirm button logic with the same pattern: hidden when detection active, shown on fallback
5. Update `handleConfirmPayment()` to include `amount` in the API call body
6. Show effective tier/rewards in confirmed state
7. Use env shortcode (if not already done by Plan 02 task 02.1)

Note: FundraiserConfirmation's registration data comes from a different interface (`RegistrationData` defined locally). Add `email?: string` to this local interface to receive it from the parent component. When `email` is absent (backward compat), skip pre-fill.
</action>

<acceptance_criteria>
- `FundraiserConfirmation` passes `onPaymentSuccess`, `onDetectionFailed`, `donorInfo` props to `WhyDonateWidget`
- Manual confirm button hidden when detection active, shown on fallback
- Confirmed state shows effective tier/rewards from API response
- `RegistrationData` interface includes optional `email` field
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="03.3">
<title>Add "Verifying payment..." overlay and widget collapse styles</title>

<read_first>
- `src/components/ui/ConfirmationPanel.module.css` (existing styles)
- `src/components/ui/FundraiserConfirmation.module.css` (existing styles)
- `src/styles/tokens.css` (design tokens — colors, spacing, typography)
</read_first>

<action>
Add CSS classes to both `ConfirmationPanel.module.css` and `FundraiserConfirmation.module.css`:

1. **`.verifyingOverlay`** — positioned over the widget container area. Semi-transparent background (`var(--color-background)` at 90% opacity), centered content, z-index above widget. Contains a spinner and "Verifying payment..." text.

2. **`.verifyingSpinner`** — CSS-only spinner animation (rotating border, using `--color-ua-blue`). Use `@keyframes spin { to { transform: rotate(360deg) } }`. Respect `prefers-reduced-motion` (disable animation).

3. **`.verifyingText`** — text below spinner, `var(--text-sm)`, `var(--color-text-secondary)`.

4. **`.widgetCollapsed`** — applied to the widget container after confirmation. Sets `max-height: 0; overflow: hidden; transition: max-height 0.3s ease`. Respects `prefers-reduced-motion` (no transition).

5. **`.widgetExpandTrigger`** — subtle link below the collapsed widget: "Need your invoice?" Uses `var(--text-xs)`, `var(--color-text-secondary)`. On click, toggles the widget container to `max-height: 600px`.

In the component JSX (both panels):
- When `verifying` is true: render the overlay div over the widget container
- After `confirmed` is true: add `.widgetCollapsed` class to widget container, show the expand trigger below it (D-03)
</action>

<acceptance_criteria>
- `ConfirmationPanel.module.css` contains `.verifyingOverlay`, `.verifyingSpinner`, `.verifyingText` classes
- `FundraiserConfirmation.module.css` contains the same overlay classes
- Both CSS files contain `.widgetCollapsed` and `.widgetExpandTrigger` classes
- Spinner animation uses `--color-ua-blue` token
- `prefers-reduced-motion` media query disables spinner animation and collapse transition
- Widget is hidden (collapsed) after confirmation with an expand trigger (D-03)
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="03.4">
<title>Add interrupted session detection and notice</title>

<read_first>
- `src/components/ui/ConfirmationPanel.tsx` (after task 03.1)
- `.planning/phases/06-whydonate-widget-auto-detection-remove-manual-confirmation-b/06-CONTEXT.md` (D-06, D-07 — interrupted session logic)
</read_first>

<action>
Add interrupted session detection to ConfirmationPanel (and mirror in FundraiserConfirmation):

1. On component mount, check if `sessionStorage.getItem("r4u:registration")` exists (existing persistence pattern) AND the current URL does NOT contain `?orderId=` parameter:
   - If both conditions met: the user has a registration token but the widget loaded fresh (no redirect return) — this may indicate an interrupted payment session
   - Set `interruptedSession = true` state

2. When `interruptedSession` is true, render an informational notice above the widget:
   - Styling: informational tone (not error), uses `var(--color-amber-20)` background, `var(--color-text-primary)` text
   - Text: "It looks like your session was interrupted. If you've already completed your payment, please contact us at info@european-resolve.org with your payment confirmation and we'll update your registration."
   - The widget still loads normally below for retry

3. The notice should NOT show if the URL has `?orderId=` (redirect return from payment provider — widget will auto-restore via `restorePaymentState()`).

4. The notice auto-dismisses after 10 minutes (D-07) — within that window, the widget's own localStorage-based recovery handles redirect returns.

Add `.interruptedNotice` CSS class to both module CSS files.
</action>

<acceptance_criteria>
- When sessionStorage has `r4u:registration` and URL has no `?orderId=`, an informational notice is shown
- Notice text includes `info@european-resolve.org` contact
- Notice uses informational styling (amber background, not red/error)
- Notice does NOT appear when URL contains `?orderId=`
- Widget still renders below the notice (user can retry payment)
- `npm run build` succeeds
</acceptance_criteria>
</task>

## Verification

```bash
npm run build
# Static export succeeds

npx tsc --noEmit
# No type errors in frontend

grep -rn "nudW7" src/
# Expected: zero matches

grep -rn "handleConfirm\|onPaymentSuccess" src/components/ui/ConfirmationPanel.tsx
# Expected: both present — manual and auto paths
```

## must_haves

- Auto-confirm calls API with actual amount when widget payment detected (D-01)
- "Verifying payment..." overlay shown during API call (D-01)
- API errors shown in overlay, not silently swallowed (D-02)
- Widget collapses after confirmation with "Need your invoice?" expand trigger (D-03)
- Manual button shown ONLY when auto-detection fails to initialize (D-04)
- Redirect payments handled identically via same MutationObserver (D-05)
- Interrupted session notice shown when stale session detected (D-06)
- Effective tier/rewards displayed after confirmation (D-12)
- Both Track A (ConfirmationPanel) and Track B (FundraiserConfirmation) updated
