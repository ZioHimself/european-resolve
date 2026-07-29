# Requirements: Run for Ukraine 2026

**Defined:** 2026-07-28
**Core Value:** Participants can register and share personal fundraising pages that drive donations via WhyDonate with full transparency

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Event Page

- [ ] **EVNT-01**: User can view the event landing page with event description, date, venue placeholder, and beneficiary info
- [ ] **EVNT-02**: User can see live progress stats (amount raised, goal %, participants, donors) updated in near-real-time
- [ ] **EVNT-03**: User can choose between two participation tracks (Register/Donate vs Raise Funds)
- [ ] **EVNT-04**: User can navigate back to events list via breadcrumbs
- [ ] **EVNT-05**: User can see co-organiser logos/names in the event header area

### Registration (Track A)

- [ ] **REGA-01**: User can select a participation tier (Supporter €35, Champion €75, Patron €150) with rewards listed
- [ ] **REGA-02**: User can see transparent cause vs logistics fee breakdown per tier (visual bar)
- [ ] **REGA-03**: User can fill registration form (full name, email, phone, t-shirt size, language, country)
- [ ] **REGA-04**: User must consent to GDPR data processing before submitting
- [ ] **REGA-05**: User can opt-in to ongoing communications (optional checkbox)
- [ ] **REGA-06**: User can complete payment via WhyDonate donation link after registration with payment confirmation flow
- [ ] **REGA-07**: User receives on-page confirmation with participant ID after successful registration
- [ ] **REGA-08**: Registration data is persisted to Google Sheets via backend API

### Fundraising (Track B)

- [ ] **FUND-01**: User can create a personal fundraising page (display name, personal message, personal goal in EUR)
- [ ] **FUND-02**: User can upload a profile photo for their fundraising page
- [ ] **FUND-03**: User receives a shareable URL (slug-based) for their fundraising page
- [ ] **FUND-04**: User can save a draft and publish later
- [ ] **FUND-05**: Fundraising page displays collective jar total (clearly labelled as collective, not personal)

### Fundraiser Pages (Dynamic)

- [ ] **PAGE-01**: Visitor can view any published fundraiser page by its URL slug
- [ ] **PAGE-02**: Visitor can see the fundraiser's name, photo, personal message, and personal goal
- [ ] **PAGE-03**: Visitor can click "Donate" which opens WhyDonate donation page
- [ ] **PAGE-04**: Visitor can share the fundraiser page via WhatsApp, LinkedIn, Facebook, X, Email, or copy link
- [ ] **PAGE-05**: Visitor can see a donor wall of opt-in supporters (name + message)
- [ ] **PAGE-06**: Visitor can add their name and message to the donor wall (opt-in, entered on platform — not from payment)

### Progress Dashboard

- [ ] **DASH-01**: Public page shows overall amount raised (from Google Sheets confirmed payments in EUR)
- [ ] **DASH-02**: Public page shows fundraising goal and percentage reached (progress bar)
- [ ] **DASH-03**: Public page shows number of registered participants
- [ ] **DASH-04**: Public page shows cause description with link to beneficiary and WhyDonate campaign
- [ ] **DASH-05**: Stats refresh automatically without page reload (polling or SSE)

### Backend API

- [ ] **API-01**: Backend runs on GCP Cloud Run (Node.js/TypeScript)
- [ ] **API-02**: Backend provides POST /api/register endpoint (validates + writes to Google Sheets)
- [ ] **API-03**: Backend provides POST /api/fundraiser endpoint (creates page + writes to Google Sheets)
- [ ] **API-04**: Backend provides GET /api/fundraiser/:slug endpoint (reads from Google Sheets)
- [ ] **API-05**: Backend provides GET /api/progress endpoint (sums confirmed payments from Sheets + participant count)
- [ ] **API-06**: Backend reads confirmed payment totals from Google Sheets (no external polling needed)
- [ ] **API-07**: Backend provides POST /api/donors endpoint (add donor wall entry)
- [ ] **API-08**: Backend provides GET /api/donors/:slug endpoint (read donor wall for a fundraiser)
- [ ] **API-09**: Payment confirmations are timestamped in Google Sheets (built-in audit trail)

### Design & UX

