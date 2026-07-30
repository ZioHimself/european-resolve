---
phase: 4
plan_id: "02"
title: "String Extraction — Migrate Event Components to t() Helper"
wave: 1
depends_on: ["01"]
files_modified:
  - src/components/ui/EventHero.tsx
  - src/components/ui/TrackCards.tsx
  - src/components/ui/ProgressSection.tsx
  - src/components/ui/RegisterClient.tsx
  - src/components/ui/RegistrationForm.tsx
  - src/components/ui/ConfirmationPanel.tsx
  - src/components/ui/FundraiseForm.tsx
  - src/components/ui/FundraiserConfirmation.tsx
  - src/components/ui/FundraiserPage.tsx
  - src/components/ui/DonorWall.tsx
  - src/components/ui/DonorWallForm.tsx
  - src/components/ui/SocialShareButtons.tsx
  - src/components/ui/CoOrganiserBar.tsx
  - src/components/ui/WhyDonateWidget.tsx
  - src/app/events/2026-run-for-ukraine/page.tsx
  - src/app/events/2026-run-for-ukraine/register/page.tsx
  - src/app/events/2026-run-for-ukraine/fundraise/page.tsx
requirements_addressed: []
autonomous: true
---

# Plan 02: String Extraction — Migrate Event Components to t() Helper

## Objective

Replace all hardcoded English strings in Run for Ukraine event page components with `t()` calls from `@/locales`. After this plan, all user-facing text in event pages is driven by the locale system.

## Tasks

<task id="02.1">
<title>Migrate server components to t()</title>
<read_first>
- src/locales/index.ts
- src/locales/en.ts
- src/components/ui/EventHero.tsx
- src/components/ui/TrackCards.tsx
- src/components/ui/CoOrganiserBar.tsx
- src/app/events/2026-run-for-ukraine/page.tsx
- src/app/events/2026-run-for-ukraine/register/page.tsx
- src/app/events/2026-run-for-ukraine/fundraise/page.tsx
</read_first>
<action>
For each server component:
1. Add `import { t } from "@/locales"` at the top
2. Replace hardcoded strings with `t("namespace.key")` or `t("namespace.key", { param: value })`

Specific replacements:
- **EventHero.tsx**: "Charity run · Brussels" → `t("hero.overline")`, description/beneficiary text
- **TrackCards.tsx**: "Choose your track", track titles/descriptions/features/CTAs → `t("tracks.*")`
- **CoOrganiserBar.tsx**: Any heading text → `t("event.coOrganisers")`
- **page.tsx (landing)**: "All donations go directly to..." text → `t("event.causeDescription", {...})`
- **register/page.tsx**: "Track A · Donate or Run", "Pick a tier", subtitle → `t("register.*")`
- **fundraise/page.tsx**: "Track B · Fundraise and Run", "Your fundraising page", subtitle → `t("fundraise.*")`

Keep `metadata` objects in English (SEO — not part of i18n scope per D-02).
</action>
<acceptance_criteria>
- EventHero.tsx contains zero hardcoded English strings in JSX output (data from `eventDetails` excluded — those are content-driven)
- TrackCards.tsx uses `t()` for all UI labels, headings, descriptions
- Landing page.tsx uses `t()` for the cause description paragraph
- Register page.tsx uses `t()` for overline, title, subtitle
- Fundraise page.tsx uses `t()` for overline, title, subtitle
- `npm run build` succeeds (static export still works)
</acceptance_criteria>
</task>

<task id="02.2">
<title>Migrate client form components to t()</title>
<read_first>
- src/locales/index.ts
- src/locales/en.ts
- src/components/ui/RegistrationForm.tsx
- src/components/ui/ConfirmationPanel.tsx
- src/components/ui/FundraiseForm.tsx
- src/components/ui/FundraiserConfirmation.tsx
</read_first>
<action>
For each client component (`'use client'`):
1. Add `import { t } from "@/locales"`
2. Replace hardcoded labels, placeholders, button text, validation messages, and confirmation text with `t()` calls

