---
phase: 4
plan_id: "01"
title: "i18n Infrastructure — Locale Files, Types & t() Helper"
wave: 1
depends_on: []
files_modified:
  - src/locales/types.ts
  - src/locales/en.ts
  - src/locales/nl.ts
  - src/locales/fr.ts
  - src/locales/de.ts
  - src/locales/uk.ts
  - src/locales/index.ts
requirements_addressed: []
autonomous: true
---

# Plan 01: i18n Infrastructure — Locale Files, Types & t() Helper

## Objective

Create the i18n locale file structure, TypeScript type system, and `t()` helper function that all event page components will use for string lookup. English fully populated with all extractable strings; NL/FR/DE/UK created as stubs with identical key structure.

## Tasks

<task id="01.1">
<title>Create locale type definition</title>
<read_first>
- src/data/event.ts
- src/components/ui/EventHero.tsx
- src/components/ui/TrackCards.tsx
- src/components/ui/ProgressSection.tsx
- src/components/ui/RegistrationForm.tsx
- src/components/ui/FundraiseForm.tsx
- src/components/ui/FundraiserPage.tsx
- src/components/ui/FundraiserConfirmation.tsx
- src/components/ui/DonorWallForm.tsx
- src/components/ui/TierCard.tsx
- src/components/ui/registerTypes.ts
</read_first>
<action>
Create `src/locales/types.ts` with a `Locale` interface using flat dot-notation keys organized by namespace:
- `hero.*` — EventHero strings
- `tracks.*` — TrackCards strings (track A/B titles, descriptions, features, CTAs)
- `progress.*` — ProgressSection labels
- `register.*` — Registration page header, participation type toggle ("I'll run on the day" / "I'll support from anywhere"), form fields, conditional GDPR text (runner vs supporter variants), dynamic submit button text, error summary, validation messages, confirmation
- `fundraise.*` — Fundraise wizard step labels ("1. Your page", "2. Runner details", "3. Review"), step headings, form fields, validation messages, navigation buttons ("Next: Runner details →", "← Back"), review section labels (all review key/value pairs), combined submit button ("Create page and register — €{price}")
- `confirmation.*` — Fundraiser confirmation: success heading, shareable/edit links, copy buttons; runner registration section (participant ID, tier, amount, rewards heading); payment flow (heading, instructions, confirm button states, confirmed banner)
- `tierCard.*` — "Most chosen" badge, "Selected"/"Select" button text
- `fundraiser.*` — Fundraiser page labels (not found, draft banner, donate heading, share heading, goal labels)
- `donorWall.*` — Donor wall form labels, gate button, thank-you
- `event.*` — Landing page strings (cause description, beneficiary text)
- `common.*` — Shared strings (loading, error, characters count, "Copied!", optional label)
- `closed.*` — Post-event closed banners and results page content
- `errors.*` — Backend error code mappings (VALIDATION_* codes including VALIDATION_PARTICIPATION_TYPE_REQUIRED)

Export as `export type Locale = { [key: string]: string }` with a Record type that enforces all keys present.
</action>
<acceptance_criteria>
- `src/locales/types.ts` exists and exports a `Locale` type
- Type uses `Record<string, string>` pattern with explicit key literal union OR a typed object interface
- All namespace prefixes listed above are represented in the type
- File compiles without TypeScript errors (`npx tsc --noEmit` passes for this file)
</acceptance_criteria>
</task>

<task id="01.2">
<title>Create English locale file (fully populated)</title>
<read_first>
- src/locales/types.ts
- src/components/ui/EventHero.tsx
- src/components/ui/TrackCards.tsx
- src/components/ui/ProgressSection.tsx
- src/app/events/2026-run-for-ukraine/page.tsx
- src/app/events/2026-run-for-ukraine/register/page.tsx
- src/app/events/2026-run-for-ukraine/fundraise/page.tsx
- src/components/ui/FundraiseForm.tsx
- src/components/ui/FundraiserPage.tsx
- src/components/ui/FundraiserConfirmation.tsx
- src/components/ui/DonorWallForm.tsx
- src/components/ui/RegistrationForm.tsx
- src/components/ui/ConfirmationPanel.tsx
- src/components/ui/TierCard.tsx
- src/components/ui/registerTypes.ts
- src/data/event.ts
</read_first>
<action>
Create `src/locales/en.ts` that exports a `const en` object satisfying the `Locale` type. Populate every key with the current English string extracted from the components listed in read_first. Use `satisfies Locale` for type safety with inference.

