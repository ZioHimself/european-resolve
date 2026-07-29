---
phase: "02.1"
plan_id: "04"
title: "Documentation: Update requirements and roadmap for WhyDonate"
wave: 3
depends_on: ["01", "02", "03"]
files_modified:
  - .planning/REQUIREMENTS.md
  - .planning/ROADMAP.md
autonomous: true
requirements_addressed: []
---

# Plan 04: Documentation — Update Requirements & Roadmap

<objective>
Update all planning documentation to reflect WhyDonate as the payment provider. Remove or modify Monobank-specific requirements, update Phase 3 success criteria, and clean up the out-of-scope table to reflect the new payment model.
</objective>

<must_haves>
- REGA-06 updated: "redirected to Monobank jar" → "pays via WhyDonate donation link"
- DESX-05 removed or reworded (WhyDonate supports many methods — no limitation to communicate)
- Phase 3 success criteria referencing "Monobank jar" updated to WhyDonate/Sheets
- Out of Scope table updated to remove Monobank-specific entries that are no longer relevant
- API-05, API-06, API-09 updated to reflect Sheets-based progress instead of Monobank polling
</must_haves>

<tasks>

<task id="04.1">
<title>Update REQUIREMENTS.md for WhyDonate</title>
<read_first>
- .planning/REQUIREMENTS.md
- .planning/phases/02.1-replace-monobank-jar-with-whydonate/02.1-CONTEXT.md
</read_first>
<action>
In `.planning/REQUIREMENTS.md`:

1. Update core value statement: "drive donations to the Monobank jar" → "drive donations via WhyDonate"

2. Update REGA-06: "User is redirected to Monobank jar after registration with clear messaging about payment method" → "User can complete payment via WhyDonate donation link after registration with payment confirmation flow"

3. Remove DESX-05 entirely ("Monobank payment limitation is clearly communicated before redirect") — no longer applicable since WhyDonate supports iDEAL, Bancontact, PayPal, Credit Card, etc.

4. Update PAGE-03: "Visitor can click 'Donate' which redirects to the Monobank jar with clear payment-method notice" → "Visitor can click 'Donate' which opens WhyDonate donation page"

5. Update DASH-01: "from Monobank jar balance, converted to EUR" → "from Google Sheets confirmed payments in EUR"

6. Update API-05: "cached jar balance + participant count" → "sums confirmed payments from Sheets + participant count"

7. Update API-06: "Backend polls Monobank jar balance every 60s and caches result" → "Backend reads confirmed payment totals from Google Sheets (no external polling needed)"

8. Update API-09: "Backend logs jar-balance readings with timestamps for audit trail" → "Payment confirmations are timestamped in Google Sheets (built-in audit trail)"

9. Update DASH-04: "link to beneficiary and Monobank jar" → "link to beneficiary and WhyDonate campaign"

10. Update Out of Scope table:
    - Remove "Platform payment processing | Monobank jar model — platform never touches money" → replace with "Platform payment processing | WhyDonate handles payments — platform confirms via redirect token"
    - Remove "Bancontact / bank transfer | Limited to what Monobank jar supports" (no longer out of scope — WhyDonate supports both)
    - Remove "Per-donation notifications | Payment data doesn't flow back from jar" → update to "Per-donation notifications | WhyDonate does not provide webhook callbacks in current integration"
    - Remove "Donor-level data export | Donor identities sit with Monobank/charity" → update to "Donor-level data export | Donor identities managed by WhyDonate"
</action>
<acceptance_criteria>
- REQUIREMENTS.md does NOT contain "Monobank" (case-sensitive search for "Monobank" returns 0)
- REGA-06 text references WhyDonate donation link
- DESX-05 line is removed
- API-05, API-06, API-09, DASH-01, DASH-04, PAGE-03 are updated
- Out of Scope table reflects WhyDonate model
- Traceability table: DESX-05 row removed, total requirement count reduced from 37 to 36
</acceptance_criteria>
</task>

<task id="04.2">
<title>Update ROADMAP.md for WhyDonate</title>
<read_first>
- .planning/ROADMAP.md
</read_first>
<action>
In `.planning/ROADMAP.md`:

1. Phase 2 success criteria #4: "user sees Monobank jar redirect button with Visa/Mastercard-only notice" → "user sees WhyDonate donation link to complete payment"

2. Phase 2 success criteria #5 (CORS): no change needed

3. Phase 3 success criteria #4: "'Donate' CTA on fundraiser pages redirects to Monobank jar" → "'Donate' CTA on fundraiser pages opens WhyDonate donation page"

4. Phase 3 success criteria #7: "Progress dashboard shows jar balance (UAH→EUR)" → "Progress dashboard shows confirmed payment totals from Sheets (EUR)"

5. Phase 3 success criteria #8: "Backend polls Monobank jar every 60s and logs readings with timestamps" → "Backend reads confirmed payments from Google Sheets"

6. Phase 02.1 entry: Update goal from "[Urgent work - to be planned]" to "Replace all Monobank jar references with WhyDonate — embed WhyDonate donation link in post-registration flow, add secure payment token confirmation, update Google Sheets as progress data source."

7. Phase 02.1: Update "Plans: 0 plans" → "Plans: 4 plans" and replace TBD plan list with actual plan titles.

8. Phase 2 requirements: Remove DESX-05 from the requirements list (it's been eliminated).
</action>
<acceptance_criteria>
- ROADMAP.md does NOT contain "Monobank" (case-sensitive search returns 0)
- Phase 02.1 goal is filled in (not "[Urgent work - to be planned]")
- Phase 02.1 shows "Plans: 4 plans"
- Phase 3 success criteria reference WhyDonate and Sheets instead of jar
- Phase 2 requirements line does not include DESX-05
</acceptance_criteria>
</task>

</tasks>

<verification>
- Case-insensitive grep for "monobank" across `.planning/` returns 0 matches (excluding CONTEXT.md and RESEARCH.md which document the historical decision)
- REQUIREMENTS.md requirement count is 36 (DESX-05 removed)
- ROADMAP.md Phase 02.1 has concrete goal and plan list
</verification>
