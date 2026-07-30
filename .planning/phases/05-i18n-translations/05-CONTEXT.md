# Phase 5: i18n Translations - Context

**Gathered:** 2026-07-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Populate French (FR), Ukrainian (UK), Dutch (NL), and German (DE) locale files with complete, AI-generated translations for all user-facing strings in the Run for Ukraine event pages — making the platform fully multilingual. Phase 4 creates the i18n structure (locale files, `t()` helper, EN populated, stubs for other locales); this phase fills those stubs with production-quality translations.

</domain>

<decisions>
## Implementation Decisions

### Translation Source & Production
- **D-01:** Translations are AI-generated (by Claude) as-is — no human review step before merge. Quality is good enough for launch; can be refined later if needed.
- **D-02:** All four locale stubs (NL, FR, DE, UK) are populated in this phase — expanding scope beyond the original FR/UK roadmap to cover all locales created by Phase 4.

### Content Voice & Formality
- **D-03:** French uses 'vous' (formal) throughout — standard for charity/NGO communications, respectful and inclusive of all participants.
- **D-04:** Overall tone across all locales: warm and purposeful — emphasis on solidarity, community action, making a difference together. Not overly formal/corporate, not overly sporty/casual.
- **D-05:** Ukrainian: standard modern Ukrainian with direct, clear cause framing. State the cause plainly (charging stations for defenders, demining) — no euphemisms, no excessive emotional manipulation.
- **D-06:** 'Run for Ukraine' stays in English across all locales as the event brand name — not translated.

### Locale-Specific Adaptations
- **D-07:** Currency display: always show EUR with € symbol, same format across all locales. The event is in Brussels; all prices are in EUR.
- **D-08:** Date formatting: locale-standard spelled-out format — '23 août 2026' (FR), '23 серпня 2026' (UK), '23 augustus 2026' (NL), '23. August 2026' (DE).
- **D-09:** French is Belgian French — use local terms where they differ (e.g., 'septante' not 'soixante-dix').
- **D-10:** Beneficiary: keep 'Hurkit' as the name, translate the description per locale (e.g., 'Hurkit — stations de recharge pour les défenseurs' in FR, 'Hurkit — зарядні станції для захисників' in UK).
- **D-11:** Organisation names kept in original form across all locales (proper nouns).
- **D-12:** **IMPORTANT:** Plast is NOT an official co-organiser. Individual volunteers from Plast contribute, but the organisation doesn't officially support the event. Remove Plast from co-organiser listings across ALL locales including EN.

### Completeness & Correctness
- **D-13:** Strict TypeScript typing — each locale file must satisfy the same type as EN. Missing keys cause a build/type error. No Partial<> fallbacks.
- **D-14:** TypeScript typecheck is sufficient for validation — if types pass, all keys are present. No separate per-locale build needed.
- **D-15:** No special UI validation for text length — trust existing responsive CSS (text-wrap, overflow) to handle longer FR/DE translations.

### Claude's Discretion
- String interpolation approach (template functions vs placeholder tokens) — pick whichever integrates cleanly with the existing `t()` helper from Phase 4
- Translation style decisions within the defined tone (warm, purposeful, formal-vous for FR, direct for UK)
- Handling of pluralization rules per locale
- Any locale-specific number formatting within the EUR constraint

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture
- `.planning/PROJECT.md` — project overview, constraints, event details
- `.planning/REQUIREMENTS.md` — I18N-01 (FR), I18N-02 (UK) requirements; v1 requirement context
- `.planning/ROADMAP.md` — Phase 5 success criteria (6 items)

### Prior Phase Context (i18n architecture decisions)
- `.planning/phases/04-polish-communications-post-event-readiness/04-CONTEXT.md` — i18n file format decisions (D-01 to D-06): TypeScript locale objects, flat dot-notation keys, `t()` helper, scope limited to event pages (~15 components), locale stubs for EN/NL/FR/DE/UK

### Existing Frontend Code (locale consumers)
- `src/app/events/2026-run-for-ukraine/page.tsx` — Event landing page
- `src/app/events/2026-run-for-ukraine/register/page.tsx` — Registration page
- `src/app/events/2026-run-for-ukraine/fundraise/page.tsx` — Fundraise form page
- `src/app/events/2026-run-for-ukraine/fundraiser/page.tsx` — Fundraiser page
- `src/components/ui/EventHero.tsx` — Hero section strings
- `src/components/ui/TierGrid.tsx` / `TierCard.tsx` — Tier names, descriptions, rewards
- `src/components/ui/RegistrationForm.tsx` — Form labels, validation messages, placeholders
- `src/components/ui/FundraiseForm.tsx` — Fundraise form strings
- `src/components/ui/ProgressSection.tsx` — Progress labels, stats
- `src/components/ui/TrackCards.tsx` — Track descriptions, CTAs
- `src/components/ui/DonorWall.tsx` / `DonorWallForm.tsx` — Donor wall strings
- `src/components/ui/SocialShareButtons.tsx` — Share button labels
- `src/components/ui/CoOrganiserBar.tsx` — Co-organiser section (NOTE: remove Plast)

### i18n Structure (created by Phase 4)
- `src/locales/en.ts` — English base locale (source of truth for all keys)
- `src/locales/fr.ts` — French stub to populate
- `src/locales/uk.ts` — Ukrainian stub to populate
- `src/locales/nl.ts` — Dutch stub to populate
- `src/locales/de.ts` — German stub to populate

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/locales/en.ts`: English locale (created by Phase 4) — the master key list. All other locales must match this structure exactly.
- Phase 4's `t()` helper function — translation lookup mechanism already in place
- Phase 4's language switcher (I18N-03) — already renders locale selection UI

### Established Patterns
- Static data as typed TypeScript objects in `src/data/` — locale files follow the same pattern
- CSS Modules with responsive design — handles text length variations without special work
- Flat dot-notation keys (from Phase 4 D-03): `'hero.title'`, `'register.tierSupporter'`, etc.

### Integration Points
- Locale files in `src/locales/{fr,uk,nl,de}.ts` — replace stub content with full translations
- Type must satisfy same interface as `en.ts` — strict typing enforced
- CoOrganiserBar component — must remove Plast from co-organiser data (affects all locales)
- Date formatting per locale within the existing `t()` helper or a dedicated format function

</code_context>

<specifics>
## Specific Ideas

- Belgian French specifically (septante, nonante) — the event is Brussels-based, audience is Belgian
- Standard modern Ukrainian — no special diaspora adaptations, no bilingual hints
- Direct cause framing in Ukrainian — "зарядні станції для захисників" not euphemisms
- Organisation names stay in original form — "Embassy of Ukraine in Belgium" not translated to each locale
- 'Run for Ukraine' is the brand name — never translated, appears in English in all locales

</specifics>

<deferred>
## Deferred Ideas

- **Plast co-organiser removal** — D-12 flags that Plast should be removed from co-organiser listings. This is a content fix that affects the EN data source (likely `src/data/event.ts` or `CoOrganiserBar`). If Phase 4 hasn't already addressed this, it should be handled as part of Phase 5's translation work or as a separate quick fix.

</deferred>

---

*Phase: 5-i18n Translations*
*Context gathered: 2026-07-30*