- [ ] **DESX-01**: Event pages use UA brand colors (--ua-blue, --ua-yellow) added to project's design tokens
- [ ] **DESX-02**: Layout matches prototype screenshots (spacing, typography hierarchy, card patterns)
- [ ] **DESX-03**: Pages reuse existing Nav, Footer, and layout shell (not prototype's mock header)
- [ ] **DESX-04**: Pages are mobile-responsive with mobile-first form UX

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Logistics & Check-In

- **LOGI-01**: Platform assigns unique bib numbers to confirmed participants
- **LOGI-02**: QR code generated per participant for fast check-in
- **LOGI-03**: Volunteer check-in via QR scan (offline-capable)
- **LOGI-04**: Walk-up registration support on event day
- **LOGI-05**: Participant list exportable (CSV) filtered by tier/track/size

### Admin & Communications

- **ADMN-01**: Admin UI for managing participants (status, manual registration, VIPs)
- **ADMN-02**: Configurable tier thresholds and reward descriptions (no developer needed)
- **ADMN-03**: Automated registration confirmation email
- **ADMN-04**: Milestone reminder emails (2 weeks, 1 week, 3 days before)
- **ADMN-05**: Race-day logistics email with check-in QR code
- **ADMN-06**: Editable email templates for comms coordinator

### Post-Event

- **POST-01**: Post-event email to all participants (total raised, impact statement, certificate)
- **POST-02**: Public event-results page (persists after event)
- **POST-03**: Post-event survey (experience, likelihood to return)
- **POST-04**: Social sharing prompt at completion ("I ran for Ukraine")
- **POST-05**: Follow-up update when charity confirms fund deployment

### Internationalisation

- **I18N-01**: UI available in French (FR)
- **I18N-02**: UI available in Ukrainian (UK)
- **I18N-03**: Language switcher in event header

### Advanced

- **ADVN-01**: Embeddable progress widget for partner websites
- **ADVN-02**: Participant completion tracking (finish-line QR scan)
- **ADVN-03**: DNS vs DNF distinction for reporting
- **ADVN-04**: Reward tier management with manual assignment for sponsorship track

## Out of Scope

| Feature | Reason |
|---------|--------|
| Platform payment processing | WhyDonate handles payments — platform confirms via redirect token |
| Per-runner donation totals | Shared jar provides only aggregate balance |
| Leaderboard / rankings | Requires per-runner attribution not available |
| Belgian tax certificates | Funds never pass through NGO |
| Donor-level data export | Donor identities managed by WhyDonate |
| Per-donation notifications | WhyDonate does not provide webhook callbacks in current integration |
| Multi-event support | Single event for now; generalise later |
| User accounts / login | Static site, no authentication layer |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EVNT-01 | Phase 1 | Pending |
| EVNT-02 | Phase 3 | Pending |
| EVNT-03 | Phase 1 | Pending |
| EVNT-04 | Phase 1 | Pending |
| EVNT-05 | Phase 1 | Pending |
| REGA-01 | Phase 1 | Pending |
| REGA-02 | Phase 1 | Pending |
| REGA-03 | Phase 1 | Pending |
| REGA-04 | Phase 1 | Pending |
| REGA-05 | Phase 1 | Pending |
| REGA-06 | Phase 2 | Pending |
| REGA-07 | Phase 2 | Pending |
| REGA-08 | Phase 2 | Pending |
| FUND-01 | Phase 3 | Pending |
| FUND-02 | Phase 3 | Pending |
| FUND-03 | Phase 3 | Pending |
| FUND-04 | Phase 3 | Pending |
| FUND-05 | Phase 3 | Pending |
| PAGE-01 | Phase 3 | Pending |
| PAGE-02 | Phase 3 | Pending |
| PAGE-03 | Phase 3 | Pending |
| PAGE-04 | Phase 3 | Pending |
| PAGE-05 | Phase 3 | Pending |
| PAGE-06 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 3 | Pending |
| API-04 | Phase 3 | Pending |
| API-05 | Phase 3 | Pending |
| API-06 | Phase 3 | Pending |
| API-07 | Phase 3 | Pending |
| API-08 | Phase 3 | Pending |
| API-09 | Phase 3 | Pending |
| DESX-01 | Phase 1 | Pending |
| DESX-02 | Phase 1 | Pending |
| DESX-03 | Phase 1 | Pending |
| DESX-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-28*
*Last updated: 2026-07-28 after initial definition*
