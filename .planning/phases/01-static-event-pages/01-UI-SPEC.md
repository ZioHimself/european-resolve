---
phase: 1
slug: static-event-pages
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-28
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for the static event pages. Generated inline, verified by gsd-ui-checker.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (CSS Modules) |
| Preset | not applicable |
| Component library | none — custom components |
| Icon library | none (checkmarks via CSS/Unicode ✓, arrows via →) |
| Font | Inter (sans-serif) via `--font-sans` |

---

## Spacing Scale

Uses existing project tokens (`--space-{n}`, 4px base unit):

| Token | Value | Usage in Phase 1 |
|-------|-------|-------------------|
| --space-1 | 4px | Icon-to-text gaps, inline badge padding-block |
| --space-2 | 8px | Compact element spacing, badge padding-inline |
| --space-3 | 12px | Form field internal padding |
| --space-4 | 16px | Default element spacing, card internal padding (mobile) |
| --space-6 | 24px | Card internal padding (desktop), section heading gap |
| --space-8 | 32px | Section padding, gap between tier cards |
| --space-12 | 48px | Major section breaks (progress → tracks, tiers → form) |
| --space-16 | 64px | Page-level vertical padding (hero top/bottom) |
| --space-20 | 80px | Landing page hero top spacing (below nav) |

Exceptions: Tier card min-width 280px (not a spacing token — layout constraint).

---

## Typography

All values use existing tokens. Inter (`--font-sans`) throughout.

| Role | Token | Size | Weight | Line Height |
|------|-------|------|--------|-------------|
| Body | --text-base | 16px (1rem) | --font-book (400) | --leading-relaxed (1.6) |
| Small body | --text-sm | 14px (0.875rem) | --font-book (400) | --leading-normal (1.5) |
| Label / Caption | --text-caption | 12px (0.75rem) | --font-medium (500) | --leading-normal (1.5) |
| Overline | --text-caption | 12px | --font-medium (500) | --leading-normal (1.5) |
| H3 (section) | --text-h3 | 22px (1.375rem) | --font-bold (700) | --leading-snug (1.25) |
| H2 (page title) | --text-h2 | 28px (1.75rem) | --font-bold (700) | --leading-snug (1.25) |
| H1 (event title) | --text-h1 | 36px (2.25rem) | --font-bold (700) | --leading-tight (1.1) |
| Stat value | --text-h2 | 28px (1.75rem) | --font-bold (700) | --leading-tight (1.1) |
| Tier price | --text-h1 | 36px (2.25rem) | --font-bold (700) | --leading-tight (1.1) |

**Overline pattern** (used for track labels, co-organisers bar, stat labels):
- `font-size: var(--text-caption)`
- `font-weight: var(--font-medium)`
- `letter-spacing: var(--tracking-caps)` (0.1em)
- `text-transform: uppercase`
- `color: var(--color-text-secondary)`

**Responsive:** Headings scale down per existing `base.css` media queries (h1→1.5rem below 40rem).

---

## Color

Uses existing project palette + two new UA tokens.

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Dominant (60%) | --color-surface | #ffffff | Page background, card backgrounds |
| Secondary (30%) | --color-black-05 | #f3f4f6 | Page wrapper/canvas behind cards, stat card backgrounds |
| Accent — UA Blue | --color-ua-blue | #005BBB | Progress bar fill, fee bar "cause" segment, vertical stripe accent (top) |
| Accent — UA Yellow | --color-ua-yellow | #FFD500 | Fee bar "logistics" segment, vertical stripe accent (bottom) |
| Text primary | --color-text-primary | #0a1628 | Headings, body text, stat values |
| Text secondary | --color-text-secondary | #6c7488 | Labels, dates, descriptions, overlines |
| CTA fill | --color-black | #0a1628 | Primary button background (Continue to payment, Select tier) |
| CTA text | --color-white | #ffffff | Primary button text |
| Border | --color-border | #ced1d9 | Card borders, form field borders |
| Border active | --color-ua-blue | #005BBB | Selected tier card border (Champion "MOST CHOSEN") |
| Destructive | --color-red | #c41e3a | Not used in Phase 1 |
| Success | --color-success | #2d7a4d | Checkmarks in tier reward lists |

