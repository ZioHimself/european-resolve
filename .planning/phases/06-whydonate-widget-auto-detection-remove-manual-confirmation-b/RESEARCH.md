# Research: WhyDonate Widget DOM Auto-Detection

**Date:** 2026-07-31
**Phase:** 6 — WhyDonate Widget Auto-Detection

---

## Key Finding

The WhyDonate widget (`wp_styling.js`) renders as a **direct DOM element with an open Shadow DOM** — NOT an iframe. This means full programmatic access to its internal state and DOM mutations from our page code.

## Parameterization

The widget shortcode (e.g. `nudW7` for the current test campaign) is configurable via `NEXT_PUBLIC_WHYDONATE_SHORTCODE` env var / the `shortcode` prop on `<WhyDonateWidget>`. All internal IDs derive from it:

- **Widget unique ID:** `${shortcode}-${index}` where index is 1-based per page (typically `${shortcode}-1` for a single widget)
- **DOM element IDs:** All suffixed with this unique ID, e.g. `step-four-container-${shortcode}-1`

Throughout this document, `{id}` refers to the widget unique ID (e.g. `nudW7-1` in test, different in production).

## Widget Architecture

### Initialization

```
var donationWidget = (function(exports) { ... })({});
```

- Self-contained IIFE, assigns to global `donationWidget`
- Scans for `.widget-here` elements and initializes each
- Widget ID: `${shortcode}-${index + 1}` — derived from shortcode + position on page
- Sets `data-initialized="true"` on the host element
- Creates an **open Shadow DOM** on the host (`#shadow-root (open)`)

### Internal State Store

- `WD_REGISTRY` — a `Map` inside the closure (NOT directly accessible from outside)
- State read: `getWidgetDataValue(id, key)` 
- State write: `updateWidgetKey(id, key, value)`
- State is NOT exposed via any public API or custom events

### 4-Step Donation Flow

| Step | Key | Label | Container ID |
|------|-----|-------|--------------|
| 1 | Amount | "Amount" | `step-one-container-{id}` |
| 2 | Details | "Details" | `step-two-container-{id}` |
| 3 | Payment | "Payment" | `step-three-container-{id}` |
| 4 | Invoice | "Invoice" | `step-four-container-{id}` |

Steps are tracked via: `current-step-{id}` in `WD_REGISTRY`

### Payment Success Path

On successful Stripe payment (`stripe.confirmPayment()` returns without error):

```javascript
updateWidgetKey(id, `widget-payment-status-{id}`, "success");
setDonationStep(id, 4);
```

On redirect-based success (page reload with `?orderId=`):

```javascript
// restorePaymentState() checks order status via API
if (status === "paid") {
  updateWidgetKey(id, `widget-payment-status-{id}`, "success");
  setDonationStep(id, 4);
  updateWidgetKey(id, `keep-stepper-visible-{id}`, false);
}
```

### Payment Failure Path

```javascript
updateWidgetKey(id, `widget-payment-status-{id}`, "failed");
// Shows error message, may reset to step 1
```

---

## Detection Signals (Ranked by Reliability)

### Signal 1: Step 4 Container Becomes Visible (PRIMARY)

When `setDonationStep(id, 4)` is called:
- `step-three-container-{id}` is hidden (animates out)
- `step-four-container-{id}` is shown (animates in)
- The stepper re-renders with step 4 active circle

**Detection:** MutationObserver on shadow root watching for `step-four-container-{id}` `style.display` changing from `"none"` to `"block"`.

### Signal 2: Green Success Message (CONFIRMATION)

After payment, the Invoice step shows:
```javascript
successMessage.innerText = _e("donation_success", languageCode);
successMessage.className = "wd:text-green-600 wd:text-center wd:mt-5 wd:text-[14px] wd:text-left";
```

**Detection:** MutationObserver looking for a new element with class containing `wd:text-green-600` inside `invoice-form-{id}`.

### Signal 3: Stepper Circle Changes (VISUAL)

Step 4 circle gets class `wd-step-circle-active` with the primary color. Previous steps get checkmark icons.

**Detection:** Query stepper DOM after mutation.

### Signal 4: localStorage (PRE-PAYMENT, for amount)

