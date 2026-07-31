---
phase: "6"
plan_id: "02"
title: "Frontend: WhyDonate Widget Payment Detection Hook & Pre-Fill"
objective: "Add MutationObserver-based payment detection to WhyDonateWidget, pre-fill donor fields from registration data, and parameterize the shortcode via env config"
wave: 2
depends_on: ["01"]
files_modified:
  - "src/components/ui/WhyDonateWidget.tsx"
  - "src/components/ui/WhyDonateWidget.module.css"
autonomous: true
requirements_addressed: [REGA-06]
---

# Plan 02: Frontend: WhyDonate Widget Payment Detection Hook & Pre-Fill

## Objective

Enhance the WhyDonateWidget component with three capabilities: (1) a MutationObserver that watches the widget's open Shadow DOM for payment success (step-four-container becoming visible), reading the actual donated amount; (2) pre-filling donor fields (first name, last name, email) from registration data; (3) using `NEXT_PUBLIC_WHYDONATE_SHORTCODE` env var instead of hardcoded shortcode. The component exposes an `onPaymentSuccess(amount: number)` callback and an `onDetectionFailed()` callback for the parent to wire into the confirm flow.

## Tasks

<task id="02.1">
<title>Parameterize WhyDonate shortcode via env config</title>

<read_first>
- `src/components/ui/WhyDonateWidget.tsx` (current component — hardcoded shortcode usage)
- `src/components/ui/ConfirmationPanel.tsx` (line 121 — `shortcode="nudW7"` hardcoded)
- `src/components/ui/FundraiserConfirmation.tsx` (line 175 — `shortcode="nudW7"` hardcoded)
</read_first>

<action>
The `WhyDonateWidget` already accepts `shortcode` as a prop. The issue is the callers: `ConfirmationPanel.tsx` (line 121) and `FundraiserConfirmation.tsx` (line 175) hardcode `shortcode="nudW7"`.

1. In `ConfirmationPanel.tsx`, replace `shortcode="nudW7"` with `shortcode={process.env.NEXT_PUBLIC_WHYDONATE_SHORTCODE ?? ""}`
2. In `FundraiserConfirmation.tsx`, replace `shortcode="nudW7"` with `shortcode={process.env.NEXT_PUBLIC_WHYDONATE_SHORTCODE ?? ""}`

The env var `NEXT_PUBLIC_WHYDONATE_SHORTCODE` is already defined in the project (per RESEARCH.md). This makes the shortcode configurable per campaign without code changes.
</action>

<acceptance_criteria>
- `ConfirmationPanel.tsx` does not contain the string `"nudW7"`
- `FundraiserConfirmation.tsx` does not contain the string `"nudW7"`
- Both files reference `process.env.NEXT_PUBLIC_WHYDONATE_SHORTCODE`
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="02.2">
<title>Add payment detection via MutationObserver on Shadow DOM</title>

<read_first>
- `src/components/ui/WhyDonateWidget.tsx` (current component structure)
- `.planning/phases/06-whydonate-widget-auto-detection-remove-manual-confirmation-b/06-RESEARCH.md` (detection signals, widget architecture, DOM element IDs)
</read_first>

<action>
Add new props to `WhyDonateWidgetProps`:
- `onPaymentSuccess?: (amount: number) => void` — called when step-four-container becomes visible
- `onDetectionFailed?: () => void` — called if shadow root is inaccessible (fallback trigger)

Add a `useEffect` that:
1. Waits for the widget host element (`widget-here-${shortcode}`) to have a shadow root. Use a polling interval (100ms, max 30 attempts = 3 seconds) since the widget script loads asynchronously.
2. Once the shadow root is available, derives the widget ID as `${shortcode}-1` (single widget per page).
3. Checks immediately if `step-four-container-${id}` is already visible (handles page reload after redirect payment where `restorePaymentState()` already ran).
4. Creates a `MutationObserver` on the shadow root with `{ childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] }`.
5. In the observer callback: checks if `step-four-container-${id}` exists and has `style.display !== 'none'`. If so, reads the amount from `other-amount-number-${id}` input value, disconnects the observer, and calls `onPaymentSuccess(amount)`.
6. If shadow root is never found after polling attempts, calls `onDetectionFailed()`.
7. Cleanup: disconnect observer on unmount.

