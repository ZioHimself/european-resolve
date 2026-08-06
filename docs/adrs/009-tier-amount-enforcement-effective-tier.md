# ADR-009: Tier Amount Enforcement and Effective-Tier Rewards

**Status:** Accepted
**Date:** 2026-08-06
**Supersedes (partially):** Phase 6 decisions D-08, D-10, D-11, D-16 (amount/rewards policy only). Phase 6 auto-detection, amount capture, and pre-fill remain in force.
**Implementation phase:** 06.1 — Tier amount enforcement & effective-tier policy

## Problem

Registration lets donors pick a tier, then pay via the embedded WhyDonate widget. The widget amount field is editable. Without enforcement:

- A donor can pay less than their selected tier and still receive that tier's rewards (current behaviour after `0671c77`).
- Rewards can exceed money received; fulfilment and fairness break down.
- Phase 6 originally chose amount-based effective tiers (upgrade/downgrade), then `0671c77` reversed that without a durable decision record.

We need a policy that: blocks casual underpayment, assigns rewards from observed payment only, supports additive tiers and overpay upgrades, and fits the two-email model (registration intent, payment confirmation).

## Options Considered

1. **Honour registered tier regardless** — record actual `paid_amount` but keep selected-tier rewards. Simple, donor-friendly; violates the rule that underpayers must not receive selected-tier benefits.

2. **Downgrade/upgrade effective tier on confirm only** — `getEffectiveTier(observedAmount)` at `confirm-payment`; no widget gate. Authoritative and fair; underpayment still processes through Stripe before consequences are visible.

3. **Block confirm-payment if under tier minimum** — reject API when `amount < registeredTierPrice`. Strong rule; payment may already be taken; poor UX without refund integration.

4. **WhyDonate `min_donation_amount` config** — platform minimum via WhyDonate dashboard. Native validation; one global floor, not per selected tier.

5. **Step 1 client gate + backend effective tier (recommended)** — block widget advance to step 2 when `amount < selectedTier.price`; on successful payment, backend computes effective tier and cumulative rewards from observed amount; payment email is authoritative.

6. **Top-up flow as primary UX** — detect underpay after payment, prompt second donation via same widget. Necessary as fallback if blocking fails; too late and confusing as the main prevention.

7. **Separate WhyDonate widget or shortcode for top-up** — not required; same embed handles any payment amount.

## Decision

**Option 5: Step 1 client gate + backend effective tier on confirm.**

Same WhyDonate widget and event shortcode. No second embed.

### Client (Step 1 — Amount)

- Before WhyDonate advances from step 1 to step 2, require `amount >= selectedTier.price`.
- Allow `amount > selectedTier.price` (additive tiers; overpay may reach the next threshold).
- Hook the open shadow DOM: `other-amount-number-{shortcode}-1`, step-one next button, optionally wrap native `validateTotalAmount()`.
- Pre-fill or suggest the selected tier price as the default minimum (revises Phase 6 D-16 for registration flows).

### Backend (`confirm-payment`)

- Record `paid_amount` only when observed (never backfill from registered tier price; see `cf29b61`).
- Compute `effectiveTier = getEffectiveTier(observedAmount)` using five thresholds: €10 / €15 / €30 / €60 / €100.
- Return **cumulative rewards** for all tiers up to and including the effective tier (additive model).
- Registration row keeps the **selected tier** as intent; effective tier drives rewards and payment email only.
- If amount is unknown: mark paid if appropriate, leave amount blank, skip payment-receipt email, ops reconcile (existing rule). This applies when the client cannot report an observed amount — not the normal same-tab iDEAL/PayPal path (see below).

### Redirect payments (iDEAL, PayPal)

Same-tab checkout redirects are covered without guessing:

1. **Before redirect** — `WhyDonateWidget` persists the step-1 amount to `sessionStorage` (`r4u:donation-amount`) on input/change; `createOrder()` sends the same value from `other-amount-number-{id}`.
2. **On return** — `parseWhyDonatePaymentReturn()` reads the stash when `redirect_status=succeeded` and passes it to `confirm-payment`.

