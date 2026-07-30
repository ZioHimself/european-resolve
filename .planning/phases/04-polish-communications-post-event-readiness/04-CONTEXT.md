# Phase 4: Polish, Communications & Post-Event Readiness - Context

**Gathered:** 2026-07-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Prepare the platform for multilingual expansion and event lifecycle completion. Content strings from the Run for Ukraine event pages (~15 components) are extracted into typed TypeScript locale files with a `t()` helper function — English populated, NL/FR/DE/UK stubs created. Backend API switches from human-readable error messages to machine-readable error codes so the frontend can map them to locale strings. A post-event mode (`NEXT_PUBLIC_EVENT_STATUS=completed`) transforms the landing page into a dedicated results view with final totals, event photo gallery (from Google Drive), thank-you message, and inline accountability report. Registration and fundraiser creation pages show "closed" banners. Individual fundraiser pages remain accessible but with donations and donor wall commenting disabled. Progress stats freeze at final values (no more API polling).

</domain>

<decisions>
## Implementation Decisions

### i18n File Format & Structure
- **D-01:** TypeScript locale objects (e.g. `src/locales/en.ts`) exporting typed objects. Matches existing convention of typed static data in `src/data/`.
- **D-02:** Scope limited to event pages only — extract strings from the Run for Ukraine pages and their ~15 components. The main site (Home, Team, Privacy, Nav, Footer) stays with inline English for now.
- **D-03:** Flat namespace with dot-notation keys (e.g. `'hero.title'`, `'register.tierSupporter'`, `'fundraise.submitButton'`).
- **D-04:** Direct import + `t()` helper function — components import from `@/locales`. No React Context provider needed. Works with static export. Locale selection mechanism deferred to when translations are ready.
- **D-05:** Locale stubs for EN (fully populated), NL, FR, DE, UK (empty stubs with the same key structure). Actual translations are v2 scope.

### Backend i18n
- **D-06:** Backend returns machine-readable error codes (e.g. `VALIDATION_EMAIL_REQUIRED`) instead of human-readable messages. Frontend maps error codes to locale strings via the `t()` helper. Backend stays language-agnostic.

### Post-Event Trigger
- **D-07:** Environment variable `NEXT_PUBLIC_EVENT_STATUS=completed` triggers post-event mode. Requires a rebuild + deploy to switch. Matches existing env var pattern (`NEXT_PUBLIC_WHYDONATE_CAMPAIGN_URL`).

### Post-Event Landing Page
- **D-08:** Landing page fully transforms into a dedicated results view when in completed mode — hero section with final totals, event photo gallery, thank-you message, and inline accountability/impact report section (total raised, how funds were used, beneficiary update, evidence/photos).
- **D-09:** Accountability report is an inline section on the results page — not a separate route or external link.

### Post-Event Gallery
- **D-10:** Event photo gallery fetches images from a Google Drive folder, reusing the existing Drive integration from Phase 3 (service account auth already in place for fundraiser photo uploads).

### Post-Event Fundraiser Pages
- **D-11:** Individual fundraiser pages remain accessible after the event but with WhyDonate widget removed (or replaced with "Donations are closed" message) and donor wall comment form hidden. Existing donor wall entries remain visible.

### Post-Event Routes
- **D-12:** The `/register` page shows a prominent "Registration is closed" banner. Form/tier cards hidden.
- **D-13:** The `/fundraise` page shows a prominent "Fundraiser creation is closed" banner. Form hidden.

### Post-Event Progress Stats
- **D-14:** Progress section shows frozen final numbers when in completed mode — stops polling the backend API. Values reflect the last data snapshot before switching to completed mode.

### Events List
- **D-15:** The events list at `/events` stays as-is — no special "past event" badge or section. The Run for Ukraine event will be added to the events spreadsheet as a regular entry with a link pointing to the dedicated pages.

### Claude's Discretion
- `t()` helper implementation details (fallback behavior when key is missing, interpolation syntax for dynamic values)
- Locale file directory structure within `src/locales/`
- Post-event results page layout and design (component structure, visual hierarchy)
- Gallery component implementation (grid layout, image sizing, lazy loading)
- How to detect and render the "closed" state across routes (shared hook or per-component checks)
- Exact backend error code naming convention
- Which strings in existing components are extractable vs too tightly coupled to JSX structure

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture
- `.planning/PROJECT.md` — project overview, constraints, donation model
- `.planning/REQUIREMENTS.md` — v1 requirements (Phase 4 maps to overflow from REQ-9, REQ-12, REQ-14); v2 I18N-01/02/03 for future locale work
- `.planning/ROADMAP.md` — Phase 4 success criteria (4 items)

