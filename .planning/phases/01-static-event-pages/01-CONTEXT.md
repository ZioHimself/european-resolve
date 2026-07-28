# Phase 1: Static Event Pages - Context

**Gathered:** 2026-07-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver static HTML event pages at `/events/2026-run-for-ukraine/` — a landing page with event info, progress placeholder, and two-track CTAs; a Register page with tier cards and form UI (preview mode); and a Fundraise page with creation form UI (preview mode). All pages visually match the Lovable prototype, integrate into the existing site shell, and pass static export build.

</domain>

<decisions>
## Implementation Decisions

### Navigation & Site Integration
- **D-01:** Site Nav component stays on all event pages — no custom event sub-nav bar.
- **D-02:** Breadcrumbs are the primary in-event navigation (e.g., `Events › Run for Ukraine 2026 › Register`).
- **D-03:** Co-organisers (Embassy of Ukraine, Ukrainian Voices, European Resolve) displayed on landing page only, as part of the event info section — not as persistent chrome.
- **D-04:** No cross-links between Track A and Track B pages. Users navigate via breadcrumb back to landing page.

### Progress Section (Phase 1 Placeholder)
- **D-05:** Progress section is rendered with skeleton/placeholder state. All 4 stat cards visible with labels (Raised, Goal, Participants, Donors) but values show "—" or "0". Progress bar at 0%. Communicates "this will be live" without fake data.

### Form Behavior (No Backend)
- **D-06:** Full form UI visible (tier cards + registration form, fundraise form) but clearly marked as a preview. A banner at top of form section states "Registration opens [date]." Fields exist but are visually muted / non-interactive.
- **D-07:** Submit buttons present but disabled with "Coming soon" visual treatment. No client-side validation fires (forms are non-functional in Phase 1).

### UA Brand Colors
- **D-08:** Two flat tokens added to `tokens.css`: `--color-ua-blue` and `--color-ua-yellow` (hex equivalents of prototype's oklch values). No scale variants, no oklch.
- **D-09:** UA colors used for: vertical stripe accent on landing page, fee breakdown bars (blue = cause, yellow = logistics), progress bar fill. All other UI uses existing token palette.

### Claude's Discretion
- Exact hex values for UA blue/yellow (faithful conversion from oklch(0.42 0.19 258) and oklch(0.85 0.17 92))
- Breadcrumb component implementation (new component or inline in page)
- Tier card "MOST CHOSEN" badge treatment
- Skeleton state visual treatment (grey pulsing, static dashes, or subtle opacity)
- Banner wording for "Registration opens [date]" notice

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- Prototype screenshots in `.cursor/projects/*/assets/` (6 images: run-primary-page, donations-track-a, donations-track-a.2, donations-track-b.1, donations-track-b.3, donation-2)
- Prototype `styles.css` at `/Users/serhiy/Downloads/styles.css` — token definitions (`--ua-blue`, `--ua-yellow`, `--ink`, `--paper`, `ua-stripe` utility, `card-elevated` utility)

### Project Architecture
- `.planning/PROJECT.md` — project overview, constraints, tier structure, donation model
- `.planning/REQUIREMENTS.md` — full v1 requirements with IDs (Phase 1: EVNT-01, EVNT-03, EVNT-04, EVNT-05, REGA-01–05, DESX-01–04)
- `.planning/ROADMAP.md` — Phase 1 success criteria (7 items)

### Existing Codebase
- `.planning/codebase/STRUCTURE.md` — directory layout, naming conventions
- `.planning/codebase/ARCHITECTURE.md` — layers, data flow, component types
- `.planning/codebase/CONVENTIONS.md` — CSS patterns, component patterns, import conventions
- `.planning/research/PITFALLS.md` §12 — CSS token mapping guidance (prototype → project)

### Existing Design System
- `src/styles/tokens.css` — current design tokens (add UA tokens here)
- `src/styles/globals.css` — layer ordering (@layer tokens, base, components)
- `src/components/layout/Nav.tsx` — existing Nav component (keep on event pages)
- `src/components/layout/Footer.tsx` — existing Footer component

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Nav.tsx` / `Footer.tsx`: Site shell — reused as-is on all event pages
- `EventCard.tsx` / `EventCard.module.css`: Existing card pattern for events (reference for card styling approach)
- `tokens.css`: Design token system — UA tokens added here following existing naming convention (`--color-{name}`)
- `globals.css`: @layer ordering — new event component styles go in `components` layer

### Established Patterns
- Pages: `src/app/{route}/page.tsx` + co-located `page.module.css`
- Server components by default; `'use client'` only if browser interactivity needed
- CSS Modules with camelCase class names
- `@layer components { ... }` for scoped styles
- Static data as typed TypeScript objects in `src/data/`

### Integration Points
- New route: `src/app/events/2026-run-for-ukraine/page.tsx` (landing)
- Sub-routes: `.../register/page.tsx`, `.../fundraise/page.tsx`
- Token addition: `src/styles/tokens.css` (two new variables)
- Breadcrumb: new component or inline — connects to existing Nav context
- Event data: tier structure, event details as typed static data in `src/data/`

</code_context>

<specifics>
## Specific Ideas

- Prototype's vertical UA stripe (linear-gradient blue→yellow) as decorative accent on landing page hero area
- Fee breakdown uses a horizontal stacked bar: blue portion = cause, yellow portion = logistics (per prototype screenshot)
- "MOST CHOSEN" badge on Champion tier card (middle card, slightly elevated/highlighted)
- Stat cards are bordered boxes in a 4-column row, progress bar sits below them (per prototype layout)
- Fundraise form shows "YOUR SHAREABLE LINK" preview below the form (dark background box with slug URL)
- Forms use 2-column layout on desktop (Full name | Email, Phone | T-shirt size, Language | Country)

</specifics>

<deferred>
## Deferred Ideas

- **Tier price → Monobank jar → tracking/donor wall attribution** — Cross-phase architecture concern (Phase 2/3). How the selected tier amount gets carried into the jar redirect URL, and whether/how donations can be tracked back. Monobank jar provides only aggregate balance — attribution strategy TBD.
- **Language switcher (EN/FR/UK)** — Prototype shows this in the nav area. Deferred to Phase 4 (i18n structure).
- **"Notify me" email capture** — Could replace the disabled form in Phase 1. Decided against for now (preview mode chosen), but could be reconsidered if launch timing allows.

</deferred>

---

*Phase: 1-Static Event Pages*
*Context gathered: 2026-07-28*