Amount is unknown only when `sessionStorage` is empty or unavailable — typically **cross-device** payment (e.g. QR on a phone while registration ran on another device) or storage blocked/cleared. Inline card payments read the amount live at step 4 instead; the stash is a backup.

### Communications

| Event | Email | Tier/rewards shown |
|-------|-------|-------------------|
| Registration submit | Registration confirmation | Selected tier as **target**; payment ask |
| Payment confirm (amount known) | Payment confirmation | **Effective tier** + cumulative rewards |
| Payment confirm (amount unknown) | None (automated) | Manual follow-up |

### Explicitly out of scope for 06.1

- Unique participant counting (`getProgress` dedup by email).
- Top-up flow as primary UX (fallback only if blocking is bypassed).
- Stripe iframe or step 3 validation (amount locked at order creation).

## Rationale

- **Blocking at step 1** eliminates most underpayment before money moves; best UX among enforceable options.
- **Backend effective tier** is the authoritative boundary: client gates are not a security control (devtools can bypass).
- **Observed amount only** aligns with the never-assume-amount principle from `cf29b61` and supports honest progress totals.
- **Additive tiers + overpay** — paying enough for a higher threshold earns that tier's cumulative benefits; donors may decline items operationally.
- **Same widget** — each payment is a new WhyDonate order; top-up or retry uses the same embed and shortcode.
- **Two emails** — registration does not promise final rewards; payment email reflects what was actually paid for.

Phase 6 auto-detection (`MutationObserver` on step four, amount read from shadow DOM, pre-fill) is unchanged.

## Consequences

### Positive

- Underpayers cannot reach payment without lowering tier selection or meeting the minimum (when gate is implemented consistently).
- Rewards match money received; payment email is a single source of truth.
- Overpay upgrades are supported without a separate product flow.
- Phase 6.1 has a documented policy baseline; supersedes ambiguous `changes.md` tier-standing wording for new work.

### Negative / risks

- Shadow DOM hooks break if WhyDonate changes step-one IDs or flow (`wp_styling.js` updates).
- Cross-device redirect returns or cleared `sessionStorage` may confirm without amount; manual reconciliation remains unless **Addendum A** (payment sessions + `orderId` lookup) is implemented. Same-tab iDEAL/PayPal returns use the pre-redirect stash.
- `getEffectiveTier` and cumulative reward merge are not in the codebase today; must be restored/implemented.
- Registration copy and locale strings must stop implying selected-tier rewards are final before payment.

### Follow-up (separate decisions)

- Unique participant count: distinct emails with paid status, not raw row count.
- Top-up linking if a payment slips through the gate: same token, supplementary row, cumulative tier (Phase 06.1+ or backlog).
- Cross-device redirect recovery — see **Addendum A** below.

## References

- `.planning/phases/06-whydonate-widget-auto-detection-remove-manual-confirmation-b/06-CONTEXT.md` — original Phase 6 amount policy (partially superseded)
- `.planning/phases/06.1-tier-amount-enforcement-effective-tier-policy/` — implementation phase
- `changes.md` — registration/payment architecture notes (`0671c77`, `cf29b61`)
- `src/components/ui/WhyDonateWidget.tsx` — shadow DOM integration point
- `src/lib/whydonatePaymentRedirect.ts` — redirect return amount stash
- `backend/src/services/sheets.ts` — `confirmPayment`, `getProgress`

---

## Addendum A: Cross-Device Redirect Recovery via Payment Sessions

**Status:** Accepted (implementation deferred — post-06.1)
**Date:** 2026-08-06

### Problem

Same-tab iDEAL/PayPal returns recover amount from `sessionStorage` (see main ADR). **Cross-device** returns do not:

- `sessionStorage` and WhyDonate `localStorage` are device-local.
- WhyDonate sets `return_url` to `origin + pathname` only — query params such as `?token=` are stripped before redirect (`wp_styling.js` `buildFlocalData()`).
- A phone landing on `/register?redirect_status=succeeded` with no `token` and no local stash cannot call `confirm-payment` with context today (`RegisterClient` shows a generic thank-you).

