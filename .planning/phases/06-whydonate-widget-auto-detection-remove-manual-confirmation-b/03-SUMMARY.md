---
phase: "6"
plan: "03"
subsystem: frontend
tags: [ux, auto-confirm, overlay, session-detection]
requires: [payment-detection-hook, donor-prefill, confirm-payment-amount]
provides: [auto-confirm-ux, verifying-overlay, interrupted-session-notice]
affects: [ConfirmationPanel, FundraiserConfirmation]
tech-stack:
  added: []
  patterns: [css-spinner, widget-collapse, session-detection]
key-files:
  created: []
  modified:
    - src/components/ui/ConfirmationPanel.tsx
    - src/components/ui/ConfirmationPanel.module.css
    - src/components/ui/FundraiserConfirmation.tsx
    - src/components/ui/FundraiserConfirmation.module.css
key-decisions:
  - Manual button hidden when auto-detection active, shown only on fallback
  - Confirmed state shows effective tier/rewards from API, not original registration
  - Widget collapses after confirmation with "Need your invoice?" expand trigger
  - Interrupted session auto-dismisses after 10 minutes (widget recovery window)
requirements-completed: [REGA-06]
duration: "~10 min"
completed: "2026-07-31"
---

# Phase 6 Plan 03: Frontend: Auto-Confirm UX in Confirmation Panels Summary

Replaced manual "I've completed my donation" button in both Track A (ConfirmationPanel) and Track B (FundraiserConfirmation) with auto-detection driven by WhyDonateWidget callbacks. Added verifying overlay, effective tier display, widget collapse, fallback button, and interrupted session notice.

## Tasks Completed: 4/4

1. **Rewire ConfirmationPanel** — Wired onPaymentSuccess for auto-confirm with amount, onDetectionFailed for fallback, donorInfo for pre-fill. Manual button hidden unless detection fails. Confirmed state shows effective tier/rewards from API
2. **Rewire FundraiserConfirmation** — Applied same pattern with RegistrationData.email optional field for backward compat
3. **Verifying overlay and collapse styles** — CSS-only spinner with --color-ua-blue, semi-transparent overlay, widget collapse with max-height transition, expand trigger for invoice access. Respects prefers-reduced-motion
4. **Interrupted session detection** — Detects stale sessionStorage registration + no orderId URL param, shows amber informational notice with contact info, auto-dismisses after 10 minutes

## Deviations from Plan

None — plan executed as written.

## Self-Check: PASSED
- `npm run build` succeeds (static export, 18 pages)
- `npx tsc --noEmit` passes
- Zero matches for "nudW7" in src/
- Both panels have auto-confirm, fallback, overlay, collapse, and session detection
