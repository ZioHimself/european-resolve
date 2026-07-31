# Phase 6: WhyDonate Widget Auto-Detection - Research

**Researched:** 2026-07-31
**Domain:** WhyDonate widget Shadow DOM observation for payment auto-detection
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Show "Verifying payment..." overlay while confirm API runs; flip to confirmed only after API success
- D-02: Show error in overlay if confirm API fails — never silently swallow
- D-03: Widget collapses below success panel after confirmation; expandable for invoice/receipt
- D-04: Show manual button ONLY if auto-detection fails at init (shadow root inaccessible); no timeout fallback if detection is working
- D-05: Redirect payments (iDEAL, Bancontact) handled identically via widget's restorePaymentState()
- D-06: Interrupted session detection — stale session notice with contact info when no orderId in URL
- D-07: Within 10 min of payment initiation, widget's localStorage-based recovery handles redirect returns
- D-08: Accept any donation amount — tier is suggestion, not lock
- D-09: Effective tier from actual amount: ≥95→Patron, ≥35→Champion, ≥10→Supporter
- D-10: Overpay upgrades effective tier
- D-11: Underpay downgrades effective tier
- D-12: Effective tier flows through confirmation UI, email, and Sheets
- D-13: Refactor tier/rewards to single data source
- D-14: Pre-fill donor fields (first name, last name, email) from registration data
- D-15: Do NOT auto-advance past widget step 2 — let user review
- D-16: Do NOT pre-select donation amount in widget
- D-17: Add email to RegisterResponse
- D-18: confirm-payment accepts optional amount, falls back to tier price if absent
- D-19: confirm-payment response returns effective tier and rewards

### Claude's Discretion
- MutationObserver debouncing and cleanup timing
- "Verifying payment..." overlay visual design (spinner style, positioning)
- Widget collapse/expand mechanism
- Tier/rewards data source structure (shared TS module vs API)
- Interrupted session notice styling
- Name splitting heuristic for pre-fill

### Deferred Ideas (OUT OF SCOPE)
- WhyDonate webhook/Zapier reconciliation
- Amount pre-selection via widget config
- Post-payment redirect callback (superseded by auto-detection)
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Payment success detection | Browser/Client | — | MutationObserver on Shadow DOM runs entirely in-browser |
| Donor field pre-fill | Browser/Client | — | DOM manipulation of widget inputs in shadow root |
| Amount reading from widget | Browser/Client | — | Reading input values from shadow DOM |
| Payment confirmation API call | Browser/Client | API/Backend | Client initiates, backend validates and records |
| Effective tier calculation | API/Backend | — | Backend is authoritative for tier assignment |
| Amount recording in Sheets | API/Backend | — | Backend writes to Google Sheets |
| Email in registration response | API/Backend | — | Backend includes email in API response |
</architectural_responsibility_map>

<research_summary>
## Summary

Researched the WhyDonate donation widget (`wp_styling.js`, ~2.1MB, 4493 lines) by downloading and analyzing the actual production script from `https://plugin.whydonate.com/wp_styling.js`. The widget renders as a direct DOM element with an **open Shadow DOM** — not an iframe — giving full programmatic access to its internal state and DOM mutations.

The widget follows a 4-step donation flow (Amount → Details → Payment → Invoice). Payment success is signaled by `setDonationStep(id, 4)` which calls `toggleStepContainers()` to set `step-four-container-${id}.style.display = "block"`. This is detectable via a MutationObserver watching for style/attribute changes on the shadow root. Both inline Stripe payments and redirect-based payments (iDEAL, Bancontact via `restorePaymentState()`) trigger the same step-four transition.

**Primary recommendation:** Use a MutationObserver on the open shadow root watching for `step-four-container-${id}` becoming visible (`style.display` changing from `"none"` to `"block"`). Read the donated amount from `other-amount-number-${id}` input. Pre-fill donor fields via `donor-fname-${id}`, `donor-lname-${id}`, `donor-email-${id}` inputs. Fall back to manual button only if shadow root is inaccessible.
</research_summary>

<standard_stack>
## Standard Stack

No new libraries needed. This phase uses browser-native APIs only:

### Core
| API | Purpose | Why Standard |
|-----|---------|--------------|
| MutationObserver | Watch Shadow DOM for step-four-container visibility | Native browser API, no dependencies, precise DOM change detection |
| ShadowRoot | Access widget's open shadow DOM | Native browser API, widget uses `attachShadow({ mode: "open" })` |
| Event (input) | Trigger floating label CSS after pre-fill | Native event dispatching for React-style inputs |