### Prior Phase Context (decisions carried forward)
- `.planning/phases/01-static-event-pages/01-CONTEXT.md` — UA brand tokens (D-08/D-09), component patterns, language switcher deferred to Phase 4 (deferred ideas)
- `.planning/phases/02.1-replace-monobank-jar-with-whydonate/02.1-CONTEXT.md` — WhyDonate integration model, payment confirmation flow, env var patterns
- `.planning/phases/03-fundraising-pages-live-progress/03-CONTEXT.md` — Google Drive photo integration (D-03/D-04/D-05), fundraiser page delivery (D-01/D-02), donor wall (D-10–D-13), progress dashboard (D-14/D-15)

### Existing Frontend Code (to be modified)
- `src/app/events/2026-run-for-ukraine/page.tsx` — Landing page (transforms to results view in completed mode)
- `src/app/events/2026-run-for-ukraine/register/page.tsx` — Registration page (shows "closed" banner)
- `src/app/events/2026-run-for-ukraine/fundraise/page.tsx` — Fundraise form page (shows "closed" banner)
- `src/app/events/2026-run-for-ukraine/fundraiser/page.tsx` — Fundraiser page (disable donations/comments)
- `src/components/ui/ProgressSection.tsx` — Progress stats (freeze in completed mode)
- `src/components/ui/EventHero.tsx` — Hero section (different content in completed mode)
- `src/components/ui/TrackCards.tsx` — Track CTAs (hidden in completed mode)
- `src/components/ui/FundraiserPage.tsx` — Fundraiser page component (disable WhyDonate widget)
- `src/components/ui/DonorWallForm.tsx` — Donor wall form (hide in completed mode)
- `src/data/event.ts` — Event data (add completed-mode content fields)

### Existing Backend Code (to be modified)
- `backend/src/routes/register.ts` — Registration endpoint (switch to error codes)
- `backend/src/routes/fundraiser.ts` — Fundraiser endpoints (switch to error codes)
- `backend/src/routes/donors.ts` — Donor wall endpoint (switch to error codes)
- `backend/src/routes/progress.ts` — Progress endpoint (add gallery photo listing)
- `backend/src/services/drive.ts` — Google Drive service (extend for gallery folder listing)

### Existing Design System
- `src/styles/tokens.css` — Design tokens (UA brand colors already added in Phase 1)
- `src/styles/globals.css` — CSS layer ordering

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/data/event.ts`: Event details object — extend with post-event content fields (results totals, thank-you message, gallery folder ID)
- `src/components/ui/ProgressSection.tsx`: Already fetches from `/api/progress` — add condition to freeze values in completed mode
- `backend/src/services/drive.ts`: Google Drive service (Phase 3) — extend with folder listing for gallery photos
- `src/lib/events.ts`: Events fetching/parsing — no changes needed, events list stays as-is

### Established Patterns
- CSS Modules with camelCase class names — all new components follow this
- `'use client'` for interactive components — post-event state check likely needs a client component or shared hook
- Static data as typed TypeScript objects in `src/data/` — locale files follow the same pattern
- Env var pattern: `NEXT_PUBLIC_*` for client-accessible config (already used for WhyDonate campaign URL)
- Google Drive integration via service account (already working for fundraiser photo uploads)

### Integration Points
- New directory: `src/locales/` with `en.ts`, `nl.ts`, `fr.ts`, `de.ts`, `uk.ts` and a `t()` helper
- New env var: `NEXT_PUBLIC_EVENT_STATUS` (values: `active` | `completed`)
- New backend endpoint or extension: `GET /api/gallery` (list photos from a Drive gallery folder)
- Modified frontend: ~15 event components updated to use `t()` for string extraction
- Modified backend: all endpoints switch from English error messages to error codes

</code_context>

<specifics>
## Specific Ideas

- The results page should feel celebratory — "We did it!" energy with the final amount raised prominently displayed
- Accountability section shows concrete impact: how many charging stations funded, how the money reached Hurkit
- Gallery photos should be high-quality event photos (runners, atmosphere, crowd) loaded from a dedicated Drive folder
- The "Registration is closed" and "Fundraiser creation is closed" messages should include a link back to the results page so visitors can see what happened
- Individual fundraiser pages in completed mode serve as a permanent record of each participant's contribution

</specifics>

<deferred>
## Deferred Ideas

- **Comprehensive test coverage** — Backend has zero tests, frontend event components have no tests. Important but kept out of Phase 4 scope to avoid diluting the i18n and post-event focus. Should be a dedicated effort.
- **Actual translations (NL, FR, DE, UK)** — Phase 4 creates the structure and stubs. Filling in translations is v2 scope (I18N-01/02/03 requirements + NL/DE additions).
- **Language switcher UI** — I18N-03 (v2). The i18n structure from Phase 4 enables this but the switcher component itself is future work.
- **Post-event survey** — POST-03 (v2). Could be linked from the results page but is out of scope.
- **Social sharing prompt at completion** — POST-04 (v2). "I ran for Ukraine" sharing. Not Phase 4 scope.
- **Embeddable progress widget** — ADVN-01 (v2). Partner websites could embed final results. Future work.

</deferred>

---

*Phase: 4-Polish, Communications & Post-Event Readiness*
*Context gathered: 2026-07-29*
