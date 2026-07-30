---
phase: 5
plan_id: "03"
title: "Dutch (NL) & German (DE) Locales — Full Translations"
wave: 1
depends_on: []
files_modified:
  - src/locales/nl.ts
  - src/locales/de.ts
requirements_addressed: []
autonomous: true
---

# Plan 03: Dutch (NL) & German (DE) Locales — Full Translations

## Objective

Populate `src/locales/nl.ts` and `src/locales/de.ts` with complete translations for all ~170 keys each, replacing the empty-string stubs created by Phase 4. While I18N-01/I18N-02 only require FR and UK, the CONTEXT decision D-02 expands scope to cover all four locale stubs created by Phase 4.

## Tasks

<task id="03.1">
<title>Populate nl.ts with complete Dutch translations</title>
<read_first>
- src/locales/en.ts
- src/locales/types.ts
- src/locales/nl.ts
- src/data/event.ts
- .planning/phases/05-i18n-translations/05-CONTEXT.md
</read_first>
<action>
Replace the stub content in `src/locales/nl.ts` with a fully populated locale object. Every key from `en.ts` must have a Dutch translation. The file must export `const nl` with `satisfies Locale`.

**Translation guidelines (from CONTEXT decisions):**
- **Language:** Standard Dutch — natural for Belgian Dutch (Flemish) audience, the event is in Brussels (D-02)
- **Tone:** Warm and purposeful — solidarity, community action, making a difference together (D-04)
- **Brand name:** "Run for Ukraine" stays in English (D-06)
- **Currency:** Always EUR with € symbol (D-07)
- **Dates:** Dutch format — "23 augustus 2026" (D-08)
- **Beneficiary:** "Hurkit" kept as name; translate description — "Hurkit — oplaadstations voor verdedigers" (D-10)
- **Organisation names:** Keep in original form (D-11)
- **Interpolation:** Preserve `{variableName}` placeholders exactly as in EN

**Key namespaces:** Same as Plans 01/02 — all ~170 keys across hero, tracks, progress, register, tierCard, fundraise, confirmation, fundraiser, donorWall, event, social, common, closed, errors.
</action>
<acceptance_criteria>
- `src/locales/nl.ts` exports `const nl` with `satisfies Locale`
- Zero empty-string values — every key has a non-empty Dutch translation
- All `{variableName}` interpolation placeholders from EN are preserved exactly
- "Run for Ukraine" appears in English (not translated)
- "Hurkit" name kept, description translated to Dutch
- Organisation names kept in original English form
- `npx tsc --noEmit` passes with no errors in `src/locales/nl.ts`
</acceptance_criteria>
</task>

<task id="03.2">
<title>Populate de.ts with complete German translations</title>
<read_first>
- src/locales/en.ts
- src/locales/types.ts
- src/locales/de.ts
- src/data/event.ts
- .planning/phases/05-i18n-translations/05-CONTEXT.md
</read_first>
<action>
Replace the stub content in `src/locales/de.ts` with a fully populated locale object. Every key from `en.ts` must have a German translation. The file must export `const de` with `satisfies Locale`.

**Translation guidelines (from CONTEXT decisions):**
- **Language:** Standard German (Hochdeutsch) (D-02)
- **Register:** Formal "Sie" — consistent with the formal register choice across locales
- **Tone:** Warm and purposeful — solidarity, community action, making a difference together (D-04)
- **Brand name:** "Run for Ukraine" stays in English (D-06)
- **Currency:** Always EUR with € symbol (D-07)
- **Dates:** German format — "23. August 2026" (D-08)
- **Beneficiary:** "Hurkit" kept as name; translate description — "Hurkit — Ladestationen für Verteidiger" (D-10)
- **Organisation names:** Keep in original form (D-11)
- **Interpolation:** Preserve `{variableName}` placeholders exactly as in EN

**Key namespaces:** Same as Plans 01/02 — all ~170 keys across hero, tracks, progress, register, tierCard, fundraise, confirmation, fundraiser, donorWall, event, social, common, closed, errors.
</action>
<acceptance_criteria>
- `src/locales/de.ts` exports `const de` with `satisfies Locale`
- Zero empty-string values — every key has a non-empty German translation
- All `{variableName}` interpolation placeholders from EN are preserved exactly
- "Run for Ukraine" appears in English (not translated)
- GDPR consent text uses formal "Sie" register
- "Hurkit" name kept, description translated to German
- Organisation names kept in original English form
- `npx tsc --noEmit` passes with no errors in `src/locales/de.ts`
</acceptance_criteria>
</task>

## Verification

```bash
npx tsc --noEmit
```

TypeScript typecheck validates that both nl.ts and de.ts satisfy the Locale interface — all keys present, no type errors.

## must_haves

- All ~170 keys from en.ts have non-empty Dutch translations in nl.ts (D-02)
- All ~170 keys from en.ts have non-empty German translations in de.ts (D-02)
- Warm, purposeful tone for charity communications (D-04)
- "Run for Ukraine" brand name in English across all strings (D-06)
- Interpolation placeholders preserved exactly (functional correctness)
- Strict Locale type satisfaction — no Partial<>, no missing keys (D-13)
