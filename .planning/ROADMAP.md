# Roadmap: Run for Ukraine 2026

**Created:** 2026-07-28
**Phases:** 4
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

### Phase 2: Backend API & Registration
**Goal:** Deploy a GCP Cloud Run backend that accepts Track A registrations, persists them to Google Sheets, and returns confirmation — completing the registration user journey end-to-end.
**Mode:** mvp
**Requirements:** REGA-06, REGA-07, REGA-08, API-01, API-02, DESX-05
**UI hint:** no

**Success Criteria:**
1. Cloud Run service deploys and responds to health checks
2. POST `/api/register` validates input and writes a row to Google Sheets "Registrations" tab
3. Registration form on frontend submits to backend and shows confirmation with participant ID
4. After confirmation, user sees Monobank jar redirect button with Visa/Mastercard-only notice
5. CORS allows requests from `european-resolve.org` (and localhost for dev)
6. Invalid form submissions return structured validation errors displayed to user
7. Google Sheets service account auth works in production

---

### Phase 3: Fundraising Pages & Live Progress
**Goal:** Users can create personal fundraising pages, visitors can view them with live collective progress, and the donor wall is functional — completing both participation tracks.
**Mode:** mvp
**Requirements:** FUND-01, FUND-02, FUND-03, FUND-04, FUND-05, PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, EVNT-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09
**UI hint:** yes

**Success Criteria:**
1. User can create a fundraising page and receive a shareable URL
2. Photo upload works (Cloud Storage) and displays on the fundraiser page
3. Fundraiser pages load dynamically by slug with name, photo, message, and collective total
4. "Donate" CTA on fundraiser pages redirects to Monobank jar
5. Social sharing buttons generate correct share URLs (WhatsApp, LinkedIn, Facebook, X, Email, Copy link)
6. Donor wall accepts opt-in entries and displays them on the fundraiser page
7. Progress dashboard shows jar balance (UAH→EUR), goal %, participant count — auto-refreshing
8. Backend polls Monobank jar every 60s and logs readings with timestamps
9. Draft/publish flow works for fundraiser pages

---

### Phase 4: Polish, Communications & Post-Event Readiness
**Goal:** Registration confirmation emails are sent, i18n structure is in place, and the site handles the post-event "completed" state gracefully.
**Mode:** mvp
**Requirements:** (overflow from REQ-9, REQ-12, REQ-14 — v2 items pulled forward if time permits)
**UI hint:** no

**Success Criteria:**
1. Registration confirmation email sent via transactional email service (Resend or equivalent)
2. Content strings are extracted to locale files (English populated, FR/UK stubs ready)
3. Post-event flag in config disables registration and shows "Event completed" with final totals
4. Event page remains accessible after the event as an archive/results page
5. All v1 requirements verified as complete

---

## Phase Dependencies

```
Phase 1 (Static Pages) ──→ Phase 2 (Backend + Registration)
                                    │
                                    ▼
                           Phase 3 (Fundraising + Live Progress)
                                    │
                                    ▼
                           Phase 4 (Polish + Post-Event)
```

## Milestone Boundary

Phases 1–4 constitute **Milestone 1: Event Launch**. After Phase 4, the event page is ready for public launch ahead of 23 August 2026.

---
*Created: 2026-07-28*