Key areas requiring special attention:
- FundraiseForm.tsx is a 3-step wizard: extract step indicator labels, step headings, all review section key/value labels, navigation buttons, and the combined submit button text
- FundraiserConfirmation.tsx has a full registration section with payment flow: participant ID, tier/amount display, rewards heading, WhyDonate payment instructions, confirm button states, confirmed banner
- RegistrationForm.tsx has participation type toggle strings ("I'll run on the day" / "I'll support from anywhere"), conditional GDPR text (runner vs supporter), dynamic submit button text variants, error summary heading
- TierCard.tsx has "Most chosen" badge and "Selected"/"Select" button text

Interpolation syntax: `{variableName}` for dynamic values (e.g., `"progress.raised": "€{amount} raised"`).
</action>
<acceptance_criteria>
- `src/locales/en.ts` exists and exports `en` object with `satisfies Locale`
- Every namespace prefix from the type has at least one key populated
- All hardcoded English strings from the ~15 event components are represented (~130-150 keys total)
- Wizard step labels, review keys, participation toggle, and payment flow strings are all included
- No empty string values in the English locale
- TypeScript compiles without errors
</acceptance_criteria>
</task>

<task id="01.3">
<title>Create locale stubs (NL, FR, DE, UK)</title>
<read_first>
- src/locales/types.ts
- src/locales/en.ts
</read_first>
<action>
Create `src/locales/nl.ts`, `src/locales/fr.ts`, `src/locales/de.ts`, `src/locales/uk.ts`. Each exports a `const {locale}` object with the same keys as `en.ts` but all values set to empty strings `""`. Each file uses `satisfies Locale` to ensure key parity with the type.
</action>
<acceptance_criteria>
- All four stub files exist: `nl.ts`, `fr.ts`, `de.ts`, `uk.ts`
- Each exports a named constant (`nl`, `fr`, `de`, `uk`) with `satisfies Locale`
- Key count matches `en.ts` exactly (TypeScript enforces this via the type)
- All values are empty strings `""`
- TypeScript compiles without errors
</acceptance_criteria>
</task>

<task id="01.4">
<title>Create t() helper and locale index</title>
<read_first>
- src/locales/types.ts
- src/locales/en.ts
</read_first>
<action>
Create `src/locales/index.ts` that:
1. Imports all locale objects (en, nl, fr, de, uk)
2. Exports a `locales` record mapping locale codes to their objects
3. Exports a `t(key: string, params?: Record<string, string | number>)` function that:
   - Looks up the key in the active locale
   - Falls back to English if value is empty string or key missing
   - Replaces `{variableName}` placeholders with provided params
   - Returns the key itself as last-resort fallback (aids debugging)
4. Exports a `getLocale()` and `setLocale(code: string)` pair for runtime locale switching
5. Default locale is `"en"`

Since this is a static export site, locale state is module-level (singleton). No React Context needed.
</action>
<acceptance_criteria>
- `src/locales/index.ts` exists and exports `t`, `getLocale`, `setLocale`, `locales`
- `t("hero.title")` returns the English string when locale is "en"
- `t("progress.raised", { amount: "500" })` returns interpolated string
- `t("nonexistent.key")` returns `"nonexistent.key"` (key-as-fallback)
- Setting locale to "fr" and calling `t()` for a populated key falls back to English (since FR is stub)
- TypeScript compiles without errors
- No React imports or Context usage
</acceptance_criteria>
</task>

## Verification

```bash
npx tsc --noEmit
```

All locale files compile. The `t()` helper is importable from `@/locales` and ready for component integration in Plan 02.

## must_haves

- Typed locale structure with flat dot-notation keys (D-01, D-03)
- English fully populated, stubs for NL/FR/DE/UK (D-05)
- `t()` helper with interpolation and English fallback (D-04)
- No React Context, works with static export (D-04)
- Direct import from `@/locales` (D-04)