**UA color token definitions** (added to `src/styles/tokens.css`):
```css
--color-ua-blue: #005BBB;
--color-ua-yellow: #FFD500;
```

**Accent reserved for:**
- Vertical decorative stripe on landing page (linear-gradient from ua-blue to ua-yellow)
- Progress bar fill (ua-blue only)
- Fee breakdown horizontal bars (blue = cause portion, yellow = logistics portion)
- Selected tier card border highlight (ua-blue)
- "MOST CHOSEN" badge background tint

---

## Component Inventory

### Landing Page (`/events/2026-run-for-ukraine/`)

| Component | Type | Notes |
|-----------|------|-------|
| EventHero | Server | Title, date, location, description, beneficiary link |
| CoOrganiserBar | Server | Horizontal bar with org abbreviations + names |
| ProgressSection | Server | 4 stat cards + progress bar (placeholder state in Phase 1) |
| TrackCards | Server | Two cards: Track A (Register) and Track B (Fundraise) |
| UaStripe | Server | Decorative vertical gradient stripe (absolute positioned) |
| Breadcrumbs | Server | `Events › Run for Ukraine 2026` |

### Register Page (`/events/2026-run-for-ukraine/register`)

| Component | Type | Notes |
|-----------|------|-------|
| TierCard | Server | Price, fee bar, rewards list, select button |
| TierGrid | Server | 3-column grid of TierCards |
| FeeBreakdownBar | Server | Horizontal stacked bar (cause vs logistics) |
| RegistrationForm | Server | 2-col form layout (preview-only in Phase 1) |
| Breadcrumbs | Server | `Events › Run for Ukraine 2026 › Register` |

### Fundraise Page (`/events/2026-run-for-ukraine/fundraise`)

| Component | Type | Notes |
|-----------|------|-------|
| FundraiseForm | Server | Display name, message, goal, photo upload area |
| ShareableLinkPreview | Server | Dark background box with generated URL + Copy button |
| Breadcrumbs | Server | `Events › Run for Ukraine 2026 › Fundraise` |

---

## Layout Specifications

### Landing Page

```
┌─────────────────────────────────────────────────────────┐
│ [Existing Nav - dark, fixed]                            │
├─────────────────────────────────────────────────────────┤
│ Co-organiser bar (full-width, light gray bg)            │
├───────────────────────────────────────────┬─────────────┤
│ Hero Section                              │  UA Stripe  │
│  · Overline: "CHARITY RUN · BRUSSELS"     │  (vertical  │
│  · H1: "Run for Ukraine 2026"            │   gradient)  │
│  · Date + Location                        │             │
│  · Description paragraph                  │             │
│  · Beneficiary link                       │             │
├───────────────────────────────────────────┴─────────────┤
│ Progress Section                                        │
│  · "LIVE PROGRESS" overline + "Updated live" indicator  │
│  · 4 stat cards in a row                                │
│  · Progress bar (full width below cards)                │
├─────────────────────────────────────────────────────────┤
│ Track Selection                                         │
│  · H2: "Choose how you take part"                      │
│  · Subtitle paragraph                                   │
│  · 2 track cards side by side                           │
├─────────────────────────────────────────────────────────┤
│ [Existing Footer]                                       │
└─────────────────────────────────────────────────────────┘
```

- Max content width: `--max-width-content` (72rem)
- Content padding inline: `--space-6` (24px)
- UA Stripe: 6px wide, position absolute right, height ~60% of hero area

### Register Page

