# Roadmap: Run for Ukraine 2026

**Created:** 2026-07-28
**Phases:** 7
**Mode:** Vertical MVP (each phase delivers a deployable increment)

---

### Phase 1: Static Event Pages
**Goal:** Deliver a deployable event landing page with tier selection, registration form UI, and Track B form UI — all visually matching the prototype, integrated into the existing site with breadcrumbs.
**Mode:** mvp
**Requirements:** EVNT-01, EVNT-03, EVNT-04, EVNT-05, REGA-01, REGA-02, REGA-03, REGA-04, REGA-05, DESX-01, DESX-02, DESX-03, DESX-04
**UI hint:** yes

**Success Criteria:**
1. Event landing page renders at `/events/2026-run-for-ukraine/` with hero, event info, progress placeholder, and two-track CTAs
2. Register page renders at `/events/2026-run-for-ukraine/register` with tier cards (transparent fee split bars) and registration form
3. Fundraise page renders at `/events/2026-run-for-ukraine/fundraise` with creation form UI
4. Breadcrumbs navigate back to `/events` correctly
5. Pages use existing Nav/Footer/layout shell and new `--color-ua-blue` / `--color-ua-yellow` tokens
6. All pages pass mobile responsiveness check (no horizontal scroll at 320px)
7. Build succeeds with `npm run build` (static export, no server dependencies)

---

### Phase 2: Backend API & Registration ✓
**Goal:** Deploy a GCP Cloud Run backend that accepts Track A registrations, persists them to Google Sheets, and returns confirmation — completing the registration user journey end-to-end.
**Mode:** mvp
**Requirements:** REGA-06, REGA-07, REGA-08, API-01, API-02
**UI hint:** no
**Completed:** 2026-07-29

Plans:
- [x] 01 — Backend API: Hono Service with Google Sheets Registration
- [x] 02 — Frontend Activation: Interactive Registration with Confirmation
- [x] 03 — CI/CD: GitHub Actions Deploy to Cloud Run

**Success Criteria:**
1. Cloud Run service deploys and responds to health checks
2. POST `/api/register` validates input and writes a row to Google Sheets "Registrations" tab
3. Registration form on frontend submits to backend and shows confirmation with participant ID
4. After confirmation, user sees WhyDonate donation link to complete payment
5. CORS allows requests from `european-resolve.org` (and localhost for dev)
6. Invalid form submissions return structured validation errors displayed to user
7. Google Sheets service account auth works in production

---

### Phase 02.1: Replace Monobank jar with WhyDonate (INSERTED)

**Goal:** Migrate donation integration to WhyDonate — embed WhyDonate donation link in post-registration flow, add secure payment token confirmation, update Google Sheets as progress data source.
**Requirements**: REGA-06
**Depends on:** Phase 2
**Plans:** 4 plans

Plans:
- [x] 01 — Backend: WhyDonate config & payment token generation
- [x] 02 — Backend: Payment confirmation endpoint
- [x] 03 — Frontend: WhyDonate widget & payment confirmation flow
- [x] 04 — Documentation: Update requirements and roadmap for WhyDonate

### Phase 3: Fundraising Pages & Live Progress
**Goal:** Users can create personal fundraising pages, visitors can view them with live collective progress, and the donor wall is functional — completing both participation tracks.
**Mode:** mvp
**Requirements:** FUND-01, FUND-02, FUND-03, FUND-04, FUND-05, PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, EVNT-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09
**UI hint:** yes

Plans:

**Wave 1**
- [x] 01 — Backend: Fundraiser CRUD, Photo Upload, Progress & Donor Wall APIs

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 02 — Frontend: Fundraise Form Activation & Fundraiser Page
- [x] 03 — Frontend: Progress Dashboard Live Data & Social Sharing
- [x] 04 — Frontend: Donor Wall

**Success Criteria:**
1. User can create a fundraising page and receive a shareable URL
2. Photo upload works (Cloud Storage) and displays on the fundraiser page
3. Fundraiser pages load dynamically by slug with name, photo, message, and collective total
4. "Donate" CTA on fundraiser pages opens WhyDonate donation page
5. Social sharing buttons generate correct share URLs (WhatsApp, LinkedIn, Facebook, X, Email, Copy link)
6. Donor wall accepts opt-in entries and displays them on the fundraiser page
7. Progress dashboard shows confirmed payment totals from Sheets (EUR), goal %, participant count — auto-refreshing
8. Backend reads confirmed payments from Google Sheets
9. Draft/publish flow works for fundraiser pages

---