### Supporting
| API | Purpose | When to Use |
|-----|---------|-------------|
| sessionStorage | Detect interrupted sessions (existing `r4u:registration` key) | On component mount for stale session check |
| URLSearchParams | Check for `?orderId=` (redirect return) | Disambiguate redirect-return from stale session |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MutationObserver | Polling interval on step-four-container | Polling wastes CPU, misses fast transitions, less reliable |
| Shadow DOM access | Monkey-patching `setDonationStep` | Fragile, breaks on widget updates, violates encapsulation |
| Reading DOM inputs | WhyDonate API/webhook | No webhook available; API doesn't expose per-widget payment status |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### System Architecture Diagram

```
User completes payment in WhyDonate widget
         │
         ▼
Widget calls stripe.confirmPayment() or restorePaymentState()
         │
         ▼
Widget calls setDonationStep(id, 4) internally
         │
         ▼
toggleStepContainers() sets step-four-container style.display = "block"
         │
         ▼
MutationObserver fires (watching shadow root for attribute/style changes)
         │
         ├── Read amount from other-amount-number-${id} input value
         │
         ▼
onPaymentSuccess(amount) callback → parent component
         │
         ▼
Parent shows "Verifying payment..." overlay
         │
         ▼
POST /api/register/confirm-payment { token, amount }
         │
         ├── Backend computes effective tier from amount
         ├── Records actual amount in Google Sheets
         │
         ▼
Response: { confirmed, effectiveTierId, effectiveTierName, rewards }
         │
         ▼
Parent shows confirmed state with effective tier/rewards
Widget collapses (expandable for invoice)
```

### Pattern 1: MutationObserver on Shadow Root
**What:** Observe the entire shadow DOM subtree for style/attribute changes, check for step-four-container visibility
**When to use:** Detecting payment completion without modifying widget code
**Key detail verified in script:** `toggleStepContainers()` sets `style.display` directly on each step container element. The observer needs `attributes: true, attributeFilter: ['style', 'class']` plus `childList: true, subtree: true` (step containers may be created dynamically during widget init).

### Pattern 2: Shadow Root Polling for Async Script Load
**What:** The widget script loads asynchronously. The shadow root isn't available immediately — poll until `host.shadowRoot` is non-null.
**When to use:** Component mounts before widget script finishes loading
**Verified:** Widget sets `dataset.initialized = "true"` on the host element after shadow root creation. An alternative to polling is observing this attribute on the host element.

### Pattern 3: Pre-Fill via Direct DOM Manipulation
**What:** Set `.value` on shadow DOM inputs and dispatch `input` event to trigger widget's internal state sync
**When to use:** Pre-filling donor fields from registration data
**Key detail:** Step 2 DOM is created at widget initialization (just hidden). Pre-fill can run as soon as shadow root is available.

### Anti-Patterns to Avoid
- **Timeout-based fallback when detection is working:** D-04 explicitly says no timeout — trust auto-detection indefinitely if it initialized successfully
- **Reading amount from localStorage `donation_info`:** This is written BEFORE payment completes — it's a pre-payment snapshot, not a success signal. Use `other-amount-number-${id}` input instead
- **Auto-advancing past step 2:** D-15 says let the user review pre-filled fields
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment detection | Custom polling or global variable watching | MutationObserver on shadow root | Observer is event-driven, polling wastes CPU and can miss fast transitions |
| Widget state reading | Monkey-patching WD_REGISTRY or `getWidgetDataValue` | Reading DOM input values directly | WD_REGISTRY is inside a closure (inaccessible); DOM inputs are the stable public surface |
| Redirect payment handling | Custom URL parameter watching | Widget's own `restorePaymentState()` + same observer | Widget already handles redirect returns and triggers the same step-four transition |
| Name splitting | Complex NLP for name parts | Simple `split(/\s+/)` with first-token/rest-tokens | Good enough for pre-fill; user can edit if wrong |

**Key insight:** The WhyDonate widget's DOM is the stable contract. Its internal state (`WD_REGISTRY`, `getWidgetDataValue`) is closure-scoped and inaccessible. All detection and data reading must go through DOM element IDs and attributes.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Observer Attaches After Widget Already at Step 4
**What goes wrong:** User completes payment during observer setup → step-four transition is missed
**Why it happens:** Race condition between widget init and observer attachment, especially on redirect returns where `restorePaymentState()` runs immediately
**How to avoid:** After attaching the observer, immediately check if step-four-container is already visible. This handles the case where the widget completed before observation started.
**Warning signs:** Redirect-return payments (iDEAL, Bancontact) never trigger auto-confirm

