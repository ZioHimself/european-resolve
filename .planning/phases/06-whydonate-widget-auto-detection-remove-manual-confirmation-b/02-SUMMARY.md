---
phase: "6"
plan: "02"
subsystem: frontend
tags: [widget, payment-detection, shadow-dom]
requires: [confirm-payment-amount, register-email]
provides: [payment-detection-hook, donor-prefill, env-shortcode]
affects: [WhyDonateWidget, ConfirmationPanel, FundraiserConfirmation, FundraiserPage]
tech-stack:
  added: []
  patterns: [mutation-observer, shadow-dom-access, env-config]
key-files:
  created: []
  modified:
    - src/components/ui/WhyDonateWidget.tsx
    - src/components/ui/ConfirmationPanel.tsx
    - src/components/ui/FundraiserConfirmation.tsx
    - src/components/ui/FundraiserPage.tsx
key-decisions:
  - Shadow root polling at 100ms intervals, max 30 attempts (3s)
  - Widget ID derived as ${shortcode}-1 (single widget per page)
  - Amount read from other-amount-number-${id} input (base amount, not including tip)
  - Name splitting via first-token/remaining-tokens for pre-fill
requirements-completed: [REGA-06]
duration: "~6 min"
completed: "2026-07-31"
---

# Phase 6 Plan 02: Frontend: WhyDonate Widget Payment Detection Hook & Pre-Fill Summary

Enhanced WhyDonateWidget with MutationObserver-based payment detection on Shadow DOM, donor field pre-fill from registration data, and parameterized shortcode via env config.

## Tasks Completed: 3/3

1. **Parameterize shortcode** — Replaced all hardcoded "nudW7" in ConfirmationPanel, FundraiserConfirmation, and FundraiserPage with `NEXT_PUBLIC_WHYDONATE_SHORTCODE` env var
2. **Payment detection** — Added MutationObserver watching shadow root for step-four-container visibility, with initial check for redirect-return case, shadow root polling for async script load, and onDetectionFailed fallback
3. **Donor pre-fill** — Pre-fills donor-fname, donor-lname, donor-email inputs from registration data with input event dispatch for floating label CSS

## Deviations from Plan

- Also updated FundraiserPage.tsx shortcode (not mentioned in plan but had same hardcoded value)
- Implemented tasks 02.2 and 02.3 together in a single file update since they share the shadow root access logic

## Self-Check: PASSED
- `npx tsc --noEmit` passes
- Zero matches for "nudW7" in src/
- WhyDonateWidget has onPaymentSuccess, onDetectionFailed, donorInfo props
- MutationObserver created on shadowRoot with correct config