### Phase 4: Polish, Communications & Post-Event Readiness
**Goal:** i18n structure is in place and the site handles the post-event "completed" state gracefully.
**Mode:** mvp
**Requirements:** (overflow from REQ-9, REQ-12, REQ-14 — v2 items pulled forward if time permits)
**UI hint:** no

Plans:

**Wave 1**
- [ ] 01 — i18n Infrastructure: Locale Files, Types & t() Helper
- [ ] 02 — String Extraction: Migrate Event Components to t() Helper
- [ ] 03 — Backend Error Codes: Machine-Readable Validation Responses

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 04 — Post-Event Mode: Results Page, Closed Banners & Gallery

**Success Criteria:**
1. Content strings are extracted to locale files (English populated, FR/UK stubs ready)
2. Post-event flag in config disables registration and shows "Event completed" with final totals
3. Event page remains accessible after the event as an archive/results page
4. All v1 requirements verified as complete

---

### Phase 5: i18n Translations
**Goal:** Populate French (FR) and Ukrainian (UK) locale files with complete, reviewed translations for all user-facing strings — making the event pages fully multilingual.
**Mode:** mvp
**Requirements:** I18N-01, I18N-02
**Depends on:** Phase 4
**UI hint:** no

Plans:

**Wave 1**
- [ ] 01 — French (FR) Locale: Belgian French Translations
- [ ] 02 — Ukrainian (UK) Locale: Standard Ukrainian Translations
- [ ] 03 — Dutch (NL) & German (DE) Locales: Full Translations

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 04 — Content Fix: Plast Removal & Cross-Locale Verification

**Success Criteria:**
1. French (FR) locale file contains translations for all keys present in the English (EN) base locale
2. Ukrainian (UK) locale file contains translations for all keys present in the English (EN) base locale
3. No missing or placeholder keys remain in FR or UK locale files
4. Language switcher (I18N-03, from Phase 4) correctly renders pages in all three languages
5. Date, number, and currency formatting respects each locale's conventions
6. Build succeeds with `npm run build` for all three locale variants

---

### Phase 04.1: Registration Confirmation Emails (INSERTED)

**Goal:** Wire SMTP credentials into Cloud Run deployment and add a fundraiser confirmation email so both Track A and Track B participants receive confirmation emails in production.
**Requirements**: ADMN-03
**Depends on:** Phase 4
**Plans:** 2 plans

Plans:

**Wave 1**
- [ ] 01 — SMTP Deploy Config: Add SMTP credentials to Cloud Run deployment
- [ ] 02 — Fundraiser Confirmation Email: Localized email template + route integration

---

## Phase Dependencies

```
Phase 1 (Static Pages) ──→ Phase 2 (Backend + Registration)
                                    │
                                    ├──→ Phase 02.1 (WhyDonate Integration)
                                    │           │
                                    │           └──→ Phase 6 (Widget Auto-Detection)
                                    ▼
                           Phase 3 (Fundraising + Live Progress)
                                    │
                                    ▼
                           Phase 4 (Polish + Post-Event)
                                    │
                                    ├──→ Phase 5 (i18n Translations)
                                    │
                                    ▼
                           Phase 04.1 (Registration Confirmation Emails)
                                    │
                                    ▼
                           Phase 7 (Run for Ukraine Events Listing)
```

## Milestone Boundary

Phases 1–7 (including 02.1, 04.1, and 06.1) constitute **Milestone 1: Event Launch**. After Phase 5, Phase 04.1, Phase 6, Phase 06.1, and Phase 7, the event page is fully multilingual with automated payment detection and visible on the public events timeline, ready for public launch ahead of 23 August 2026.

### Phase 6: WhyDonate Widget Auto-Detection

**Goal:** Replace the manual "I've completed my donation" honour-system button with automatic payment detection by observing the WhyDonate widget's DOM state transitions inside its open Shadow DOM — enabling auto-confirmation and actual amount capture.
**Requirements**: REGA-06
**Depends on:** Phase 02.1
**UI hint:** yes

**Completed:** 2026-07-31

Plans:

**Wave 1**
- [x] 01 — Backend: Amount-Based Payment Confirmation & Email Response

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 02 — Frontend: WhyDonate Widget Payment Detection Hook & Pre-Fill
- [x] 03 — Frontend: Auto-Confirm UX in Confirmation Panels

**Success Criteria:**
1. When a user completes payment in the WhyDonate widget, the system auto-detects success without manual button click
2. The donated amount is read from the widget DOM and passed to the confirm-payment API
3. Backend accepts optional `amount` field in confirm-payment and records actual donated amount (with tier minimum validation)
4. Widget donor fields (first name, last name, email) are pre-filled from registration data
5. Backend registration response includes `email` field for downstream pre-fill
6. Fallback: if auto-detection fails (timeout), the manual confirm button is shown
7. Shortcode is fully parameterized via env config (no hardcoded campaign IDs)
8. Build succeeds with `npm run build`

