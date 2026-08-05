# Changes

## Tiers
- Added 2 tiers (5 total): Supporter €10+, Sprinter €15, Relay runner €30, Marathoner €60, Ultramarathoner €100. Supporter is donation-only (no run). Motivation: give more price points, let non-runners contribute.
- Added tagline + rewards copy per tier; replaced "race bib" language with "running" (it's a group run, not a race).
- Tier grid full-width until 1440px, same mobile fold breakpoint. Motivation: better use of wide screens.
- Selection now changes border **color** only, never border width — fixes a layout-shift bug where selecting Ultramarathoner pushed the page content down.
- Only the most-recently-selected tier keeps a highlighted border (not all previously selected). "selected" label simplified to just "Selected".

## Registration form
- Removed participation-type tabs — derived from selected tier instead.
- Form only appears after a tier is selected; page smooth-scrolls to the form's outer container (not cut off mid-description) on selection.
- Split single "Full name" field into separate **First name** / **Last name** fields, in both the register form and the fundraiser wizard. Motivation: avoids unreliable heuristic name-splitting (e.g. "Jean Claude Van Damme" mis-split) when prefilling the WhyDonate widget or filing records.
- `fullName` is now always computed server-side as `firstName + " " + lastName` — never sent by the client, avoiding two sources of truth.
- Google Sheet: `fullName` column kept in place; `firstName`/`lastName` appended as two **new trailing columns** (after `socksSize`), never inserted mid-sheet — avoids reshuffling every fixed-index column reference downstream.

## Registration/payment architecture (data-integrity fix)
- Old behavior: resubmitting a registration with the same email could overwrite another pending row. Fixed by redesigning the flow:
  1. Registration submit is now a pure **append** — no read, no dedup check.
  2. Payment confirmation matches by **token first** (always available client-side, no webhook exists); falls back to email + amount + most-recent-pending match; if nothing matches, creates a brand-new paid row (never guesses a tier from the amount).
  3. Selected tier is never recalculated from the amount actually paid — if someone pays more/less than their tier price, the original tier selection stands.
- Participant IDs switched from a Sheets-row-count read to a generated ID: centiseconds since 2026-08-01 UTC, base-36, 6 chars. Motivation: removes an unnecessary read and stops the ID from revealing the current entry count.
- "Abandon and restart registration" link added under the payment widget to clear session storage and return to tier selection.
- If a payment token already shows `paid`, show a dedicated "Thank you for joining our campaign!" screen with a link back to the event page, instead of re-showing the payment widget.

## Layout/CSS
- Footer now sticks to the bottom of the viewport on short pages (flex layout) instead of leaving whitespace.
- Fixed a color mismatch in the gap between footer and page background on long pages (`html`/`body`/`#main` background alignment).

## Branding
- Renamed the event's display name (presentation only, not routes/slugs) from "Run for Ukraine 2026" to "35 Years of 🇺🇦 Independence: Charity and Run" across metadata, breadcrumbs, emails, and share text.

## Copy / i18n
- Track A/B renamed: "Donate or Run" → "Join the Campaign"; "Fundraise and Run" → "Fundraise for the Team". Motivation: neither track has a run-only option without a donation.
- `tracks.trackAFeatures` replaced "Race bib · Finisher medal · T-shirt" (matched no actual tier reward) with "Choose your tier · Rewards vary · Run optional".
- Hero title/description moved from English-only `eventDetails` fields into per-locale `hero.title`/`hero.description` strings (translated across en/fr/nl/de/uk); a short English-only `eventDetails.seoDescription` now feeds JSON-LD only. SEO `<meta>` tags remain English-only (static export, no per-locale routing).
- `fundraiser.collectiveTotal` reworded to make clear a personal fundraiser page is part of one shared campaign, not standalone.

## Verification
- Frontend `npm run typecheck`, backend `tsc --noEmit`, and `vitest run` (197/198 passing — 1 pre-existing unrelated failure) all clean.
- Live-tested the name split and payment flows against a throwaway mock backend via Playwright.
