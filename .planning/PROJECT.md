# Run for Ukraine 2026

## What This Is

A charity run event platform at `european-resolve.org/events/2026-run-for-ukraine/` that lets participants register, create personal fundraising pages, and track collective progress toward a demining goal. All donations redirect to an external Monobank jar belonging to the beneficiary (Hurkit — charging stations for defenders). The platform never holds, routes, or reconciles donor money.

## Core Value

Participants can register and share personal fundraising pages that drive donations to the Monobank jar with full transparency about where money goes.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Event landing page with live progress stats and two participation tracks
- [ ] Track A: Tier-based registration (Supporter/Champion/Patron) with form submission
- [ ] Track B: Self-service personal fundraising page creation (name, photo, message, goal)
- [ ] Dynamic fundraiser pages with collective progress, share buttons, and donor wall
- [ ] Live public dashboard (jar balance, goal %, participants, donors)
- [ ] Registration data persisted to Google Sheets via GCP backend API
- [ ] Breadcrumb navigation back to events list
- [ ] Monobank jar redirect for all donation CTAs
- [ ] GDPR-compliant data collection (consent checkboxes, privacy notice)
- [ ] Transparent cause/logistics fee breakdown on tier cards
- [ ] Automated registration confirmation (email or on-page)
- [ ] i18n-ready structure (English content first, FR/UK later)

### Out of Scope

- Payment processing on the platform — Monobank jar handles all donations
- Per-runner donation attribution — jar model provides only aggregate balance
- Belgian tax certificates — funds never pass through the NGO
- Bancontact/bank transfer — limited to what Monobank jar supports (Visa/Mastercard)
- Admin backend UI — phase 1 uses Google Sheets directly
- On-site check-in system — separate phase (during-run)
- Participant completion tracking — separate phase (during-run)
- Leaderboard — requires per-runner attribution not available in jar model
- Real PSP checkout for participation fees — decision deferred (Monobank jar for now)

## Context

**Event details:**
- Date: 23 August 2026 (fixed)
- Venue: Brussels (exact location to be revealed shortly)
- Beneficiary: Hurkit — charging stations for defenders (humanitarian demining of liberated Ukrainian territory)
- Co-organisers: Embassy of Ukraine in Belgium, Ukrainian Voices, European Resolve, Plast

**Donation model:**
All monetary giving redirects to a single shared Monobank jar (`https://send.monobank.ua/jar/...`). The jar balance (in UAH) is the single source of truth for "amount raised." The platform's role is transparency, registration, and community-building — not money handling.

**Architecture:**
- Frontend: Static pages within existing Next.js App Router site (Cloudflare Pages)
- Backend API: GCP-hosted service (similar pattern to only-facts project)
- Data store: Google Sheets (registrations, fundraiser page data)
- Live stats: Monobank jar balance API (public balance or API token from charity)

**Design reference:**
Lovable prototype screenshots provide visual/UX reference. Implementation uses existing project's CSS Modules + tokens approach. Prototype's Tailwind-v4 tokens (`--ua-blue`, `--ua-yellow`, `--ink`, `--paper`) are translated to the project's existing design token system. The prototype's nav/header is a mock — real site's Nav/Footer/layout shell is reused.

**Tier structure (from prototype):**
- Supporter: €35 (€22 cause / €13 logistics) — race bib, finisher medal, digital certificate
- Champion: €75 (€55 cause / €20 logistics) — + technical race t-shirt, finisher pack, name on digital wall
- Patron: €150 (€120 cause / €30 logistics) — + embroidered finisher hoodie, reserved starting corral, post-race reception invite

**Open team decisions (from requirements spec):**
1. Participation fee channel — real PSP checkout for entry fees, or make participation free/donation-suggested?
2. Per-runner attribution — collective-total-only, self-reported pledges, or one jar per runner?
3. Currency display — how UAH jar balance is shown against EUR goal?
4. Donor data — accept that donor identities live with Monobank/charity, not platform?

## Constraints

- **Static export**: Frontend pages must work as pre-rendered HTML (SEO, Cloudflare Pages)
- **No payment processing**: Platform redirects to Monobank jar; never touches money
- **GDPR**: Belgian NGO, data minimization, explicit consent for communications
- **Existing design system**: Must use project's CSS Modules + tokens (no Tailwind, no CSS-in-JS)
- **Google Sheets**: Backend writes registrations to Sheets (team's existing operational tool)
- **Monobank API**: Jar balance may be UAH-denominated; EUR conversion approach needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monobank jar for donations | Beneficiary's existing collection mechanism; no platform payment liability | — Pending |
| Static frontend + GCP API | Keeps existing Cloudflare Pages deploy; API handles dynamic operations | — Pending |
| Google Sheets for data | Team already uses Sheets for events; low-friction for non-technical coordinators | — Pending |
| English first, i18n later | Ship faster; structure supports FR/UK addition without rewrite | — Pending |
| Subpath routing | `/events/2026-run-for-ukraine/` keeps event within existing site hierarchy | — Pending |
| No per-runner attribution (v1) | Jar model doesn't support it; can add self-reported pledges later | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-28 after initialization*
