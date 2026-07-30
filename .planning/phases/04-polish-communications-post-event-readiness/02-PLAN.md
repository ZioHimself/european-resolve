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
  - src/components/ui/TierCard.tsx
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
- src/components/ui/TierCard.tsx
- src/components/ui/registerTypes.ts
</read_first>
<action>
For each client component (`'use client'`):
1. Add `import { t } from "@/locales"`
2. Replace hardcoded labels, placeholders, button text, validation messages, and confirmation text with `t()` calls

Specific targets:
- **RegistrationForm.tsx** (~25 strings): Participation type toggle ("How will you participate?", "I'll run on the day", "I'll support from anywhere"), field labels ("Full name", "Email", "Phone", "T-shirt size", "Language", "Country"), "(optional)" label, conditional GDPR consent text (runner variant: "race registration and safety"; supporter variant: "event registration and donation tracking"), comms opt-in text, error summary heading ("Please fix the following:"), dynamic submit buttons ("Register — €{price}" / "Support — €{price}" / "Registering..." / "Select a tier to register"), "Total: €{price}"
- **ConfirmationPanel.tsx**: "Registration complete" heading, participant ID text, WhyDonate link text, next steps
- **FundraiseForm.tsx** (~40 strings): This is now a 3-step wizard. Extract:
  - Step indicator labels ("1. Your page", "2. Runner details", "3. Review")
  - Step 1 heading ("Set up your fundraising page"), field labels ("Display name", "Personal message", "Personal goal (€)"), placeholders, photo upload label ("+ Photo"), "Next: Runner details →" button, char count
  - Step 2 heading ("Your runner registration"), all registration form fields duplicated within the wizard (labels, GDPR text, comms text), "← Back"/"Next: Review →" buttons, tier error
  - Step 3 heading ("Review and submit"), all review section labels ("Your fundraising page", "Runner registration"), review key names ("Display name", "Message", "Goal", "Photo", "Tier", "Full name", "Email", "T-shirt", "Country"), "Uploaded"/"None" values, "← Back" and combined submit ("Create page and register — €{price}" / "Creating…")
- **FundraiserConfirmation.tsx** (~30 strings): "Your fundraising page is ready!" heading, subheading, "Your shareable link"/"Secret edit link — save this!" labels, "Copy"/"Copied!" buttons, edit link hint, "Runner registration" section heading, "Your ID: {id}", "Tier"/"Amount" labels, "Your rewards" heading, payment section ("Complete your €{amount} donation", instructions, "I've completed my donation"/"Confirming…"), confirmed banner ("Payment confirmed — you're all set!"), "View your page →", "Share your page" heading
- **TierCard.tsx**: "Most chosen" badge text, "Selected"/"Select" button text

Keep error messages that come from the backend API as-is for now (Plan 03 handles backend → error codes → t() mapping).
</action>
<acceptance_criteria>
- RegistrationForm.tsx uses `t()` for all labels, placeholders, toggle text, conditional GDPR text, and dynamic button text
- ConfirmationPanel.tsx uses `t()` for all user-facing strings
- FundraiseForm.tsx uses `t()` for all 3 wizard steps: labels, headings, fields, review keys, navigation buttons, and submit button
- FundraiserConfirmation.tsx uses `t()` for all user-facing strings including registration section and payment flow
- TierCard.tsx uses `t()` for badge and button text
- All components still render correctly in English (visual regression: same output)
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
3. **DonorWallForm.tsx**: Replace "Your name", "Your message" labels, "I've donated — leave a message of support" gate button, "Posting…"/"Post to wall" button, "Thank you for your support!", placeholders ("How you want to appear", "A word of encouragement..."), character count with `t()` calls
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
