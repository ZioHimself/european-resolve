---
plan_id: "02"
title: "Event Landing Page"
phase: 1
wave: 2
depends_on: ["01"]
files_modified:
  - src/app/events/2026-run-for-ukraine/page.tsx
  - src/app/events/2026-run-for-ukraine/page.module.css
  - src/components/ui/EventHero.tsx
  - src/components/ui/EventHero.module.css
  - src/components/ui/CoOrganiserBar.tsx
  - src/components/ui/CoOrganiserBar.module.css
  - src/components/ui/ProgressSection.tsx
  - src/components/ui/ProgressSection.module.css
  - src/components/ui/TrackCards.tsx
  - src/components/ui/TrackCards.module.css
  - src/components/ui/UaStripe.tsx
  - src/components/ui/UaStripe.module.css
autonomous: true
requirements_addressed: [EVNT-01, EVNT-03, EVNT-05, DESX-02, DESX-03, DESX-04]
---

# Plan 02: Event Landing Page

<objective>
Build the event landing page at `/events/2026-run-for-ukraine/` with hero section, co-organiser bar, progress placeholder (skeleton state), two-track CTAs, and decorative UA stripe — all within the existing site shell.
</objective>

<must_haves>
- Page renders at `/events/2026-run-for-ukraine/` with hero, event info, progress section, and track selection
- Co-organisers displayed on landing page (per D-03)
- Progress section shows skeleton/placeholder state with "—" values and 0% bar (per D-05)
- Two track cards (Register + Fundraise) link to respective sub-pages
- UA vertical stripe decorative accent renders on hero area (per D-09)
- Existing Nav/Footer/layout shell is reused (per D-01, DESX-03)
- No horizontal scroll at 320px viewport (DESX-04)
</must_haves>

<tasks>

<task id="02.1">
<title>Create UaStripe decorative component</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Vertical UA Stripe section)
- src/components/ui/EventCard.tsx (component pattern)
</read_first>
<action>
Create `src/components/ui/UaStripe.tsx` — server component rendering a purely decorative `<div aria-hidden="true">` element.

Create `src/components/ui/UaStripe.module.css`:
- Width: 6px
- Height: 200px
- Position: absolute, right edge of parent container
- Background: `linear-gradient(to bottom, var(--color-ua-blue), var(--color-ua-yellow))`
- Border-radius: 3px
- Hidden on mobile (below 640px) via `display: none` media query
</action>
<acceptance_criteria>
- `UaStripe.tsx` exports named `UaStripe` component
- Renders with `aria-hidden="true"` (decorative only)
- CSS uses `--color-ua-blue` and `--color-ua-yellow` tokens from Plan 01
- Hidden below 640px viewport
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="02.2">
<title>Create CoOrganiserBar component</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Co-Organiser Bar section)
- src/data/event.ts (coOrganisers data from Plan 01)
</read_first>
<action>
Create `src/components/ui/CoOrganiserBar.tsx` — server component that imports `coOrganisers` from `@/data/event` and renders a full-width bar.

Layout: horizontal flex, wrap on mobile. Each entry shows abbreviation badge (bold) + full name. Overline text: "CO-ORGANISED BY".

Create `src/components/ui/CoOrganiserBar.module.css`:
- Full-width, background: `var(--color-black-05)`
- Padding: `var(--space-3) var(--space-6)`
- Text: `var(--text-caption)`, uppercase, `letter-spacing: var(--tracking-caps)`
- Flex wrap for mobile
</action>
<acceptance_criteria>
- `CoOrganiserBar.tsx` imports data from `@/data/event`
- Renders all 4 co-organisers (Embassy of Ukraine, Ukrainian Voices, European Resolve, Plast)
- Uses overline typography pattern from UI-SPEC
- Wraps gracefully on narrow viewports
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="02.3">
<title>Create ProgressSection component (placeholder state)</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Stat Card + Progress Bar sections)
- .planning/phases/01-static-event-pages/01-CONTEXT.md (D-05 decision)
</read_first>
<action>
Create `src/components/ui/ProgressSection.tsx` — server component rendering:
1. Overline: "LIVE PROGRESS" with muted "Updated live" indicator
2. Four stat cards in a description list (`<dl>`) with: Raised (—), Goal (0%), Participants (0), Donors (0)
3. Progress bar at 0% width with `role="progressbar"` and aria attributes

