---
phase: 5
plan_id: "04"
title: "Content Fix: Plast Removal & Cross-Locale Verification"
wave: 2
depends_on: ["01", "02", "03"]
files_modified:
  - src/data/event.ts
requirements_addressed: []
autonomous: true
---

# Plan 04: Content Fix: Plast Removal & Cross-Locale Verification

## Objective

Audit and fix any remaining Plast co-organiser references (CONTEXT D-12), then verify all four locale files pass typecheck and have no empty strings or broken interpolation placeholders. This wave-2 plan runs after all translations are populated.

## Tasks

<task id="04.1">
<title>Audit and remove Plast from co-organiser data</title>
<read_first>
- src/data/event.ts
- src/components/ui/CoOrganiserBar.tsx
- src/locales/en.ts
- .planning/phases/05-i18n-translations/05-CONTEXT.md
</read_first>
<action>
Verify that Plast does NOT appear in the `coOrganisers` array in `src/data/event.ts`. Search all source files for any string references to "Plast" — including locale files, component files, and data files. If any Plast references are found, remove them.

Per CONTEXT D-12: "Plast is NOT an official co-organiser. Individual volunteers from Plast contribute, but the organisation doesn't officially support the event."

Expected state: The current `coOrganisers` array contains only EUB, UV, and ER — no Plast entry. This task confirms that state and removes any other references discovered by the search.
</action>
<acceptance_criteria>
- `src/data/event.ts` `coOrganisers` array does NOT contain any entry with "Plast"
- No source files in `src/` contain "Plast" as a co-organiser reference
- If Plast was found and removed, the change does not break any imports or type constraints
</acceptance_criteria>
</task>

<task id="04.2">
<title>Cross-locale verification — typecheck and completeness</title>
<read_first>
- src/locales/en.ts
- src/locales/fr.ts
- src/locales/uk.ts
- src/locales/nl.ts
- src/locales/de.ts
- src/locales/types.ts
- src/locales/index.ts
</read_first>
<action>
Run the full TypeScript typecheck to verify all locale files satisfy the Locale interface:

```bash
npx tsc --noEmit
```

Additionally, verify at the source level:
1. No locale file contains empty-string values (`""`) — every key must have a non-empty translation
2. All interpolation placeholders from `en.ts` (pattern: `{variableName}`) are preserved in each locale file — count occurrences of each placeholder per key and verify parity
3. "Run for Ukraine" is not translated — verify the English brand name appears in all locale files where the EN version contains it
4. The `t()` helper function works correctly with all locales — importing from `@/locales` and calling `t()` with each locale set returns non-empty strings for all keys

If any issues are found, fix them in the affected locale file(s).
</action>
<acceptance_criteria>
- `npx tsc --noEmit` exits with code 0 (zero type errors)
- `npm run build` succeeds (static export works with all locale files)
- Zero empty-string values across fr.ts, uk.ts, nl.ts, de.ts
- All `{variableName}` placeholders from en.ts appear in corresponding keys of each locale
- "Run for Ukraine" appears untranslated in all locales where EN uses it
</acceptance_criteria>
</task>

## Verification

```bash
npx tsc --noEmit && npm run build
```

Both typecheck and build must pass. Typecheck confirms key completeness (D-13, D-14). Build confirms the full static export works with populated locale files.

## must_haves

- No Plast references in co-organiser data or locale files (D-12)
- TypeScript typecheck passes for all locale files (D-13, D-14)
- Build succeeds — static export unbroken by translation additions (D-14)
- No empty strings remaining in any non-EN locale file (D-02)
- Interpolation placeholder parity across all locales (functional correctness)
