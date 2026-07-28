---
plan_id: "03"
title: "Register Page (Tier Cards + Form Preview)"
phase: 1
wave: 2
depends_on: ["01"]
files_modified:
  - src/app/events/2026-run-for-ukraine/register/page.tsx
  - src/app/events/2026-run-for-ukraine/register/page.module.css
  - src/components/ui/TierCard.tsx
  - src/components/ui/TierCard.module.css
  - src/components/ui/TierGrid.tsx
  - src/components/ui/TierGrid.module.css
  - src/components/ui/FeeBreakdownBar.tsx
  - src/components/ui/FeeBreakdownBar.module.css
  - src/components/ui/RegistrationForm.tsx
  - src/components/ui/RegistrationForm.module.css
autonomous: true
requirements_addressed: [REGA-01, REGA-02, REGA-03, REGA-04, REGA-05, EVNT-04]
---

# Plan 03: Register Page (Tier Cards + Form Preview)

<objective>
Build the registration page at `/events/2026-run-for-ukraine/register` with tier selection cards (transparent fee breakdown), and a 2-column registration form in preview/disabled state — visually complete but non-functional per Phase 1 scope.
</objective>

<must_haves>
- Three tier cards (Supporter €35, Champion €75, Patron €150) with rewards listed
- Visual fee breakdown bar per tier (cause vs logistics split, REGA-02)
- Champion card highlighted with "MOST CHOSEN" badge
- Registration form UI with all fields (name, email, phone, t-shirt, language, country)
- GDPR consent checkbox and communications opt-in checkbox visible
- All form elements in preview/disabled state with "Coming soon" banner (per D-06, D-07)
- Breadcrumbs: Events › Run for Ukraine 2026 › Register
</must_haves>

<tasks>

<task id="03.1">
<title>Create FeeBreakdownBar component</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Fee Breakdown Bar section)
- src/data/event.ts (tier fee data from Plan 01)
</read_first>
<action>
Create `src/components/ui/FeeBreakdownBar.tsx` — server component.

**Props:** `{ causeFee: number; logisticsFee: number }`

**Render:**
- Horizontal stacked bar (height 8px, border-radius 4px)
- Left segment: `--color-ua-blue` (cause), width proportional to causeFee
- Right segment: `--color-ua-yellow` (logistics), width proportional to logisticsFee
- Below bar: legend with colored dots — "● €{causeFee} cause" (blue) and "● €{logisticsFee} logistics" (yellow)
- Overline "WHERE IT GOES" above the bar

Create `src/components/ui/FeeBreakdownBar.module.css`:
- Bar container: height 8px, border-radius 4px, display flex, overflow hidden
- Legend: flex row, gap `var(--space-4)`, `var(--text-caption)` size
- Dots: 8px inline circles via `::before` pseudo-element or inline span
</action>
<acceptance_criteria>
- Bar segments have widths proportional to cause/logistics fee (e.g., €22/€35 = 63% for Supporter cause)
- Blue segment uses `var(--color-ua-blue)`, yellow uses `var(--color-ua-yellow)`
- Legend shows exact euro amounts with colored indicator dots
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="03.2">
<title>Create TierCard component</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Tier Card section)
- src/data/event.ts (Tier type from Plan 01)
</read_first>
<action>
Create `src/components/ui/TierCard.tsx` — server component.

**Props:** `{ tier: Tier }` (imported type from `@/data/event`)

**Render:**
- Card with tier name (overline), price (h1-sized), FeeBreakdownBar, rewards list (checkmarks ✓ in `--color-success`), and "Select" button (disabled/muted in Phase 1)
- If `tier.highlighted === true`: add "MOST CHOSEN" badge (absolute positioned at top center), thicker border `2px solid var(--color-ua-blue)`, subtle box-shadow
- Badge: background `var(--color-ua-blue)`, white text, caption size, uppercase, pill shape