### Pitfall 2: Amount Read from Wrong Source
**What goes wrong:** Recorded amount includes tip or reads stale value
**Why it happens:** Widget has a tipping feature; `donation_info` localStorage is written BEFORE payment completes and may contain stale data
**How to avoid:** Read from `other-amount-number-${id}` input (the base amount input), not from localStorage or tip-related fields
**Warning signs:** Amounts in Sheets are consistently higher than expected (tip included)

### Pitfall 3: Input Event Not Dispatched After Pre-Fill
**What goes wrong:** Pre-filled values are visible but widget doesn't recognize them internally; floating labels overlap text
**Why it happens:** Setting `.value` programmatically doesn't trigger the widget's internal event handlers or CSS `:placeholder-shown` transitions
**How to avoid:** After setting each input's `.value`, dispatch `new Event("input", { bubbles: true })` so the widget's internal state and CSS update
**Warning signs:** Widget shows validation errors for "required" fields that visually have values; floating labels overlap input text

### Pitfall 4: Hardcoded Widget ID
**What goes wrong:** Detection works in test but not production
**Why it happens:** Widget ID is `${shortcode}-${index+1}` where shortcode changes per campaign
**How to avoid:** Derive all element IDs from the `shortcode` prop, never hardcode `nudW7-1`
**Warning signs:** `getElementById` returns null in production

### Pitfall 5: Shadow Root Closed in Future Widget Update
**What goes wrong:** `host.shadowRoot` returns null despite widget being initialized
**Why it happens:** WhyDonate could change from `mode: "open"` to `mode: "closed"` in a future update
**How to avoid:** If `shadowRoot` is null after polling, call `onDetectionFailed()` to show manual fallback button
**Warning signs:** Auto-detection silently stops working after a WhyDonate update
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from live widget script analysis (`wp_styling.js` fetched 2026-07-31):

### Payment Detection via MutationObserver
```typescript
// Verified: toggleStepContainers() sets style.display = "block"/"none"
// Verified: widget ID format is ${shortcode}-${index+1} (unique_id)
// Verified: shadow root created with attachShadow({ mode: "open" })
function observePaymentSuccess(
  shortcode: string,
  onSuccess: (amount: number) => void,
  onFailed: () => void,
): (() => void) | null {
  const host = document.getElementById(`widget-here-${shortcode}`);
  if (!host?.shadowRoot) {
    onFailed();
    return null;
  }

  const shadow = host.shadowRoot;
  const id = `${shortcode}-1`;

  // Check if already at step 4 (redirect return case)
  const stepFour = shadow.getElementById(`step-four-container-${id}`);
  if (stepFour && stepFour.style.display !== "none") {
    const amount = readAmount(shadow, id);
    onSuccess(amount);
    return () => {};
  }

  const observer = new MutationObserver(() => {
    const el = shadow.getElementById(`step-four-container-${id}`);
    if (el && el.style.display !== "none") {
      observer.disconnect();
      const amount = readAmount(shadow, id);
      onSuccess(amount);
    }
  });

  observer.observe(shadow, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });

  return () => observer.disconnect();
}

function readAmount(shadow: ShadowRoot, id: string): number {
  // Verified: other-amount-number-${id} always has the selected amount
  const input = shadow.getElementById(
    `other-amount-number-${id}`,
  ) as HTMLInputElement | null;
  return parseFloat(input?.value || "0");
}
```

### Donor Field Pre-Fill
```typescript
// Verified: donor-fname-${id}, donor-lname-${id}, donor-email-${id}
// Verified: fields exist in shadow DOM from widget init (step 2, hidden)
function prefillDonorFields(
  shadow: ShadowRoot,
  id: string,
  info: { fullName: string; email: string },
): void {
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
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}
```

### Shadow Root Polling
```typescript
// Verified: widget sets dataset.initialized = "true" after shadow root creation
function waitForShadowRoot(
  shortcode: string,
  callback: (shadow: ShadowRoot) => void,
  onTimeout: () => void,
  maxAttempts = 30,
  intervalMs = 100,
): void {
  let attempts = 0;
  const timer = setInterval(() => {
    const host = document.getElementById(`widget-here-${shortcode}`);
    if (host?.shadowRoot) {
      clearInterval(timer);
      callback(host.shadowRoot);
      return;
    }
    attempts++;
    if (attempts >= maxAttempts) {
      clearInterval(timer);
      onTimeout();
    }
  }, intervalMs);
}
```
</code_examples>

<open_questions>
## Open Questions

1. **Tip amount inclusion**
   - What we know: Widget has a tipping feature with a slider. The `other-amount-number-${id}` input shows the base donation amount.
   - What's unclear: Whether the tip amount is added to the base amount in the input or tracked separately.
   - Recommendation: Read `other-amount-number-${id}` as the base amount. If tip is tracked separately, the backend records only the base donation (consistent with tier threshold logic). Validate during implementation by testing with tips enabled.