Before calling `stripe.confirmPayment()`:
```javascript
localStorage.setItem(`donation_info_{id}_{shortcode}`, JSON.stringify({
  "{id}": {
    widget_id: "{id}",
    order_id: "...",
    email: "...",
    firstname: "...",
    lastname: "...",
    is_anonymous: false,
    receive_email_updates: false,
    language_code: "en",
    message_donor: "...",
    expiry: timestamp,
    shortcode: "{shortcode}",
    data_used: false
  }
}));
```

**Note:** This is written BEFORE payment completes — not a success signal, but useful for donor info.

---

## Reading the Donated Amount

The amount is available from multiple sources inside the shadow root:

| Source | Element ID | Access |
|--------|-----------|--------|
| Custom amount input | `other-amount-number-{id}` | `.value` (string, e.g. "10") |
| Preset radio (if selected) | `input[name="select-amount-{id}"]:checked` | `.value` |
| Widget state (closure) | `selected-amount-{id}` key in WD_REGISTRY | NOT directly accessible |

**Best approach:** Read `other-amount-number-{id}` input value — the widget always populates this when an amount is selected (whether preset or custom).

---

## Recommended Implementation

### MutationObserver Strategy

```typescript
function observeWhyDonatePayment(shortcode: string, onSuccess: (amount: number) => void) {
  const widgetEl = document.getElementById(`widget-here-${shortcode}`);
  if (!widgetEl?.shadowRoot) return null;
  
  const shadow = widgetEl.shadowRoot;
  // Widget generates unique ID as `${shortcode}-${1-based-index}`
  // For a single widget per page, this is always `${shortcode}-1`
  const id = `${shortcode}-1`;
  
  const observer = new MutationObserver(() => {
    const stepFour = shadow.getElementById(`step-four-container-${id}`);
    if (stepFour && stepFour.style.display !== 'none') {
      // Payment succeeded — read amount
      const amountInput = shadow.getElementById(`other-amount-number-${id}`) as HTMLInputElement;
      const amount = parseFloat(amountInput?.value || '0');
      observer.disconnect();
      onSuccess(amount);
    }
  });

  observer.observe(shadow, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  return observer;
}
```

The `shortcode` is passed as a prop to `<WhyDonateWidget>` and should come from env config (`NEXT_PUBLIC_WHYDONATE_SHORTCODE`) so it can change per campaign without code changes.

### Fallback Strategy

- Start a timeout (e.g., 5 minutes) when widget loads
- If auto-detection hasn't fired by timeout, reveal the manual "I've completed my donation" button
- This handles edge cases: widget DOM changes, redirect payments, browser extensions blocking observation

### Redirect Payment Handling

For recurring donations (`ui_mode: "checkout"`), the widget does a full redirect to Stripe Checkout. On return:
- URL contains `?orderId=xxx`
- Widget calls `restorePaymentState()` which checks order status via API
- Same `setDonationStep(id, 4)` is called on success
- The MutationObserver handles this identically

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| WhyDonate changes widget DOM IDs | Detection breaks | Fallback button + version check via CSS file hash |
| Shadow DOM closed in future update | No access | Detect closed shadow root, show manual button |
| Widget re-renders destroy observer targets | Missed events | Use `subtree: true` on the shadow root itself |
| Amount mismatch (tip included) | Wrong amount recorded | Only read base amount from `other-amount-number`, not tip |
| Race condition: observer attaches after widget init | Missed step transition | Check step-four visibility immediately on attach |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ui/WhyDonateWidget.tsx` | Add MutationObserver hook, expose `onPaymentSuccess` callback, pre-fill donor fields |
| `src/components/ui/ConfirmationPanel.tsx` | Remove/hide manual button, auto-call `handleConfirm` on detection with amount |
| `src/components/ui/FundraiserConfirmation.tsx` | Same pattern for Track B |
| `src/components/ui/FundraiserPage.tsx` | Public fundraiser: no confirm needed (already none) |
| `src/components/ui/registerTypes.ts` | Add `email` to `RegisterResponse` |
| `backend/src/routes/register.ts` | Include `email` in registration API response payload |
| `backend/src/routes/confirm-payment.ts` | Accept optional `amount` field in request body |
| `backend/src/services/sheets.ts` | `confirmPayment()` takes optional `donatedAmount`, validates ≥ tier min |
| `backend/src/types.ts` | Update `ConfirmPaymentResponse` type if needed |

---

## Backend: confirm-payment Amount Gap

The current `POST /api/register/confirm-payment` endpoint:
- **Accepts:** `{ token: string }` — no amount field
- **Writes to Sheets (columns M–P):** `["", "paid", row[8], timestamp]`
- `row[8]` is the **tier price from registration** (€10/€35/€95), NOT the actual donated amount

This means if the user donates more (or less) than their tier in the widget, the recorded amount is wrong.

### Required Backend Change

```typescript
// Route: accept optional amount
const amount = typeof body.amount === "number" ? body.amount : undefined;
const result = await sheetsService.confirmPayment(token, amount);