```
┌─────────────────────────────────────────────────────────┐
│ Breadcrumbs                                             │
├─────────────────────────────────────────────────────────┤
│ Overline: "TRACK A · SIGN UP"                          │
│ H1: "Pick a tier and register"                         │
│ Subtitle (max-width: 36rem)                            │
├─────────────────────────────────────────────────────────┤
│ Tier Grid (3 columns, equal width)                     │
│ ┌──────────┐  ┌──────────────┐  ┌──────────┐          │
│ │SUPPORTER │  │ MOST CHOSEN  │  │  PATRON  │          │
│ │   €35    │  │  CHAMPION    │  │   €150   │          │
│ │ fee bar  │  │    €75       │  │ fee bar  │          │
│ │ rewards  │  │  fee bar     │  │ rewards  │          │
│ │ [Select] │  │  rewards     │  │ [Select] │          │
│ └──────────┘  │  [Selected]  │  └──────────┘          │
│               └──────────────┘                          │
├─────────────────────────────────────────────────────────┤
│ "Your details" (H2)                                     │
│ ┌─────────────────┬─────────────────┐                  │
│ │ Full name       │ Email           │                  │
│ ├─────────────────┼─────────────────┤                  │
│ │ Phone           │ T-shirt size    │                  │
│ ├─────────────────┼─────────────────┤                  │
│ │ Language        │ Country         │                  │
│ └─────────────────┴─────────────────┘                  │
│ ☑ GDPR consent (required)                              │
│ ☑ Ongoing communications (optional)                    │
│ Total: €XX         [Continue to payment →]             │
└─────────────────────────────────────────────────────────┘
```

- Tier cards: `gap: var(--space-8)` between cards
- Form: 2-column grid above 640px, single column below
- Form field gap: `var(--space-6)` vertical, `var(--space-6)` horizontal

### Fundraise Page

```
┌─────────────────────────────────────────────────────────┐
│ Breadcrumbs                                             │
├─────────────────────────────────────────────────────────┤
│ Overline: "TRACK B · RAISE FUNDS"                      │
│ H1: "Your fundraising page"                            │
│ Subtitle: "Takes about a minute..."                     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐  Display name [___________]                │
│ │  Photo  │                                             │
│ │ upload  │  Personal message                           │
│ │ circle  │  [textarea________________]                │
│ └─────────┘                                             │
│              Personal goal (€) [___]                    │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐   │
│ │ YOUR SHAREABLE LINK                               │   │
│ │ uidrun.eu/p/julie-vanderberghe    [📋 Copy]      │   │
│ └──────────────────────────────────────────────────┘   │
│              [Save draft]  [Publish page →]             │
└─────────────────────────────────────────────────────────┘
```

---

## Interaction States (Phase 1: Preview Mode)

Per CONTEXT decisions D-06 and D-07:

| Element | Visual State | Behavior |
|---------|-------------|----------|
| Form fields | Visible, border color `--color-black-20`, background `--color-black-05` | Non-interactive (readonly attribute or pointer-events: none) |
| Submit buttons | Present, `opacity: 0.5`, cursor: not-allowed | Disabled, no click handler |
| "Coming soon" banner | Full-width banner above form section | Static text, amber-10 background |
| Progress stat values | Show "—" or "0" | Static, no animation |
| Progress bar | 0% width, ua-blue background | Static |
| "Updated live" indicator | Green dot + text hidden or muted | Communicates "will be live" |
| Tier "Select" buttons | Visible but muted | Non-interactive |
| Photo upload circle | Dashed border circle with upload icon | Non-interactive |
| Shareable link box | Shows placeholder URL | Copy button disabled |

**Preview banner copy:**
```
Registration opens soon. This is a preview of the registration experience.
```

---

## Specific Component Specifications

### Stat Card

```
┌─────────────────────────┐
│ RAISED          (label) │  ← overline pattern, --text-caption, uppercase
│ €3,000          (value) │  ← --text-h2, --font-bold
└─────────────────────────┘
```
- Background: `--color-black-05`
- Border: `1px solid var(--color-border-subtle)`
- Padding: `var(--space-4) var(--space-6)`
- Border radius: `var(--radius-lg)`
- Grid: 4 columns on desktop, 2×2 on tablet, stacked on mobile

