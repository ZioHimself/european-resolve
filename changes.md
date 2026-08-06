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

# --- AFTER THE MERGE ---

## Merging `feat/update-tiers` into `main`

- `main` had diverged with its own WhyDonate donor-wall persistence work (donor name/message capture, payment-amount redirect fix) that `feat/update-tiers` didn't have, since the branch forked before that work existed — a straight merge produced real conflicts (`ConfirmationPanel.tsx`, `FundraiserConfirmation.tsx`, `WhyDonateWidget.tsx`) plus a silent risk of dropping the persistence feature entirely.
- Resolved by reverting `main`'s post-fork commits back to the fork point (one net revert commit, history preserved — not a rebase/reset) so the merge itself was clean, then reapplying the reverted work on top afterward, adapted to the branch's new `firstName`/`lastName` `DonorInfo` shape.

## Payment amount integrity (never assume a paid amount)

- Reapplied donor-wall persistence fix initially kept a "fall back to the registered tier price" behavior when the widget's amount field couldn't be read (e.g. an external payment redirect navigates away before it can be captured). Removed per explicit instruction: **a paid amount must never be assumed, only recorded when actually observed.**
- Frontend (`whydonatePaymentRedirect.ts`): `parseWhyDonatePaymentReturn()` no longer takes a fallback-amount argument; `amount` is `undefined` when nothing was captured, and the confirm-payment request omits the field entirely rather than sending a guessed number.
- Backend (`sheets.ts::confirmPayment`): same principle applied one layer deeper — it also used to fall back to `row[8]` (the registered tier price) when the frontend sent no amount, which is the exact same kind of assumption just relocated. Removed; the amount column is left blank (excluded from the public raised total) rather than backfilled with an assumed figure. Registration is still marked `paid` — only the amount is left unknown, for manual reconciliation.
- `confirm-payment.ts` route: skips sending the payment-receipt email entirely when the amount is unknown (would otherwise state a specific €-figure that was never verified); logs a warning for manual follow-up instead.
- Added regression tests (`WhyDonateWidget.test.tsx`) reproducing a real incident: donor picks €15, changes the field to €5, pays €5 — confirms the widget always reports the amount actually in the field at payment time, both via the live `onPaymentSuccess` read and via the `sessionStorage` stash a real redirect return would rely on, never a stale earlier value.

## Registration confirmation email

- Added an "if you've already paid, we'll send the receipt once processed" reassurance line before the payment ask, in both the registration-confirmation and fundraiser-page-live emails (they share the same CTA block), across all 5 locales. Motivation: avoid confusion/duplicate payment attempts if the pending-registration email arrives after payment already went through. Known edge case: if the amount ends up unresolvable, no automated receipt is sent (see above) — accepted, to be resolved via manual reconciliation and a manually-triggered email.

## Ukrainian (`uk`) locale

- Backend email copy switched from formal register (`ви`/`ваш`) to informal (`ти`/`твій`) — brings it in line with the frontend site copy, which was already informal almost throughout (one stray formal leftover in `src/locales/uk.ts` fixed too). Gendered past-tense verbs (which agree with the unknown reader's gender) replaced with impersonal/passive phrasing (`тебе зареєстровано`, `оплата вже здійснена`) instead of guessing a gender.
- Added gender-inclusive-language convention: when a gendered verb form can't be avoided, use either a compact underscore form (`зроби_ла`) or full masc/fem forms separated by a slash (`зробив/зробила`); fixed one instance that assumed the donor is male (`donorWall.gateButton`). Also: Ukraine's defenders include servicewomen — always both forms (`захисниць і захисників`), never masculine-only.
- Both the informal-register and gender-inclusive-language rules documented in `.planning/codebase/CONVENTIONS.md` and mirrored into `CLAUDE.md` so they persist as durable project convention, not just this session's memory.

## Test infrastructure

- Node 26's native `localStorage` global (behind `--experimental-webstorage`) no-ops without a `--localstorage-file` flag and was silently shadowing jsdom's working implementation in the shared test global — any test touching `localStorage` failed for an environment reason, not a code reason. Fixed with a small guarded in-memory polyfill in `vitest.setup.ts`.

## Registration page bugs (post-merge)

- `RegisterClient.tsx`: a `token` in the URL was silently ignored whenever a registration was already cached in `sessionStorage` — the token-lookup effect bailed out on `if (registrationResult) return` before ever checking the URL. Concretely: register, don't pay, later open the confirmation-email link for that (or a different) registration in the same tab — the stale cached tier/rewards/status would show instead of what the token actually pointed to. Fixed by comparing the URL token against the cached result's own `paymentToken` and only skipping the fetch when they match. Added regression tests (`RegisterClient.test.tsx`).
- `ConfirmationPanel.module.css` / `FundraiserConfirmation.module.css`: the "verifying payment" overlay shown while auto-confirming after a redirect return was only 90% opaque (`color-mix(... 90%, transparent)`), letting the WhyDonate widget underneath visibly bleed through. Made fully opaque.
- `ConfirmationPanel.tsx`: the "Need an invoice?" section on the confirmed screen always mounted a fresh `WhyDonateWidget` instance immediately, relying on CSS (`max-height:0;overflow:hidden`) to hide it until expanded — mounting force-reinjects the third-party `wp_styling.js` script, and the widget's own UI doesn't respect that CSS containment, so a fresh widget became visible right after confirmation (most noticeable on redirect returns, where this remount happens right as the page settles). Fixed by not mounting the widget at all until the user actually clicks "Need an invoice?".
- `RegisterClient.tsx`: a payment provider can redirect back with `redirect_status=succeeded` on a *different device* than the one that started registration (e.g. scanning a QR code with a phone) — no `token`, no cached session on that device, so there was no way to identify the registration and it fell through to the tier grid, reading as if nothing had happened. Now detects this case and shows a generic "Thank you, your payment was received! We will keep you posted via email." screen instead. Added regression tests.

## Copy cleanup

- Removed em dashes from all user-facing copy (locale strings, email copy, page metadata, share text) — a documented tell of AI-generated text, added as a new convention in `CONVENTIONS.md`/`CLAUDE.md`. Replaced with periods, commas, or colons depending on context; "Title — Subtitle" patterns (email subjects, page `<title>`) became `Title | Subtitle`. Code comments, `.planning/`, `docs/adrs/`, and other internal docs were left untouched — out of scope for this pass, since those are historical records rather than product copy.

## Tier taglines and rewards localization

- Tier taglines and reward lists were hardcoded English text in `src/data/event.ts`, never translated. Moved into the locale system: taglines as plain per-tier strings (`tierCard.tagline.{tierId}`), rewards as a single `·`-separated string per tier (`tierCard.rewards.{tierId}`, matching the existing `·` list convention used elsewhere) rather than one translation key per individual reward, since the full list translates and re-splits cleanly as a unit.
- Runner-only rewards (e.g. "Running") are a separate `tierCard.rewardsRunner.{tierId}` string, prepended only for `participationType: "runner"` — replaces the old `RUNNER_ONLY_REWARDS` set that matched by exact English text (would have silently broken once rewards were translated).
- Backend mirrors the same `base`/`runnerOnly` structure per tier in each email locale (`tierRewards`), via a new `getLocalizedRewards(tierId, participationType, language)` helper — since the registrant's language is already known server-side, the API response and the confirmation emails both return already-localized reward text. No frontend changes were needed in `ConfirmationPanel`/`FundraiserConfirmation` since they already just render whatever the backend sends.
- Removed `causeFee`/`logisticsFee` from `Tier` — unused since the fee-breakdown display was commented out.