Specific targets:
- **RegistrationForm.tsx**: Field labels ("Full name", "Email", "Phone"), placeholders, GDPR consent text, submit button text, client-side validation messages
- **ConfirmationPanel.tsx**: "Registration complete" heading, participant ID text, WhyDonate link text, next steps
- **FundraiseForm.tsx**: "Display name", "Personal message", "Personal goal (€)" labels, placeholders, "Save draft"/"Publish page →" buttons, photo upload label, char count format
- **FundraiserConfirmation.tsx**: Success heading, shareable link text, instructions

Keep error messages that come from the backend API as-is for now (Plan 03 handles backend → error codes → t() mapping).
</action>
<acceptance_criteria>
- RegistrationForm.tsx uses `t()` for all labels, placeholders, and button text
- ConfirmationPanel.tsx uses `t()` for all user-facing strings
- FundraiseForm.tsx uses `t()` for all labels, placeholders, buttons, and helper text
- FundraiserConfirmation.tsx uses `t()` for all user-facing strings
- All four components still render correctly in English (visual regression: same output)
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="02.3">
<title>Migrate fundraiser page and donor wall components to t()</title>
<read_first>
- src/locales/index.ts
- src/locales/en.ts
- src/components/ui/FundraiserPage.tsx
- src/components/ui/DonorWall.tsx
- src/components/ui/DonorWallForm.tsx
- src/components/ui/SocialShareButtons.tsx
- src/components/ui/WhyDonateWidget.tsx
- src/components/ui/ProgressSection.tsx
</read_first>
<action>
1. **FundraiserPage.tsx**: Replace "Fundraiser not found", "This page is a draft...", "Donate" heading, "Share this page" heading, "Personal goal:", "Collective total:", "'s page", "Create your own fundraiser →", "Publishing…"/"Publish this page" with `t()` calls
2. **DonorWall.tsx**: Replace any heading text ("Supporter wall" or similar) with `t()`
3. **DonorWallForm.tsx**: Replace "Your name", "Your message" labels, "I've donated — leave a message of support" gate button, "Posting…"/"Post to wall" button, "Thank you for your support!", placeholders, character count with `t()` calls
4. **SocialShareButtons.tsx**: Replace any aria-labels or button text with `t()`
5. **WhyDonateWidget.tsx**: Replace any wrapper text or loading text with `t()`
6. **ProgressSection.tsx**: Replace "Live progress", "Updated live", "Raised", "Goal", "Participants", "Donors", "raised · Goal" with `t()` calls
</action>
<acceptance_criteria>
- FundraiserPage.tsx uses `t()` for all UI text (not data like fundraiser.displayName)
- DonorWallForm.tsx uses `t()` for labels, buttons, gate text, thank-you message
- ProgressSection.tsx uses `t()` for all stat labels and section headings
- SocialShareButtons.tsx uses `t()` for accessibility text
- `npm run build` succeeds
- No hardcoded English UI strings remain in any event page component (content from data/API excluded)
</acceptance_criteria>
</task>

## Verification

```bash
npm run build && npx tsc --noEmit
```

Grep for remaining hardcoded strings in event components (should find only data-driven content, metadata, and aria attributes that are language-neutral):
```bash
grep -r "\"[A-Z]" src/components/ui/{EventHero,TrackCards,ProgressSection,RegistrationForm,ConfirmationPanel,FundraiseForm,FundraiserConfirmation,FundraiserPage,DonorWall,DonorWallForm}.tsx | grep -v "import\|//\|t("
```

## must_haves

- All ~15 event page components use `t()` for user-facing strings (D-02 scope: event pages only)
- Data-driven content (eventDetails, API responses) stays as-is
- SEO metadata stays in English (not i18n'd)
- Build succeeds with static export
- Visual output unchanged (English strings come from en.ts via t())