### Progress Bar

- Height: 8px
- Background track: `--color-black-10`
- Fill: `--color-ua-blue`
- Border radius: 4px (fully rounded)
- Below: left-aligned "€X raised" + "Goal €X" labels, right-aligned percentage

### Fee Breakdown Bar

- Height: 8px
- Two segments: left = `--color-ua-blue` (cause), right = `--color-ua-yellow` (logistics)
- Border radius: 4px
- Below bar: `● €XX cause` (blue dot) and `● €XX logistics` (yellow dot)
- Dot size: 8px circles

### Tier Card

- Background: `--color-surface` (white)
- Border: `1px solid var(--color-border)`
- Border radius: `var(--radius-lg)`
- Padding: `var(--space-6)`
- **Champion (highlighted):** border `2px solid var(--color-ua-blue)`, slight box-shadow
- "MOST CHOSEN" badge: positioned at top-center, overlapping border
  - Background: `--color-ua-blue`
  - Text: white, `--text-caption`, uppercase, `--tracking-wide`
  - Padding: `2px 12px`
  - Border-radius: `var(--radius-md)`
- Reward list: checkmarks in `--color-success`, `--text-sm`
- Select button (unselected): outlined, `border: 1px solid var(--color-border)`, `--font-medium`
- Selected button: filled `--color-black`, text white

### Track Card

- Background: `--color-surface`
- Border: `1px solid var(--color-border)`
- Border radius: `var(--radius-lg)`
- Padding: `var(--space-8)`
- Overline: "TRACK A" / "TRACK B" in overline pattern
- Title: `--text-h3`, `--font-bold`
- Description: `--text-base`, `--color-text-secondary`
- Feature list: centered dots (·) as separators, `--text-sm`
- CTA link: `--color-link`, arrow suffix (→), `--font-medium`

### Co-Organiser Bar

- Full-width, background: `--color-black-05`
- Padding: `var(--space-3) var(--space-6)`
- Text: `--text-caption`, uppercase, `--tracking-wide`
- Org entries: abbreviation badge (bold) + full name
- Layout: horizontal flex, wrap on mobile

### Vertical UA Stripe

- Width: 6px
- Height: ~200px (or percentage of hero height)
- Position: absolute, right edge of hero content area
- Background: `linear-gradient(to bottom, var(--color-ua-blue), var(--color-ua-yellow))`
- Border-radius: 3px (fully rounded for capsule shape)

### Breadcrumbs

- Font: `--text-sm`, `--font-book`
- Separator: ` › ` (right-pointing angle)
- Current page: `--color-text-primary`, no link
- Parent pages: `--color-link`, underline on hover
- Margin-bottom: `var(--space-6)`

### Form Fields

- Border: `1px solid var(--color-border)`
- Border-radius: `var(--radius-lg)`
- Padding: `var(--space-3) var(--space-4)` (12px 16px)
- Font: `--text-base`
- Focus (when active): `border-color: var(--color-black)` + subtle shadow
- Label: above field, `--text-sm`, `--font-medium`, margin-bottom `var(--space-1)`

### Primary Button

- Background: `var(--color-black)`
- Text: white, `--font-medium`, `--text-base`
- Padding: `var(--space-3) var(--space-6)` (12px 24px)
- Border-radius: `var(--radius-lg)`
- Arrow suffix: ` →`
- Hover: subtle lightening or shadow
- Disabled (Phase 1): `opacity: 0.5`, `cursor: not-allowed`

### Ghost Button (Save draft)

- Background: transparent
- Border: `1px solid var(--color-border)`
- Text: `--color-text-primary`, `--font-medium`
- Same padding/radius as primary

### Shareable Link Box

