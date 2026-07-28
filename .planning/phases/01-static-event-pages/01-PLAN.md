---
plan_id: "01"
title: "Foundation: Tokens, Data, and Breadcrumbs"
phase: 1
wave: 1
depends_on: []
files_modified:
  - src/styles/tokens.css
  - src/data/event.ts
  - src/components/ui/Breadcrumbs.tsx
  - src/components/ui/Breadcrumbs.module.css
autonomous: true
requirements_addressed: [DESX-01, EVNT-04]
---

# Plan 01: Foundation — Tokens, Data, and Breadcrumbs

<objective>
Add UA brand color tokens to the design system, create typed static event data (tier structure, event details, co-organisers), and build a reusable Breadcrumbs component for in-event navigation.
</objective>

<must_haves>
- UA brand tokens (`--color-ua-blue`, `--color-ua-yellow`) available globally
- Typed event data covering tier prices, fee breakdowns, rewards, co-organisers, and event details
- Breadcrumbs component that renders navigable ancestor links with ` › ` separator
</must_haves>

<tasks>

<task id="01.1">
<title>Add UA brand color tokens</title>
<read_first>
- src/styles/tokens.css
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Color section)
</read_first>
<action>
Add two new CSS custom properties to `src/styles/tokens.css` in the `:root` block, in a new section "UA BRAND COLORS" after the existing SIGNAL RED SCALE section:

- `--color-ua-blue: #005BBB;`
- `--color-ua-yellow: #FFD500;`

These are flat tokens (no scale variants). They participate in the existing token system but are event-specific accent colors.
</action>
<acceptance_criteria>
- `src/styles/tokens.css` contains `--color-ua-blue: #005BBB` in `:root`
- `src/styles/tokens.css` contains `--color-ua-yellow: #FFD500` in `:root`
- `npm run build` succeeds (tokens don't break any existing styles)
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="01.2">
<title>Create event static data module</title>
<read_first>
- src/data/members.ts (pattern reference for typed static data)
- .planning/phases/01-static-event-pages/01-CONTEXT.md (tier structure, event details)
- .planning/PROJECT.md (tier pricing breakdown)
</read_first>
<action>
Create `src/data/event.ts` with typed static data:

**Types to define:**
- `Tier` — `{ id: 'supporter' | 'champion' | 'patron'; name: string; price: number; causeFee: number; logisticsFee: number; rewards: string[]; highlighted: boolean }`
- `CoOrganiser` — `{ abbreviation: string; name: string }`
- `EventDetails` — `{ title: string; date: string; location: string; description: string; beneficiary: { name: string; mission: string; url: string }; goalEur: number }`

**Data values:**
- Supporter: €35 (€22 cause / €13 logistics), rewards: race bib, finisher medal, digital certificate
- Champion: €75 (€55 cause / €20 logistics), highlighted: true, rewards: + technical race t-shirt, finisher pack, name on digital wall
- Patron: €150 (€120 cause / €30 logistics), rewards: + embroidered finisher hoodie, reserved starting corral, post-race reception invite
- Co-organisers: Embassy of Ukraine in Belgium, Ukrainian Voices, European Resolve, Plast
- Event: "Run for Ukraine 2026", 23 August 2026, Brussels, beneficiary Hurkit

Export all data using `satisfies` pattern matching `members.ts` convention.
</action>
<acceptance_criteria>
- `src/data/event.ts` exports `tiers` array with 3 entries, each with correct `price`, `causeFee`, `logisticsFee`
- `src/data/event.ts` exports `coOrganisers` array with 4 entries
- `src/data/event.ts` exports `eventDetails` object with `title`, `date`, `beneficiary`
- `npm run typecheck` exits 0 (all types check)
- Data uses `satisfies` for type inference + validation
</acceptance_criteria>
</task>

<task id="01.3">
<title>Create Breadcrumbs component</title>
<read_first>
- src/components/ui/EventCard.tsx (existing component pattern reference)
- src/components/ui/EventCard.module.css (CSS Module pattern reference)
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Breadcrumbs spec)
</read_first>
<action>
Create `src/components/ui/Breadcrumbs.tsx` (server component, named export):

**Props:** `items: Array<{ label: string; href?: string }>` — last item has no href (current page).

**Render:** `<nav aria-label="Breadcrumb">` containing an `<ol>` with `<li>` items. Parent pages render as `<a>` links. Separator ` › ` between items. Current page (last) is a `<span>` with `aria-current="page"`.

Create `src/components/ui/Breadcrumbs.module.css`:
- Font: `var(--text-sm)`, `var(--font-book)`
- Links: `color: var(--color-link)`, underline on hover
- Current: `color: var(--color-text-primary)`, no link
- Margin-bottom: `var(--space-6)`
- Separator: styled via CSS `::before` on list items (not first child)
</action>
<acceptance_criteria>
- `src/components/ui/Breadcrumbs.tsx` exports named `Breadcrumbs` component
- Component renders `<nav aria-label="Breadcrumb">` with `<ol>` structure
- Last item renders without link, with `aria-current="page"`
- `Breadcrumbs.module.css` uses only existing design tokens (no raw px values except where tokens don't exist)
- `npm run typecheck` exits 0
- `npm run build` succeeds
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` succeeds — static export with new tokens and components doesn't break
- `npm run typecheck` exits 0 — all new types are sound
- `src/styles/tokens.css` includes both UA color tokens
- `src/data/event.ts` compiles with correct tier data
- `Breadcrumbs` component renders correctly when used in a page
</verification>
