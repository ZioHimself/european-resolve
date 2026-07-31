# Phase 6: WhyDonate Widget Auto-Detection - Context

**Gathered:** 2026-07-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the manual "I've completed my donation" honour-system button with automatic payment detection by observing the WhyDonate widget's open Shadow DOM. When payment succeeds (step-four-container becomes visible), auto-confirm via the existing backend endpoint, capture the actual donated amount, pre-fill donor fields from registration data, and dynamically assign rewards based on the real amount donated. Includes refactoring tier/rewards to a single data source.

</domain>

<decisions>
## Implementation Decisions

### Auto-Confirm Transition UX
- **D-01:** When MutationObserver detects payment success (step-four-container visible), show a brief "Verifying payment..." overlay while the `POST /api/register/confirm-payment` API call runs. Only flip to the green checkmark "Payment received" state after the API confirms success.
- **D-02:** If the confirm API fails, show an error in the overlay — do not silently swallow it.
- **D-03:** After confirmation, the WhyDonate widget collapses below the success panel (hidden by default). Users can expand it if they want to access WhyDonate's invoice/receipt step.

### Fallback Strategy
- **D-04:** Show the manual "I've completed my donation" button ONLY if auto-detection fails at initialization (shadow root inaccessible, MutationObserver can't attach). If detection is working, trust it indefinitely — no timeout.
- **D-05:** Redirect-based payments (iDEAL, Bancontact) are handled identically — the widget's `restorePaymentState()` triggers the same step-four transition on page reload, and our observer catches it.
- **D-06:** Interrupted session detection — if sessionStorage registration token exists but the widget loads at step 1 (no `?orderId=` in URL, suggesting a stale session), show a notice: "It looks like your session was interrupted. If you've already completed your payment, please contact us at info@european-resolve.org with your payment confirmation and we'll update your registration." The widget still loads normally for retry.
- **D-07:** Within 10 minutes of payment initiation, page refresh auto-resolves via the widget's own localStorage-based recovery (`redirect_id` TTL). After 10 minutes, the interrupted session notice kicks in.

### Amount & Rewards Policy
- **D-08:** Accept any donation amount. The tier selected during registration is a suggestion/guideline, not a lock.
- **D-09:** Rewards are dynamically determined by the ACTUAL donated amount, not the originally selected tier:
  - Donated ≥ €95 → Patron rewards
  - Donated ≥ €35 → Champion rewards
  - Donated ≥ €10 → Supporter rewards
- **D-10:** Overpay upgrades effective tier (registered Champion €35, donated €95 → gets Patron rewards).
- **D-11:** Underpay downgrades effective tier (registered Patron €95, donated €10 → gets Supporter rewards).
- **D-12:** The effective tier (based on actual amount) flows consistently through: confirmation UI, confirmation email, and Sheets record.
- **D-13:** Refactor tier/rewards definitions into a single data source (one place defines tier thresholds, names, and reward lists). Both frontend and backend derive from this.

### Pre-Fill Behaviour
- **D-14:** Pre-fill the widget's donor fields (first name, last name, email) from registration data. Split `fullName` into first/last name parts.
- **D-15:** Do NOT auto-advance past the widget's Details step (step 2). Let the user review pre-filled fields and proceed manually. They may want to donate anonymously or change details.
- **D-16:** Do NOT pre-select the donation amount in the widget. Leave it open for the user to choose freely. The tier amount is shown in our UI copy above the widget as a suggestion.

### Backend Changes
- **D-17:** Add `email` to the `RegisterResponse` so the frontend has it for pre-fill.
- **D-18:** `POST /api/register/confirm-payment` accepts an optional `amount` field. If provided, it determines the effective tier and rewards. If absent (backward compat), fall back to the tier price from registration.
- **D-19:** `confirm-payment` response returns the effective tier and rewards (recalculated from actual amount), not the originally registered tier.

### Claude's Discretion
- MutationObserver implementation details (debouncing, cleanup timing)
- Exact "Verifying payment..." overlay visual design (spinner style, positioning)
- Widget collapse/expand mechanism (accordion, details/summary, custom)
- How to structure the single tier/rewards data source (shared TypeScript module, or backend-authoritative with frontend consuming API)
- Interrupted session notice exact styling and positioning
- Name splitting heuristic for pre-fill (first space, last space, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Research (Widget DOM Investigation)
- `.planning/phases/06-whydonate-widget-auto-detection-remove-manual-confirmation-b/RESEARCH.md` — Complete widget DOM reverse-engineering: shadow root structure, step IDs, state keys, MutationObserver strategy, pre-fill approach, localStorage signals, risks

### Phase 02.1 Context (WhyDonate Integration Decisions)
- `.planning/phases/02.1-replace-monobank-jar-with-whydonate/02.1-CONTEXT.md` — Original WhyDonate integration decisions (D-01 through D-14), widget embed model, payment token flow

### Frontend Components (to be modified)
- `src/components/ui/WhyDonateWidget.tsx` — Current widget embed component
- `src/components/ui/ConfirmationPanel.tsx` — Current confirmation panel with manual button
- `src/components/ui/FundraiserConfirmation.tsx` — Track B confirmation (same pattern)
- `src/components/ui/registerTypes.ts` — `RegisterResponse` type (add `email`)

### Backend (to be modified)
- `backend/src/routes/confirm-payment.ts` — Payment confirmation endpoint (add `amount` field)
- `backend/src/routes/register.ts` — Registration endpoint (add `email` to response)
- `backend/src/services/sheets.ts` — `confirmPayment()` method (accept amount, compute effective tier)

### Project Context
- `.planning/REQUIREMENTS.md` — REGA-06 (payment via WhyDonate widget)
- `.planning/PROJECT.md` — project constraints, no payment processing

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WhyDonateWidget.tsx`: Already loads script/CSS and creates the widget container. Extend with MutationObserver hook and pre-fill logic.
- `ConfirmationPanel.tsx`: Has `handleConfirm()` function that calls the API — reuse for auto-confirm, just trigger it programmatically.
- `SheetsService.getTierPrice()`: Tier price lookup — refactor into shared tier/rewards data source.
- Existing `sessionStorage` persistence pattern (`r4u:registration`) — use for interrupted session detection.

### Established Patterns
- `'use client'` components for interactive behaviour — both ConfirmationPanel and WhyDonateWidget already are client components.
- CSS Modules with camelCase class names — for the "Verifying..." overlay and collapsed widget wrapper.
- Fire-and-forget pattern NOT appropriate here — auto-confirm must await the API response before transitioning UI.
- Error handling: try/catch with user-visible error messages in panel.

### Integration Points
- Shadow DOM access: `document.getElementById('widget-here-{shortcode}').shadowRoot`
- Widget unique ID derived as `${shortcode}-1` for single widget per page
- DOM elements inside shadow root: `step-four-container-{id}`, `other-amount-number-{id}`, `donor-fname-{id}`, `donor-lname-{id}`, `donor-email-{id}`
- `process.env.NEXT_PUBLIC_WHYDONATE_SHORTCODE` — env var for campaign shortcode (parameterized, not hardcoded)

</code_context>

<specifics>
## Specific Ideas

- The "Verifying payment..." state should feel intentional and trustworthy — not like a glitch. Brief loading spinner + text.
- The collapsed widget should be accessible via a subtle "View receipt" or "Need your invoice?" link — not a prominent element.
- The interrupted session notice should be helpful and non-alarming — informational tone, not error tone.
- Tier/rewards single source: consider a shared `tiers.ts` that defines thresholds, names, and reward arrays. Both the tier cards UI and the backend confirmation logic read from it (or the backend re-exports it via API).

</specifics>

<deferred>
## Deferred Ideas

- **WhyDonate webhook/Zapier reconciliation** — server-side verification of payments as a secondary check. Not needed for v1 but could catch edge cases the honour system misses.
- **Amount pre-selection via widget config** — WhyDonate may add data attributes or URL params to pre-select amounts in future. Monitor for this.
- **Post-payment redirect callback** (D-03 from Phase 02.1) — was planned but never implemented. Auto-detection supersedes this approach.

</deferred>

---

*Phase: 6-WhyDonate Widget Auto-Detection*
*Context gathered: 2026-07-31*
