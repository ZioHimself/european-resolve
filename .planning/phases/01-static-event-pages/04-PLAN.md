---
plan_id: "04"
title: "Fundraise Page (Form Preview + Shareable Link)"
phase: 1
wave: 2
depends_on: ["01"]
files_modified:
  - src/app/events/2026-run-for-ukraine/fundraise/page.tsx
  - src/app/events/2026-run-for-ukraine/fundraise/page.module.css
  - src/components/ui/FundraiseForm.tsx
  - src/components/ui/FundraiseForm.module.css
  - src/components/ui/ShareableLinkPreview.tsx
  - src/components/ui/ShareableLinkPreview.module.css
autonomous: true
requirements_addressed: [EVNT-03, EVNT-04]
---

# Plan 04: Fundraise Page (Form Preview + Shareable Link)

<objective>
Build the fundraise page at `/events/2026-run-for-ukraine/fundraise` with a creation form (display name, message, goal, photo upload area) and a shareable link preview box — all in preview/disabled state per Phase 1 scope.
</objective>

<must_haves>
- Fundraise form UI with fields: display name, personal message (textarea), personal goal (€), photo upload area
- Shareable link preview box (dark background, placeholder URL)
- "Publish page →" and "Save draft" buttons visible but disabled
- Preview banner matching register page pattern
- Breadcrumbs: Events › Run for Ukraine 2026 › Fundraise
- All form elements in preview/disabled state (per D-06, D-07)
</must_haves>

<tasks>

<task id="04.1">
<title>Create ShareableLinkPreview component</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Shareable Link Box section)
</read_first>
<action>
Create `src/components/ui/ShareableLinkPreview.tsx` — server component rendering:
- Dark box (background `var(--color-black)`)
- Overline: "YOUR SHAREABLE LINK" in `var(--color-ua-blue)`, caption size, uppercase
- URL text: "uidrun.eu/p/your-name-here" in white/light, base size
- Copy button (small pill, white background, dark text) — disabled in Phase 1

Create `src/components/ui/ShareableLinkPreview.module.css`:
- Background: `var(--color-black)`
- Border-radius: `var(--radius-lg)`
- Padding: `var(--space-4) var(--space-6)`
- Overline: `var(--color-ua-blue)`, `var(--text-caption)`, uppercase, `var(--tracking-caps)`
- URL: `var(--color-white)`, `var(--text-base)`
- Copy button: white background, dark text, small pill shape, `opacity: 0.5` (disabled)
</action>
<acceptance_criteria>
- Dark box renders with "YOUR SHAREABLE LINK" label in ua-blue
- Placeholder URL displays as light text on dark background
- Copy button visible but disabled (opacity 0.5, cursor not-allowed)
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="04.2">
<title>Create FundraiseForm component (preview state)</title>
<read_first>
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Fundraise Page layout + Form Fields + Interaction States)
- .planning/phases/01-static-event-pages/01-CONTEXT.md (D-06, D-07 decisions)
- src/components/ui/RegistrationForm.tsx (banner pattern from Plan 03)
</read_first>
<action>
Create `src/components/ui/FundraiseForm.tsx` — server component rendering:

1. "Coming soon" banner (same pattern as registration form): "Registration opens soon. This is a preview of the fundraising experience."
2. Form layout:
   - Left: circular photo upload area (dashed border circle with upload icon placeholder) — non-interactive
   - Right: Display name field, Personal message textarea, Personal goal (€) field
3. Below form: ShareableLinkPreview component
4. Action buttons row: "Save draft" (ghost button) + "Publish page →" (primary button) — both disabled

All fields: `aria-disabled="true"`, readonly, muted visual state. Buttons disabled with `opacity: 0.5`, `cursor: not-allowed`.

Create `src/components/ui/FundraiseForm.module.css`:
- Banner: same amber-10 pattern as RegistrationForm
- Layout: 2-column on desktop (photo left, fields right), stacked on mobile
- Photo upload: 120px circle, dashed border `2px dashed var(--color-border)`, centered placeholder text/icon
- Fields: same styling as RegistrationForm fields (border, radius, padding, disabled state)
- Textarea: min-height 120px
- Button row: flex, gap `var(--space-4)`, justify-end
- Ghost button: transparent bg, border `1px solid var(--color-border)`, same padding/radius as primary
- Primary button: same as RegistrationForm CTA
</action>
<acceptance_criteria>
- Photo upload shows as dashed circle (non-interactive)
- Form has 3 fields: display name (input), personal message (textarea), personal goal (input with € prefix)
- All fields are `aria-disabled="true"`
- Both buttons disabled with opacity 0.5
- Banner text matches preview pattern
- Responsive: stacked layout on mobile
- `npm run typecheck` exits 0
</acceptance_criteria>
</task>

<task id="04.3">
<title>Assemble fundraise page route</title>
<read_first>
- src/app/events/2026-run-for-ukraine/register/page.tsx (register page pattern from Plan 03)
- .planning/phases/01-static-event-pages/01-UI-SPEC.md (Fundraise Page layout diagram)
</read_first>
<action>
Create `src/app/events/2026-run-for-ukraine/fundraise/page.tsx`:
- Export metadata: title "Fundraise — Run for Ukraine 2026", description about personal fundraising pages
- Default export composing: Breadcrumbs → Overline "TRACK B · RAISE FUNDS" → H1 "Your fundraising page" → Subtitle "Takes about a minute..." → FundraiseForm
- Breadcrumbs: [{label: "Events", href: "/events"}, {label: "Run for Ukraine 2026", href: "/events/2026-run-for-ukraine"}, {label: "Fundraise"}]

Create `src/app/events/2026-run-for-ukraine/fundraise/page.module.css`:
- Max-width: `var(--max-width-content)`, margin auto, padding inline `var(--space-6)`
- Section gaps consistent with register page
- Subtitle: max-width 36rem, secondary color
</action>
<acceptance_criteria>
- Route `/events/2026-run-for-ukraine/fundraise` renders without errors
- Breadcrumbs show "Events › Run for Ukraine 2026 › Fundraise" with first two as links
- Page has H1 "Your fundraising page"
- FundraiseForm and ShareableLinkPreview both render
- `npm run build` succeeds (static export generates the page)
- No horizontal scroll at 320px viewport
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` succeeds and outputs `out/events/2026-run-for-ukraine/fundraise/index.html`
- `npm run typecheck` exits 0
- Fundraise page shows form with all fields in disabled state
- Photo upload circle renders as dashed border
- Shareable link preview shows dark box with placeholder URL
- Both action buttons visible but disabled
- Breadcrumbs navigate correctly
- Mobile responsive at 320px
</verification>