Create `src/components/ui/TierCard.module.css`:
- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`, border-radius `var(--radius-lg)`
- Padding: `var(--space-6)`
- Highlighted variant: `2px solid var(--color-ua-blue)`, slight shadow
- Badge: absolute top-center, transform translateY(-50%)
- Reward checkmarks: `color: var(--color-success)`
- Select button: full width, outlined style (border only), `opacity: 0.5` and `cursor: not-allowed` (Phase 1 preview)
</action>
<acceptance_criteria>
- Champion card shows "MOST CHOSEN" badge with blue background + white text
- Champion card has thicker blue border distinguishing it
- Each card shows price, fee bar, and complete rewards list
- Select buttons are visually disabled (opacity 0.5, cursor not-allowed)
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="03.3">
<title>Create TierGrid component</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Register Page layout)
- src/data/event.ts (tiers array from Plan 01)
</read_first>
<action>
Create `src/components/ui/TierGrid.tsx` — server component that imports `tiers` from `@/data/event` and renders 3 TierCard components in a grid.

Create `src/components/ui/TierGrid.module.css`:
- 3-column grid on desktop (above 1024px)
- Gap: `var(--space-8)`
- Below 1024px: single column, stacked
- Min-width per card: 280px (layout constraint from UI-SPEC)
</action>
<acceptance_criteria>
- Renders all 3 tier cards in order: Supporter, Champion, Patron
- 3-column grid on desktop, stacked on mobile
- Gap `var(--space-8)` between cards
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="03.4">
<title>Create RegistrationForm component (preview state)</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Form Fields section + Interaction States + Copywriting Contract)
- .planning/phases/01-static-event-pages/01-CONTEXT.md (D-06, D-07 decisions)
</read_first>
<action>
Create `src/components/ui/RegistrationForm.tsx` — server component rendering:

1. "Coming soon" banner at top: "Registration opens soon. This is a preview of the registration experience." — amber-10 background, full width
2. Section heading "Your details" (H2)
3. 2-column form grid with labeled fields:
   - Full name | Email
   - Phone | T-shirt size (select: XS, S, M, L, XL, XXL)
   - Language (select: English, French, Ukrainian) | Country
4. GDPR consent checkbox (marked required) with copy from UI-SPEC
5. Communications opt-in checkbox (optional) with copy from UI-SPEC
6. Footer row: "Total: €—" left, "Continue to payment →" button right

All fields: `aria-disabled="true"`, readonly, muted visual state. Button: disabled with `opacity: 0.5`, `cursor: not-allowed`.

Create `src/components/ui/RegistrationForm.module.css`:
- Banner: background `var(--color-amber-10)`, padding `var(--space-3) var(--space-6)`, border-radius `var(--radius-lg)`
- Grid: 2 columns above 640px, 1 column below
- Field gaps: `var(--space-6)` both directions
- Field border: `1px solid var(--color-border)`, border-radius `var(--radius-lg)`, padding `var(--space-3) var(--space-4)`
- Disabled fields: background `var(--color-black-05)`, border-color `var(--color-black-20)`
- Labels: above field, `var(--text-sm)`, `var(--font-medium)`, margin-bottom `var(--space-1)`
- Button: `var(--color-black)` background, white text, padding `var(--space-3) var(--space-6)`, radius `var(--radius-lg)`, disabled opacity
</action>
<acceptance_criteria>
- Banner text matches UI-SPEC: "Registration opens soon. This is a preview of the registration experience."
- Form has 6 fields in 2-column grid on desktop
- GDPR consent text matches UI-SPEC copywriting contract
- All fields have `aria-disabled="true"` attribute
- Submit button text: "Continue to payment →" with disabled styling
- Button has no click handler (no form action, no onSubmit)
- Responsive: single column below 640px
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="03.5">
<title>Assemble register page route</title>
<read_first>
- src/app/events/2026-run-for-ukraine/page.tsx (landing page pattern from Plan 02)
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Register Page layout diagram)
</read_first>
<action>
Create `src/app/events/2026-run-for-ukraine/register/page.tsx`:
- Export metadata: title "Register — Run for Ukraine 2026", description about tier selection
- Default export composing: Breadcrumbs → Overline "TRACK A · SIGN UP" → H1 "Pick a tier and register" → Subtitle → TierGrid → RegistrationForm
- Breadcrumbs: [{label: "Events", href: "/events"}, {label: "Run for Ukraine 2026", href: "/events/2026-run-for-ukraine"}, {label: "Register"}]

Create `src/app/events/2026-run-for-ukraine/register/page.module.css`:
- Max-width: `var(--max-width-content)`, margin auto, padding inline `var(--space-6)`
- Section gaps: `var(--space-12)` between tiers and form
- Subtitle: max-width 36rem
</action>
<acceptance_criteria>
- Route `/events/2026-run-for-ukraine/register` renders without errors
- Breadcrumbs show "Events › Run for Ukraine 2026 › Register" with first two as links
- Page has H1 "Pick a tier and register"
- TierGrid and RegistrationForm both render
- `npm run build` succeeds (static export generates the page)
- No horizontal scroll at 320px viewport
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` succeeds and outputs `out/events/2026-run-for-ukraine/register/index.html`
- `npm run typecheck` exits 0
- Register page shows 3 tier cards with correct prices and fee breakdowns
- Champion card has "MOST CHOSEN" badge and blue border highlight
- Form is visible but all fields are disabled/readonly
- "Coming soon" banner is visible above the form
- Breadcrumbs navigate correctly
- Mobile responsive at 320px
</verification>