Create `src/components/ui/ProgressSection.module.css`:
- Stat cards: 4-column grid on desktop, 2×2 on tablet/mobile
- Card: background `var(--color-black-05)`, border `1px solid var(--color-border-subtle)`, padding `var(--space-4) var(--space-6)`, border-radius `var(--radius-lg)`
- Label: overline pattern (caption size, uppercase, tracking-caps, secondary color)
- Value: `var(--text-h2)`, `var(--font-bold)`
- Progress bar: height 8px, track `var(--color-black-10)`, fill `var(--color-ua-blue)`, border-radius 4px
- Below bar: left "€0 raised" + "Goal €50,000", right "0%"
</action>
<acceptance_criteria>
- Stat cards use `<dl>` with `<dt>` (label) and `<dd>` (value) pairs
- Progress bar has `role="progressbar"`, `aria-valuenow="0"`, `aria-valuemin="0"`, `aria-valuemax="100"`
- Values display "—" for Raised, "0%" for Goal, "0" for Participants, "0" for Donors (per D-05)
- Grid responsive: 4-col desktop, 2×2 below 1024px, stacked below 640px
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="02.4">
<title>Create TrackCards component</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Track Card section + Copywriting Contract)
- .planning/phases/01-static-event-pages/01-CONTEXT.md (D-04 — no cross-links between tracks)
</read_first>
<action>
Create `src/components/ui/TrackCards.tsx` — server component rendering:
- Section heading: "Choose how you take part"
- Subtitle paragraph
- Two cards side by side:
  - Track A: "TRACK A" overline, "Run or Donate" title, description, feature dots, "See tiers →" link to `./register`
  - Track B: "TRACK B" overline, "Raise Funds and Run" title, description, feature dots, "Create my page →" link to `./fundraise`

Create `src/components/ui/TrackCards.module.css`:
- Card: white background, border, border-radius `var(--radius-lg)`, padding `var(--space-8)`
- Grid: 2 columns on desktop, stacked below 640px
- Overline pattern for track labels
- Link: `var(--color-link)`, arrow suffix, `var(--font-medium)`
- Copy from UI-SPEC copywriting contract
</action>
<acceptance_criteria>
- Track A card links to `./register` (relative), Track B links to `./fundraise`
- Cards use copy from UI-SPEC copywriting contract (Track A/B titles, subtitles)
- 2-column layout on desktop, single column on mobile
- No cross-links between Track A and Track B (per D-04)
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="02.5">
<title>Create EventHero component</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Landing Page layout + Copywriting Contract)
- src/data/event.ts (eventDetails data from Plan 01)
</read_first>
<action>
Create `src/components/ui/EventHero.tsx` — server component rendering:
- Overline: "CHARITY RUN · BRUSSELS"
- H1: "Run for Ukraine 2026"
- Date + Location (from eventDetails)
- Description paragraph (humanitarian demining copy from UI-SPEC)
- Beneficiary link: "Beneficiary: Hurkit – charging stations for defenders ↗"

Position relative so UaStripe can be positioned absolute inside.

Create `src/components/ui/EventHero.module.css`:
- Padding: `var(--space-20)` top, `var(--space-16)` bottom
- Max-width: `var(--max-width-content)`
- Inline padding: `var(--space-6)`
- Position: relative (for UaStripe child)
- Responsive: heading scales down below 40rem (per base.css existing behavior)
</action>
<acceptance_criteria>
- Renders H1 "Run for Ukraine 2026" as the only h1 on the page
- Beneficiary link opens in new tab with `rel="noopener noreferrer"`
- Uses event data from `@/data/event` (not hardcoded dates)
- Position relative for UA stripe positioning
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="02.6">
<title>Assemble landing page route</title>
<read_first>
- src/app/events/page.tsx (existing events page pattern)
- src/app/layout.tsx (root layout — Nav/Footer already provided)
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Landing Page layout diagram)
</read_first>
<action>
Create directory `src/app/events/2026-run-for-ukraine/` with:

`page.tsx`:
- Export metadata: title "Run for Ukraine 2026 — European Resolve", appropriate description
- Default export function composing: Breadcrumbs → CoOrganiserBar → EventHero (with UaStripe inside) → ProgressSection → TrackCards
- Breadcrumbs items: [{label: "Events", href: "/events"}, {label: "Run for Ukraine 2026"}]

`page.module.css`:
- Page wrapper: max-width `var(--max-width-content)`, margin auto, padding inline `var(--space-6)`
- Section gaps: `var(--space-12)` between major sections
</action>
<acceptance_criteria>
- Route `/events/2026-run-for-ukraine` renders without errors
- Page uses existing Nav/Footer from root layout (not duplicated)
- Breadcrumbs show "Events › Run for Ukraine 2026" with Events being a link
- All 5 sub-components (CoOrganiserBar, EventHero, UaStripe, ProgressSection, TrackCards) render
- `npm run build` succeeds (static export generates the page)
- No horizontal scroll at 320px viewport width
- Page has exactly one `<h1>` element
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` succeeds and outputs `out/events/2026-run-for-ukraine/index.html`
- `npm run typecheck` exits 0
- Landing page renders all sections (hero, co-organisers, progress placeholder, track cards)
- UA stripe visible on desktop, hidden on mobile
- Breadcrumbs link back to `/events`
- Progress section in skeleton state (D-05)
- Mobile responsive — no horizontal scroll at 320px
</verification>