Mirroring all browser storage to Sheets is unnecessary. The gap is **linking the return URL to a registration + observed amount**.

### Options Considered

1. **Do nothing** — manual ops reconciliation for cross-device payments. Simple; poor donor UX; amount often unknown.

2. **Mirror all localStorage/sessionStorage to Sheets** — maximal fidelity; redundant (registration row already has token, email, tier); harder to maintain as WhyDonate keys change.

3. **Minimal server-side payment session + `orderId` lookup (recommended)** — before redirect, persist `{ payment_token, amount, email, names }`; before navigate away, link WhyDonate `order_id`; on return any device, recover by `orderId` in URL.

4. **Preserve `token` in `return_url`** — would fix lookup without a new sheet; requires changing WhyDonate `return_url` behaviour we do not control (widget strips query params deliberately).

5. **Backend WhyDonate order status API** — call `donation/order/status/?order_id=` for authoritative amount when `orderId` is present; complements option 3; does not replace the need to map `orderId` → `payment_token`.

6. **Email-only lookup on orphan return** — "enter your registration email"; works without `orderId`; ambiguous if multiple pending rows; extra UX step.

### Decision

**Option 3, with option 5 as optional hardening.** Implementation deferred until after Phase 06.1.

Add a **Payment Sessions** tab in Google Sheets (or equivalent backend store). Do not clone full localStorage.

#### Session record (minimal)

| Field | Purpose |
|-------|---------|
| `payment_token` | Link to Registrations row |
| `amount_eur` | Observed in widget before redirect |
| `email`, `first_name`, `last_name` | Confirm + emails (already known from registration) |
| `whydonate_order_id` | Cross-device lookup key (set when order is created) |
| `created_at`, `expires_at` | TTL (e.g. 24h) and GDPR cleanup |
| `status` | `pending_redirect` → `consumed` / `expired` |

#### Flow

1. **Before checkout redirect (device A)** — `POST /api/register/payment-session` with `{ token, amount, email, firstName, lastName }` after amount is final for this attempt.
2. **When WhyDonate creates an order (device A, before `window.location.replace`)** — widget layer reads `order_id` from WhyDonate's pre-redirect storage or intercepts `createOrder` response; `PATCH` session with `whydonate_order_id`.
3. **On return (any device)** — if URL has `orderId` + `redirect_status=succeeded`, `GET /api/register/payment-session?orderId=…` → recover `token` + `amount` → `confirm-payment` with effective tier.
4. **Optional** — backend verifies amount via WhyDonate order status API instead of trusting only the stashed figure.

Same WhyDonate widget and shortcode. No second embed.

### Rationale

- Cross-device identity must come from the **return URL** or a **server-side key**, not browser storage.
- `orderId` is the only practical cross-device key WhyDonate/Stripe already propagate; WhyDonate widget already reads `params.get("orderId")` on return.
- Registration data (`payment_token`, email) already lives in Sheets — the session row adds **pre-redirect amount** and **`orderId` ↔ token** mapping.
- Storing before redirect preserves the "observed amount only" rule without guessing after the fact.
- Minimal fields reduce GDPR surface; TTL + delete-on-confirm limits retention.

### Still not covered (even with addendum)

| Case | Mitigation |
|------|------------|
| Return URL has no `orderId` | Email + token entry fallback; or investigate fixing `return_url` with WhyDonate |
| Session never written (tab closed early) | Generic thank-you + ops; same as today |
| Payment started without registration context | Out of scope — separate orphan-donation path |

### Consequences

- New API routes and Sheets tab; widget hook to capture `order_id` before redirect (fragile if WhyDonate internals change).
- Cross-device confirm becomes automatable when `orderId` is present — removes most orphan-return cases.
- Does not replace step-1 amount blocking (Addendum A is recovery, not prevention).

### Implementation phase

Backlog / **06.2** (or later). Not part of Phase 06.1 scope in the main ADR body.