The observer fires for both inline Stripe payment and redirect-based payment (iDEAL, Bancontact) since both paths call `setDonationStep(id, 4)` which shows step-four-container.
</action>

<acceptance_criteria>
- `WhyDonateWidgetProps` has `onPaymentSuccess?: (amount: number) => void`
- `WhyDonateWidgetProps` has `onDetectionFailed?: () => void`
- Component contains a `MutationObserver` created on `shadowRoot`
- Observer watches for `step-four-container-${id}` visibility
- Amount is read from `other-amount-number-${id}` input element
- Observer is disconnected on payment success and on component unmount
- Polling exists for shadow root availability (handles async script load)
- `onDetectionFailed` is called if shadow root is not found after polling
</acceptance_criteria>
</task>

<task id="02.3">
<title>Pre-fill widget donor fields from registration data</title>

<read_first>
- `src/components/ui/WhyDonateWidget.tsx` (after task 02.2)
- `.planning/phases/06-whydonate-widget-auto-detection-remove-manual-confirmation-b/06-RESEARCH.md` (Pre-Fill section — field IDs: donor-fname-{id}, donor-lname-{id}, donor-email-{id})
</read_first>

<action>
Add new optional prop to `WhyDonateWidgetProps`:
- `donorInfo?: { fullName: string; email: string }` — registration data for pre-fill

In the same `useEffect` that sets up the MutationObserver (or a separate effect that fires once the shadow root is found), after the shadow root is available:

1. Derive `id = ${shortcode}-1`
2. Split `donorInfo.fullName` into first/last: first token = first name, remaining tokens joined = last name. Handle single-name gracefully (put it in first name, leave last empty).
3. Set values on shadow DOM inputs:
   - `donor-fname-${id}` → first name
   - `donor-lname-${id}` → last name
   - `donor-email-${id}` → email
4. Dispatch `new Event("input", { bubbles: true })` on each field to trigger the widget's floating label CSS (`:placeholder-shown` transition).
5. Do NOT auto-advance past step 2 — just pre-fill, let user review (D-15).
6. Do NOT pre-select the donation amount in the widget (D-16).

Pre-fill should only run once (guard with a ref). If `donorInfo` is undefined, skip entirely.
</action>

<acceptance_criteria>
- `WhyDonateWidgetProps` has `donorInfo?: { fullName: string; email: string }`
- When `donorInfo` is provided, the shadow DOM inputs `donor-fname-{id}`, `donor-lname-{id}`, `donor-email-{id}` receive values
- Each input gets an `input` event dispatched after value is set
- Pre-fill runs exactly once (guarded by ref)
- Name split: `"Jean-Pierre Van Damme"` → first=`"Jean-Pierre"`, last=`"Van Damme"`
- When `donorInfo` is undefined, no pre-fill occurs
</acceptance_criteria>
</task>

## Verification

```bash
npm run build
# Confirm static export succeeds with the widget changes

npx tsc --noEmit
# No type errors

grep -rn "nudW7" src/
# Expected: zero matches (shortcode fully parameterized)
```

## must_haves

- MutationObserver detects step-four-container visibility as payment success signal (RESEARCH primary signal)
- Actual donated amount is read from widget DOM (other-amount-number input)
- Shadow root polling handles async widget script loading
- onDetectionFailed callback enables fallback to manual button (D-04)
- Donor fields pre-filled from registration data (D-14)
- User reviews pre-filled fields before proceeding — no auto-advance (D-15)
- Donation amount NOT pre-selected in widget (D-16)
- Shortcode comes from env config, not hardcoded (D-07 from ROADMAP success criteria 7)
