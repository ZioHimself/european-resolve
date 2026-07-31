# Phase 6: WhyDonate Widget Auto-Detection - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-31
**Phase:** 06-whydonate-widget-auto-detection-remove-manual-confirmation-b
**Areas discussed:** Auto-confirm UX, Fallback strategy, Amount mismatch, Pre-fill depth

---

## Auto-Confirm Transition UX

### Q1: Widget behaviour on payment detection

| Option | Description | Selected |
|--------|-------------|----------|
| Instant hide | Instantly hide widget, show confirmed state | |
| Brief verify | Brief "Verifying payment..." overlay (1-2s), then confirmed state | ✓ |
| Let finish | Let user complete WhyDonate's invoice step, then auto-confirm | |
| You decide | Claude's discretion | |

**User's choice:** Brief "Verifying payment..." overlay
**Notes:** Gives visual feedback that something is happening before the transition.

### Q2: Verifying state — real or cosmetic?

| Option | Description | Selected |
|--------|-------------|----------|
| Real wait | Wait for actual API response before green checkmark | ✓ |
| Optimistic | Show green checkmark immediately, fire API in background | |

**User's choice:** Wait for real API response
**Notes:** Handles API errors gracefully — no misleading success state.

### Q3: Widget visibility after confirmation

| Option | Description | Selected |
|--------|-------------|----------|
| Fully remove | Remove widget from DOM entirely | |
| Collapse below | Hide by default, expandable for receipt/invoice access | ✓ |

**User's choice:** Collapse below
**Notes:** Users may want access to WhyDonate's invoice/receipt functionality.

---

## Fallback Strategy

### Q1: When to show manual button

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate subtle | Always visible as small text link | |
| 60 seconds | Show after timeout | |
| Only on detection failure | If shadow root inaccessible or observer can't attach | ✓ |

**User's choice:** Only on detection failure
**Notes:** Trust auto-detection if it can be established. No arbitrary timeout.

### Q2: Redirect payment handling

| Option | Description | Selected |
|--------|-------------|----------|
| Observer handles it | Widget's restorePaymentState catches redirect returns identically | ✓ |
| Also check URL params | Proactively check ?orderId= before relying on widget | |

**User's choice:** Observer handles it
**Notes:** Same mechanism works for both inline and redirect payments.

### Q3: Session interrupted (user returns after closing browser)

| Option | Description | Selected |
|--------|-------------|----------|
| No special handling | Accept the gap, user can retry | |
| Check backend status | Call GET endpoint to check token status | |
| Show notice | Detect interrupted session, show contact info | ✓ |

**User's choice:** Custom — show informational notice suggesting they contact info@european-resolve.org with payment confirmation for manual resolution.
**Notes:** User explained that if WhyDonate can't detect the payment, we can't either. The notice is a graceful way to handle this edge case. Widget still loads normally for retry. Key insight: within 10-min TTL, widget's own localStorage recovery handles the case automatically. The notice only triggers for stale sessions beyond that window.

---

## Amount Mismatch Policy

### Q1: Underpayment handling

| Option | Description | Selected |
|--------|-------------|----------|
| Accept any | Record actual amount, any donation helps | |
| Record tier minimum | Record tier price regardless of actual | |
| Show warning | Warn but accept | |

**User's choice:** Custom — Accept any payment, but rewards must depend on actual donated amount. Consistent through UI and email. Tier/rewards data should be refactored to single source.
**Notes:** This expanded the scope to include dynamic rewards based on actual amount + data source refactoring.

### Q2: Include rewards refactor in Phase 6?

| Option | Description | Selected |
|--------|-------------|----------|
| Include in Phase 6 | Tightly coupled to amount capture | ✓ |
| Separate phase | Keep Phase 6 focused on detection only | |
| Minimal in Phase 6 | Backend returns effective tier, full refactor deferred | |

**User's choice:** Include in Phase 6

### Q3: Overpayment

| Option | Description | Selected |
|--------|-------------|----------|
| Upgrade tier | Donated more → get higher tier rewards | ✓ |
| Keep original | Honour their chosen tier regardless | |

**User's choice:** Upgrade effective tier

### Q4: Underpayment

| Option | Description | Selected |
|--------|-------------|----------|
| Downgrade tier | Donated less → get lower tier rewards | ✓ |
| Keep original minimum | Keep at least their originally chosen tier | |

**User's choice:** Downgrade to effective tier based on actual amount

---

## Pre-Fill Depth

### Q1: Auto-advance past step 2?

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-fill only | Populate fields, let user review and proceed | ✓ |
| Auto-advance | Programmatically skip to payment step | |

**User's choice:** Pre-fill only
**Notes:** User may want to change details or donate anonymously.

### Q2: Pre-select donation amount?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, pre-select tier amount | Start at the right default | |
| No, leave open | Let them choose freely | ✓ |

**User's choice:** No, leave amount open
**Notes:** The tier amount is shown in our UI copy above the widget as suggestion only.

---

## Claude's Discretion

- MutationObserver implementation details (debouncing, cleanup)
- "Verifying payment..." overlay visual design
- Widget collapse/expand mechanism
- Tier/rewards single data source structure
- Interrupted session notice styling
- Name splitting heuristic

## Deferred Ideas

- WhyDonate webhook/Zapier reconciliation for server-side payment verification
- Amount pre-selection via widget config (future WhyDonate feature)
- Post-payment redirect callback (D-03 from Phase 02.1 — superseded by auto-detection)
