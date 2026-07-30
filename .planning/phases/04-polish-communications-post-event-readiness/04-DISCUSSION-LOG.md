# Phase 4: Polish, Communications & Post-Event Readiness - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-29
**Phase:** 4-Polish, Communications & Post-Event Readiness
**Areas discussed:** i18n file format & structure, Post-event trigger & UX, Archive page content

---

## i18n File Format & Structure

### Locale file format

| Option | Description | Selected |
|--------|-------------|----------|
| TypeScript locale objects | e.g. src/locales/en.ts. Matches existing typed data convention. Type-safe, auto-complete. | ✓ |
| JSON locale files | e.g. src/locales/en.json. Industry standard. Tooling-friendly for translators. | |
| You decide | Claude picks best fit | |

**User's choice:** TypeScript locale objects
**Notes:** Consistent with the project's convention of typed TypeScript objects in src/data/

### Extraction scope

| Option | Description | Selected |
|--------|-------------|----------|
| Event pages only | Extract strings from Run for Ukraine pages and ~15 components. Main site stays as-is. | ✓ |
| Full site | Extract all strings across entire site including Nav, Footer, Home, Team pages. | |
| You decide | Claude picks | |

**User's choice:** Event pages only

### Key organization

| Option | Description | Selected |
|--------|-------------|----------|
| Organized by page/section | Nested objects matching component tree (e.g. { hero: { title: '...' } }) | |
| Flat namespace | Dot-notation keys (e.g. 'hero.title', 'register.tierSupporter') | ✓ |
| One file per component | Co-located locale files (e.g. EventHero.locale.ts) | |
| You decide | Claude picks | |

**User's choice:** Flat namespace

### String consumption

| Option | Description | Selected |
|--------|-------------|----------|
| Direct import + helper | Components import t() from @/locales. No context provider. Works with static export. | ✓ |
| React Context provider | LocaleProvider wraps app, useLocale() hook. Supports runtime locale switching. | |
| You decide | Claude picks | |

**User's choice:** Direct import + t() helper

### Supported locales

| Option | Description | Selected |
|--------|-------------|----------|
| EN, NL, FR, DE | European audience focus | |
| EN, NL, FR, DE, UK | User's list plus Ukrainian from original requirements | ✓ |
| EN, FR, UK | Original requirements (French + Ukrainian only) | |

**User's choice:** EN, NL, FR, DE, UK
**Notes:** User initiated this question (freeform input). EN populated, other 4 as empty stubs.

### Backend i18n

| Option | Description | Selected |
|--------|-------------|----------|
| Error codes from backend, text on frontend | Backend returns machine-readable codes. Frontend maps to locale strings. | ✓ |
| Backend returns localized text | Frontend sends Accept-Language, backend picks message. | |
| Skip backend i18n | Backend keeps English, frontend overrides. | |
| You decide | Claude picks | |

**User's choice:** Error codes from backend, text on frontend
**Notes:** User also asked which phase does actual translation — confirmed it's v2 scope, Phase 4 only builds the structure.

---

## Post-Event Trigger & UX

### Trigger mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Environment variable | NEXT_PUBLIC_EVENT_STATUS=completed. Requires rebuild. Matches existing env var pattern. | ✓ |
| Date-based auto-switch | Compares current date to event date. Automatic but hard to test. | |
| Config file toggle | Status field in src/data/event.ts. Requires code change + deploy. | |
| You decide | Claude picks | |

**User's choice:** Environment variable

### Post-event landing page UX

| Option | Description | Selected |
|--------|-------------|----------|
| Banner + disabled forms | "Event completed" banner at top, forms hidden/replaced | |
| Full results page | Replace entire layout with dedicated results view | |
| Minimal change | Just disable CTAs, add small notice | |
| You decide | Claude picks | |

**User's choice:** (Freeform) Full results page transformation — dedicated results view with hero totals, event gallery, thank-you message, inline accountability report. Individual fundraiser pages stay accessible but with donations and commenting disabled.

### Accountability report format

| Option | Description | Selected |
|--------|-------------|----------|
| Inline section on results page | Dedicated section with total raised, fund usage, beneficiary update, evidence | ✓ |
| Separate accountability page | New route with detailed breakdown | |
| Link to external report | Link to PDF/external page from beneficiary | |
| You decide | Claude picks | |

**User's choice:** Inline section on results page

### Event photo gallery source

| Option | Description | Selected |
|--------|-------------|----------|
| Static images in public/ | Photos manually added after event. Static grid. | |
| Google Drive | Fetch from shared Drive folder. Reuses Phase 3 Drive integration. | ✓ |
| Placeholder only | Gallery component with placeholder content. | |
| You decide | Claude picks | |

**User's choice:** Google Drive
**Notes:** User also confirmed Phase 4.1 covers emails separately (registration confirmation emails).

---

## Archive Page Content

### Register/fundraise routes

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect to landing page | Routes redirect to results page | |
| "Closed" message page | Keep routes with notice + link back | |
| Remove entirely | Routes return 404 | |
| You decide | Claude picks | |

**User's choice:** (Freeform) Separate fate — /register shows "Registration is closed", /fundraise shows "Fundraiser creation is closed". Individual fundraiser pages stay accessible without donations/comments.

### Progress section behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Frozen final totals | Shows final numbers, stops polling API | ✓ |
| Keep polling | Continues to fetch live data | |
| Hardcoded final values | Replace with static numbers in config | |
| You decide | Claude picks | |

**User's choice:** Frozen final totals

### Events list appearance

| Option | Description | Selected |
|--------|-------------|----------|
| Show with "Past event" badge | Event card shows "Completed" badge, links to results | |
| Keep as-is | No visual change, event links to results page | ✓ |
| Separate "Past Events" section | New section below active events | |
| You decide | Claude picks | |

**User's choice:** Keep as-is
**Notes:** User clarified: Run for Ukraine will be added to the events spreadsheet as a regular entry with a link to the dedicated pages. Two systems stay independent.

---

## Claude's Discretion

- t() helper implementation (fallback behavior, interpolation syntax)
- Locale file directory structure within src/locales/
- Post-event results page layout and component structure
- Gallery component (grid, sizing, lazy loading)
- Post-event state detection across routes (shared hook or per-component)
- Backend error code naming convention
- String extraction decisions (which strings are extractable vs too coupled to JSX)

## Deferred Ideas

- **Comprehensive test coverage** — Backend zero tests, frontend event components untested. Separate dedicated effort.
- **Actual translations (NL, FR, DE, UK)** — v2 scope (I18N-01/02/03 + NL/DE additions)
- **Language switcher UI** — I18N-03 (v2)
- **Post-event survey** — POST-03 (v2)
- **Social sharing at completion** — POST-04 (v2)
- **Embeddable progress widget** — ADVN-01 (v2)
