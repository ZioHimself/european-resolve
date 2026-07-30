---
phase: 5
plan_id: "01"
title: "French (FR) Locale — Belgian French Translations"
wave: 1
depends_on: []
files_modified:
  - src/locales/fr.ts
requirements_addressed:
  - I18N-01
autonomous: true
---

# Plan 01: French (FR) Locale — Belgian French Translations

## Objective

Populate `src/locales/fr.ts` with complete Belgian French translations for all ~170 keys, replacing the empty-string stub created by Phase 4. The translations must use formal register (vous), Belgian French localisms (septante, nonante), warm and purposeful tone aligned with charity/NGO communications, and keep the "Run for Ukraine" brand name in English.

## Tasks

<task id="01.1">
<title>Populate fr.ts with complete Belgian French translations</title>
<read_first>
- src/locales/en.ts
- src/locales/types.ts
- src/locales/index.ts
- src/locales/fr.ts
- src/data/event.ts
- .planning/phases/05-i18n-translations/05-CONTEXT.md
</read_first>
<action>
Replace the stub content in `src/locales/fr.ts` with a fully populated locale object. Every key from `en.ts` must have a French translation. The file must export `const fr` with `satisfies Locale`.

**Translation guidelines (from CONTEXT decisions):**
- **Register:** Formal "vous" throughout (D-03)
- **Dialect:** Belgian French — use "septante" (70), "nonante" (90) where numbers appear; GSM-style localisms where natural (D-09)
- **Tone:** Warm and purposeful — solidarity, community action, making a difference together. Not corporate, not overly sporty (D-04)
- **Brand name:** "Run for Ukraine" stays in English — never translate (D-06)
- **Currency:** Always EUR with € symbol, same format as EN (D-07)
- **Dates:** Belgian French format — "23 août 2026" (D-08)
- **Beneficiary:** "Hurkit" kept as name; translate description — "Hurkit — stations de recharge pour les défenseurs" (D-10)
- **Organisation names:** Keep in original form — "Embassy of Ukraine in Belgium", "Ukrainian Voices", "European Resolve" (D-11)
- **Interpolation:** Preserve `{variableName}` placeholders exactly as in EN (e.g., `{price}`, `{amount}`, `{id}`, `{name}`, `{goal}`, `{total}`, `{count}`, `{max}`, `{tierName}`, `{raised}`, `{title}`)

**Key namespaces to translate:**
- `hero.*` — Hero section (overline, beneficiary label)
- `tracks.*` — Track A/B (titles, descriptions, features, CTAs)
- `progress.*` — Progress labels, bar label with interpolation
- `register.*` — Full registration flow: page headers, form fields, GDPR consent (runner/supporter variants), error messages, confirmation flow, payment confirmation
- `tierCard.*` — Badge text, select/selected buttons
- `fundraise.*` — 3-step wizard: step labels, headings, form fields, review labels, validation errors, submit button
- `confirmation.*` — Fundraiser confirmation: shareable/edit links, registration section, payment flow
- `fundraiser.*` — Fundraiser page: not-found, draft banner, goal labels, donate/share headings
- `donorWall.*` — Donor wall: heading, empty state, gate button, form labels, errors
- `event.*` — Co-organiser label
- `social.*` — Share button labels, share message template
- `common.*` — Loading, char count, optional label
- `closed.*` — Post-event mode: completed banner, closed messages, results labels, impact statement
- `errors.*` — All VALIDATION_* error code translations
</action>
<acceptance_criteria>
- `src/locales/fr.ts` exports `const fr` with `satisfies Locale`
- Zero empty-string values — every key has a non-empty French translation
- All `{variableName}` interpolation placeholders from EN are preserved exactly
- "Run for Ukraine" appears in English (not translated to "Course pour l'Ukraine")
- GDPR consent text uses "vous" formal register
- "Hurkit" name kept, description translated to French
- Organisation names kept in original English form
- `npx tsc --noEmit` passes with no errors in `src/locales/fr.ts`
</acceptance_criteria>
</task>

## Verification

```bash
npx tsc --noEmit
```

TypeScript typecheck validates that fr.ts satisfies the Locale interface — all keys present, no type errors. Since the Locale type enforces the exact key set, a passing typecheck confirms 100% key coverage.

## must_haves

- All ~170 keys from en.ts have non-empty French translations (D-02, I18N-01)
- Belgian French register with "vous" formality (D-03, D-09)
- Warm, purposeful tone for charity communications (D-04)
- "Run for Ukraine" brand name in English across all strings (D-06)
- Interpolation placeholders preserved exactly (functional correctness)
- Strict Locale type satisfaction — no Partial<>, no missing keys (D-13)