- Background: `--color-black` (dark)
- Border-radius: `var(--radius-lg)`
- Padding: `var(--space-4) var(--space-6)`
- Overline label: "YOUR SHAREABLE LINK" in `--color-ua-blue`, `--text-caption`, uppercase
- URL text: white/light, `--text-base`, monospace-ish or regular
- Copy button: small pill, white background, dark text

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (Register) | Continue to payment → |
| Primary CTA (Fundraise) | Publish page → |
| Secondary CTA (Fundraise) | Save draft |
| Track A link | See tiers → |
| Track B link | Create my page → |
| Preview banner | Registration opens soon. This is a preview of the registration experience. |
| Stat empty state (Raised) | — |
| Stat empty state (Goal) | 0% |
| Stat empty state (Participants) | 0 |
| Stat empty state (Donors) | 0 |
| GDPR consent | **GDPR consent (required)**. I agree to my data being processed for the purpose of race registration and safety, in line with the privacy notice. |
| Communications opt-in | **Ongoing communications (optional)**. Send me news about future editions and the beneficiary's work. I can unsubscribe at any time. |
| Fee bar label | WHERE IT GOES |
| Beneficiary line | Beneficiary: Hurkit – charging stations for defenders ↗ |
| Event description | Humanitarian demining of liberated Ukrainian territory — clearing farmland, homes and schools so displaced families can return home safely. |
| Track A title | Run or Donate |
| Track A subtitle | Register at one of three tiers. Your fee covers the race pack and directly funds demining — no fundraising required. |
| Track B title | Raise Funds and Run |
| Track B subtitle | Get a personal fundraising page. Share it with your network. Every donation counts toward your tier and the collective goal. |

---

## Responsive Breakpoints

| Breakpoint | Token | Layout Changes |
|------------|-------|----------------|
| < 640px (mobile) | — | Single column everything, stat cards 2×2, tier cards stacked, form single column |
| 640px–1024px (tablet) | — | Stat cards 2×2, tier cards 2+1 or scrollable row, form 2-col |
| > 1024px (desktop) | — | Full layout: stats 4-col, tiers 3-col, form 2-col, track cards side-by-side |

Mobile-first approach: all components default to mobile layout, expand at breakpoints.

No horizontal scroll at 320px viewport (per success criteria #6).

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Skip to content | Already in root layout (existing) |
| Heading hierarchy | h1 per page (event title / page title), h2 for sections, h3 for cards |
| Color contrast | All text meets WCAG AA (--color-text-primary on white = 16.5:1) |
| UA Blue on white | #005BBB on #ffffff = 5.1:1 ✓ (AA for normal text) |
| Focus indicators | Existing amber focus ring (`--focus-ring`) |
| Form labels | All fields have visible `<label>` elements, connected via htmlFor |
| Disabled state | `aria-disabled="true"` on preview forms, not just visual opacity |
| Progress bar | `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Stat cards | Semantic structure: label as `<dt>`, value as `<dd>` (description list) |
| Images | Alt text on all decorative elements or `aria-hidden="true"` |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| N/A | none | not applicable — no component registry |

This project uses custom CSS Modules components. No third-party UI component registry.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — All CTAs are verb+noun, empty/preview states defined, GDPR/consent copy prescriptive
- [x] Dimension 2 Visuals: PASS — Layout diagrams for all 3 pages, component specs with exact tokens, responsive breakpoints defined
- [x] Dimension 3 Color: PASS — 60/30/10 split with existing palette, UA accent reserved for 5 specific uses, contrast ratios verified
- [x] Dimension 4 Typography: PASS — Uses existing token scale, roles mapped to specific tokens, overline pattern fully declared
- [x] Dimension 5 Spacing: PASS — All values from project's 4px-base scale, usage documented per token, no non-standard values
- [x] Dimension 6 Registry Safety: PASS — No component registry (CSS Modules project), no third-party dependencies

**Approval:** approved 2026-07-28