### Phase 7: Run for Ukraine Events Listing

**Goal:** Add the August 23 Run for Ukraine 2026 event to the public `/events` timeline as a regular Events DB spreadsheet entry that links to the dedicated event pages — deriving display fields (title, date, location, thumbnail, announcement link) from the existing `src/data/event.ts` / `2026-run-for-ukraine` page content so the listing and event hub stay in sync organically.
**Requirements**: EVNT-04
**Depends on:** Phase 1
**UI hint:** no
**Plans:** 3/3 plans complete

Plans:

**Wave 0**
- [x] 01-PLAN.md — Fix Vitest include for `*.spec.tsx` (BDD pyramid prerequisite)

**Wave 1** *(blocked on Wave 0 completion)*
- [x] 02-PLAN.md — TDD: `isInternalAnnouncementUrl` + `isEventUpcoming` + EventCard same-tab links, Upcoming badge (D-22–D-26), CSS badge row, BDD RED/GREEN/REFACTOR

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 03-PLAN.md — Manual ops: Events DB spreadsheet row, Drive thumbnail, build gate (name + hub + Upcoming + no Facebook)

**Success Criteria:**
1. Events DB spreadsheet contains a Run for Ukraine 2026 row dated 2026-08-23 with fields matching the dedicated event page (name, place, type, announcement URL → `/events/2026-run-for-ukraine/`)
2. `/events` renders the new entry in the timeline via existing `fetchRawEvents` → `parseEvents` flow (no special-case UI)
3. Clicking the event card navigates to the dedicated Run for Ukraine landing page
4. Thumbnail processes at build time if `thumbnail_url` is provided in the spreadsheet row
5. Build succeeds with `npm run build`

### Phase 8: Post-event registration closure — activate completed mode, backend guard, final stats snapshot

**Goal:** Close registrations after the event by activating completed mode on frontend and backend, guarding write APIs, freezing reconciled final stats into `event.ts`, and deploying both surfaces together in a single coordinated release.
**Requirements**: POST-02, EVNT-02, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, API-02, API-03, API-07, REGA-06
**Depends on:** Phase 7
**Plans:** 2/4 plans executed

Plans:

**Wave 1**
- [x] 08-01-PLAN.md — Backend: EVENT_STATUS config, eventClosure helper, write-route guards + tests

**Wave 2**
- [x] 08-02-PLAN.md — Frontend: register page ?token= exception for late payment (D-06)

**Wave 3**
- [ ] 08-03-PLAN.md — Ops: snapshot-final-stats script from reconciled Sheets totals

**Wave 4** *(blocked on Waves 1–3 completion)*
- [ ] 08-04-PLAN.md — Deploy: CI completed-mode build, EVENT_STATUS in Cloud Run, closure ops checklist

### Phase 9: Post-event thank-you email — localized template and send to all paid participants

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 8
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 9 to break down)

### Phase 10: Opt-in beneficiary announcements — Hurkit charging station update email and Sheets-based send script

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 9
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 10 to break down)

---
*Created: 2026-07-28*

### Phase 06.1: Tier amount enforcement & effective-tier policy (INSERTED)

**Goal:** Enforce tier minimum at WhyDonate step 1 for registration payments, pre-fill tier price, compute effective tier and cumulative rewards from observed payment amount on confirm-payment, and align post-payment UI and payment email with effective tier (not registration selection).
**Requirements**: REGA-06
**Depends on:** Phase 6
**Plans:** 3 plans

Plans:

**Wave 1**
- [ ] 06.1-01-PLAN.md — Backend: getEffectiveTier, cumulative rewards, confirmPayment + email locales

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 06.1-02-PLAN.md — Frontend: WhyDonateWidget step-1 gate, pre-fill, registration panel wiring

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 06.1-03-PLAN.md — Frontend: Post-payment effective tier UI + FundraiserConfirmation parity + tests

**Success Criteria:**
1. Step-1 gate blocks advance when donation amount is below selected tier minimum (registration flows only)
2. Amount field pre-fills with tier price; sessionStorage stashed immediately on load
3. confirm-payment returns effective tier name and cumulative rewards from observed amount
4. Payments below €10 resolve to donor tier with thank-you-only rewards
5. Post-payment confirmation panel and payment email show effective tier only (no selected-vs-effective comparison)
6. Fundraiser page visitor donations and donor wall remain unrestricted (no gate)
7. `npm test` and `npm run build` succeed