// SheetsService: use provided amount if valid
async confirmPayment(token: string, donatedAmount?: number) {
  // ...find row...
  const tierPrice = Number(row[8]);
  // Use donated amount if provided and >= tier minimum; otherwise fall back to tier price
  const recordedAmount = (donatedAmount && donatedAmount >= tierPrice)
    ? donatedAmount
    : tierPrice;
  
  await this.sheets.spreadsheets.values.update({
    // ...
    requestBody: { values: [["", "paid", String(recordedAmount), new Date().toISOString()]] },
  });
}
```

### Validation Rule

- `amount >= tierPrice` → record `amount` (user donated more than minimum — great)
- `amount < tierPrice` or absent → record `tierPrice` (fallback to honour-system tier amount)

This keeps backward compatibility: old clients sending only `{ token }` still work.

---

## Widget Pre-Fill: Donor Details from Registration

### Opportunity

After registration, we already know the user's name and email. The WhyDonate widget's step-2 form (`donor-fname-{id}`, `donor-lname-{id}`, `donor-email-{id}`) can be pre-filled, removing friction and ensuring the WhyDonate donation record links back to the same person.

### Widget Fields (Step 2, inside shadow DOM)

| Input ID | Type | Required |
|----------|------|----------|
| `donor-fname-{id}` | `<input type="text">` | Yes |
| `donor-lname-{id}` | `<input type="text">` | Yes |
| `donor-email-{id}` | `<input type="text">` | Yes |
| `public-message-{id}` | `<textarea>` | No |
| `anonymous-toggle-{id}` | checkbox toggle | No |

### Data Source

Currently `RegisterResponse` contains `fullName` but NOT `email`. 

**Required change:** Add `email` to the registration API response so the frontend has both name and email available for pre-fill.

```typescript
// backend/src/routes/register.ts — add email to response
export interface RegisterResponse {
  participantId: string;
  fullName: string;
  email: string;          // ← ADD
  tierId: "supporter" | "champion" | "patron";
  tierName: string;
  participationType: ParticipationType;
  amountEur: number;
  rewards: string[];
  paymentToken: string;
}
```

### Pre-Fill Implementation

```typescript
function prefillWidgetDonorInfo(
  shadow: ShadowRoot,
  id: string,
  info: { fullName: string; email: string }
) {
  // Split fullName: "Jean-Pierre Van Damme" → first="Jean-Pierre", last="Van Damme"
  const parts = info.fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  const fields: [string, string][] = [
    [`donor-fname-${id}`, firstName],
    [`donor-lname-${id}`, lastName],
    [`donor-email-${id}`, info.email],
  ];

  for (const [fieldId, value] of fields) {
    const input = shadow.getElementById(fieldId) as HTMLInputElement | null;
    if (input) {
      input.value = value;
      // Trigger floating label CSS (:placeholder-shown transition)
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}
```

### Timing

Step 2's DOM is created at widget initialization (just hidden). Pre-fill can happen as soon as the shadow root is available — no need to wait for the user to navigate to step 2.

### UX Benefit

- User skips re-entering their name and email in the donation widget
- WhyDonate donation record links to the same email as registration
- User can still edit any pre-filled field before donating

---

## Current Shortcode

The test campaign shortcode is `nudW7` (env: `NEXT_PUBLIC_WHYDONATE_SHORTCODE`). This will change for the production campaign. All DOM observation logic must derive IDs from the shortcode prop, never hardcode it.

## Widget Script Reference

- **URL:** `https://plugin.whydonate.com/wp_styling.js`
- **Size:** ~2124 KB (4493 lines, minified IIFE)
- **CSS:** `https://plugin.whydonate.com/wdplugin-style.css`
- **Internal framework:** Tailwind CSS v4.3.2 (prefixed with `wd:`)
- **Payment provider:** Stripe (EU key: `pk_live_fP1JyZSzMvSvc7ZrjvLNPl5o`)
- **API endpoint:** `https://donation.whydonate.dev`