2. **Widget version stability**
   - What we know: Current script at `https://plugin.whydonate.com/wp_styling.js` uses Tailwind v4.3.2, open Shadow DOM, and the exact element IDs documented here.
   - What's unclear: WhyDonate's update cadence and whether they version their widget URLs.
   - Recommendation: The fallback button (D-04) handles the case where the widget changes. Additionally, consider logging the widget script's hash on load to detect changes early.

3. **Multiple widgets per page**
   - What we know: Widget ID is `${shortcode}-${index+1}` where index is the position among `.widget-here` elements on the page. For a single widget, this is always `${shortcode}-1`.
   - What's unclear: Whether the app ever renders two WhyDonate widgets on the same page.
   - Recommendation: Hardcode `-1` suffix for now (single widget per page). If multi-widget is needed later, pass the index as a prop.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `https://plugin.whydonate.com/wp_styling.js` — Downloaded and analyzed 2026-07-31 (2,174,713 bytes, 4,493 lines). All element IDs, state keys, function names, and flow patterns verified directly against source code.

### Verified Claims
| Claim | Verification Method | Result |
|-------|-------------------|--------|
| Open Shadow DOM | `attachShadow({ mode: "open" })` in source | **Confirmed** |
| Widget ID format `${shortcode}-${index+1}` | `unique_id` assignment in source | **Confirmed** |
| Step containers `step-{one\|two\|three\|four}-container-${id}` | `toggleStepContainers()` function | **Confirmed** |
| Display toggling via `style.display = "block"/"none"` | `toggleStepContainers()` sets display directly | **Confirmed** |
| `other-amount-number-${id}` input for amount | Multiple references in source | **Confirmed** |
| `donor-fname-${id}`, `donor-lname-${id}`, `donor-email-${id}` | Field creation in source | **Confirmed** |
| `data-initialized` attribute on host | `dataset.initialized = "true"` in source | **Confirmed** |
| `WD_REGISTRY` Map (closure-scoped) | `getWidgetDataValue`/`updateWidgetKey` (143 refs) | **Confirmed** |
| Payment success: `setDonationStep(id, 4)` | Two call sites (inline + redirect) | **Confirmed** |
| `widget-payment-status-${id}` = `"success"` | Set before `setDonationStep(id, 4)` | **Confirmed** |
| `restorePaymentState()` for redirect returns | Checks `status === "paid"`, calls same step-4 | **Confirmed** |
| `donation_info_${id}_${shortcode}` localStorage | Written before `stripe.confirmPayment()` | **Confirmed** |
| `redirect_id` localStorage key | 11 references in source | **Confirmed** |
| `keep-stepper-visible-${id}` state key | 4 references in source | **Confirmed** |
| Green success message `wd:text-green-600` | Exact class string in source | **Confirmed** |
| `invoice-form-${id}` container | 3 references in source | **Confirmed** |
| Stripe EU key `pk_live_fP1JyZSzMvSvc7ZrjvLNPl5o` | Present in source | **Confirmed** |
| Tailwind CSS v4.3.2 | Version string in source | **Confirmed** |
| API endpoint `donation.whydonate.dev` | URL in source | **Confirmed** |
| `select-amount-${id}` radio for preset amounts | Present in source | **Confirmed** |
| `public-message-${id}` textarea | Present in source | **Confirmed** |
| `anonymous-toggle` checkbox | Present in source | **Confirmed** |

### Tertiary (LOW confidence — needs validation during implementation)
- Tip handling interaction with `other-amount-number` input — not fully traced through tipping code paths
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: WhyDonate donation widget (Shadow DOM, MutationObserver)
- Ecosystem: Browser-native APIs only (no new dependencies)
- Patterns: DOM observation, shadow root access, input pre-fill, async script loading
- Pitfalls: Race conditions, amount sources, event dispatching, widget updates

**Confidence breakdown:**
- Detection strategy: HIGH — verified every element ID and state transition against live script source
- Pre-fill approach: HIGH — verified donor field IDs and DOM creation timing
- Fallback strategy: HIGH — open shadow DOM mode confirmed, fallback path well-defined
- Amount reading: MEDIUM — base amount confirmed, tip interaction needs runtime validation
- Code examples: HIGH — all patterns derived from verified widget internals

**Research date:** 2026-07-31
**Valid until:** Check widget script hash before execution — WhyDonate may update without notice. Fallback button (D-04) handles breaking changes gracefully.
</metadata>

---

*Phase: 06-WhyDonate Widget Auto-Detection*
*Research completed: 2026-07-31*
*Ready for planning: yes*
