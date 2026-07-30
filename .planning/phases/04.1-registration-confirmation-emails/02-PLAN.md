---
phase: "04.1"
plan_id: "02"
title: "Fundraiser Confirmation Email"
objective: "Create a localized fundraiser confirmation email template and wire it into the POST /api/fundraiser/register endpoint so Track B participants receive a combined registration+fundraiser email"
wave: 1
depends_on: []
files_modified:
  - "backend/src/email/locales/types.ts"
  - "backend/src/email/locales/en.ts"
  - "backend/src/email/locales/fr.ts"
  - "backend/src/email/locales/uk.ts"
  - "backend/src/email/locales/nl.ts"
  - "backend/src/email/locales/de.ts"
  - "backend/src/email/render.ts"
  - "backend/src/services/email.ts"
  - "backend/src/routes/fundraiser.ts"
autonomous: true
requirements_addressed: [ADMN-03]
---

# Plan 02: Fundraiser Confirmation Email

## Objective

Track B participants who create a fundraiser page via `POST /api/fundraiser/register` currently receive no email. This plan adds a new fundraiser confirmation email that includes both the registration details (participant ID, tier, amount, rewards, donation CTA) and fundraiser-specific information (shareable page URL, edit link with token, display name, goal). The email is localized in all 5 languages (EN, FR, UK, NL, DE) using the established `EmailLocale` pattern.

## Tasks

<task id="02.1">
<title>Extend EmailLocale type with fundraiser strings</title>

<read_first>
- `backend/src/email/locales/types.ts` (current EmailLocale interface — 15 fields)
</read_first>

<action>
Add 8 new fields to the `EmailLocale` interface in `backend/src/email/locales/types.ts`:

- `fundraiserSubject: string` — email subject for fundraiser confirmation
- `fundraiserIntro: string` — intro paragraph for combined registration+fundraiser email (uses `{name}` placeholder)
- `fundraiserHeading: string` — section heading for fundraiser details block
- `fundraiserPageLabel: string` — label for the shareable fundraiser page URL
- `fundraiserEditLabel: string` — label for the secret edit link
- `fundraiserEditHint: string` — warning to save the edit link
- `fundraiserDisplayNameLabel: string` — label for fundraiser display name row
- `fundraiserGoalLabel: string` — label for personal fundraising goal row
</action>

<acceptance_criteria>
- `EmailLocale` interface in `types.ts` has exactly 23 fields (15 existing + 8 new)
- All 8 new field names start with `fundraiser`
- All new fields are typed as `string`
- TypeScript compilation passes: `npx tsc --noEmit` in `backend/`
</acceptance_criteria>
</task>

<task id="02.2">
<title>Add English fundraiser locale strings</title>

<read_first>
- `backend/src/email/locales/en.ts` (current English locale — 15 fields)
- `backend/src/email/locales/types.ts` (updated EmailLocale interface)
</read_first>

<action>
Add 8 fundraiser-specific string values to the English locale in `backend/src/email/locales/en.ts`:

- `fundraiserSubject`: "Run for Ukraine 2026 — Your fundraiser page is live!"
- `fundraiserIntro`: "Great news, {name}! You're registered AND your personal fundraiser page is live. Share it with friends and family to help reach your goal."
- `fundraiserHeading`: "Your fundraiser page"
- `fundraiserPageLabel`: "Share this link"
- `fundraiserEditLabel`: "Edit your page"
- `fundraiserEditHint`: "Save this link — it's the only way to edit your fundraiser page. Do not share it publicly."
- `fundraiserDisplayNameLabel`: "Display name"
- `fundraiserGoalLabel`: "Personal goal"
</action>

<acceptance_criteria>
- `en.ts` exports an object satisfying `EmailLocale` with all 23 fields
- `fundraiserSubject` contains "fundraiser page is live"
- `fundraiserEditHint` warns about saving the edit link
- TypeScript compilation passes
</acceptance_criteria>
</task>

<task id="02.3">
<title>Add French fundraiser locale strings</title>

<read_first>
- `backend/src/email/locales/fr.ts` (current French locale)
- `backend/src/email/locales/en.ts` (English reference for translation)
</read_first>

<action>
Add 8 fundraiser-specific string values to the French (Belgian French) locale in `backend/src/email/locales/fr.ts`:

- `fundraiserSubject`: "Run for Ukraine 2026 — Votre page de collecte est en ligne !"
- `fundraiserIntro`: "Bonne nouvelle, {name} ! Vous êtes inscrit(e) ET votre page de collecte personnelle est en ligne. Partagez-la avec vos proches pour atteindre votre objectif."
- `fundraiserHeading`: "Votre page de collecte"
- `fundraiserPageLabel`: "Partagez ce lien"
- `fundraiserEditLabel`: "Modifier votre page"
- `fundraiserEditHint`: "Conservez ce lien — c'est le seul moyen de modifier votre page de collecte. Ne le partagez pas publiquement."
- `fundraiserDisplayNameLabel`: "Nom affiché"
- `fundraiserGoalLabel`: "Objectif personnel"
</action>

<acceptance_criteria>
- `fr.ts` exports an object satisfying `EmailLocale` with all 23 fields
- All French strings are natural Belgian French
- TypeScript compilation passes
</acceptance_criteria>
</task>

<task id="02.4">
<title>Add Ukrainian fundraiser locale strings</title>

<read_first>
- `backend/src/email/locales/uk.ts` (current Ukrainian locale)
- `backend/src/email/locales/en.ts` (English reference for translation)
</read_first>

<action>
Add 8 fundraiser-specific string values to the Ukrainian locale in `backend/src/email/locales/uk.ts`:

- `fundraiserSubject`: "Run for Ukraine 2026 — Вашу сторінку збору коштів створено!"
- `fundraiserIntro`: "Чудові новини, {name}! Ви зареєстровані І ваша персональна сторінка збору коштів вже працює. Поділіться нею з друзями та рідними, щоб досягти своєї мети."
- `fundraiserHeading`: "Ваша сторінка збору коштів"
- `fundraiserPageLabel`: "Поділіться цим посиланням"
- `fundraiserEditLabel`: "Редагувати сторінку"
- `fundraiserEditHint`: "Збережіть це посилання — це єдиний спосіб редагувати вашу сторінку збору коштів. Не поширюйте його публічно."
- `fundraiserDisplayNameLabel`: "Відображуване ім'я"
- `fundraiserGoalLabel`: "Особиста мета"
</action>

<acceptance_criteria>
- `uk.ts` exports an object satisfying `EmailLocale` with all 23 fields
- All Ukrainian strings use standard Ukrainian
- TypeScript compilation passes
</acceptance_criteria>
</task>

<task id="02.5">
<title>Add Dutch and German fundraiser locale strings</title>

<read_first>
- `backend/src/email/locales/nl.ts` (current Dutch locale)
- `backend/src/email/locales/de.ts` (current German locale)
- `backend/src/email/locales/en.ts` (English reference for translation)
</read_first>

<action>
Add 8 fundraiser-specific string values to both Dutch and German locales:

**Dutch (nl.ts):**
- `fundraiserSubject`: "Run for Ukraine 2026 — Je actiepagina staat online!"
- `fundraiserIntro`: "Goed nieuws, {name}! Je bent ingeschreven ÉN je persoonlijke actiepagina staat online. Deel de link met vrienden en familie om je doel te bereiken."
- `fundraiserHeading`: "Je actiepagina"
- `fundraiserPageLabel`: "Deel deze link"
- `fundraiserEditLabel`: "Bewerk je pagina"
- `fundraiserEditHint`: "Bewaar deze link — het is de enige manier om je actiepagina te bewerken. Deel deze niet publiekelijk."
- `fundraiserDisplayNameLabel`: "Weergavenaam"
- `fundraiserGoalLabel`: "Persoonlijk doel"

**German (de.ts):**
- `fundraiserSubject`: "Run for Ukraine 2026 — Deine Spendenseite ist online!"
- `fundraiserIntro`: "Tolle Neuigkeiten, {name}! Du bist angemeldet UND deine persönliche Spendenseite ist online. Teile den Link mit Freunden und Familie, um dein Ziel zu erreichen."
- `fundraiserHeading`: "Deine Spendenseite"
- `fundraiserPageLabel`: "Teile diesen Link"
- `fundraiserEditLabel`: "Seite bearbeiten"
- `fundraiserEditHint`: "Speichere diesen Link — er ist der einzige Weg, deine Spendenseite zu bearbeiten. Teile ihn nicht öffentlich."
- `fundraiserDisplayNameLabel`: "Anzeigename"
- `fundraiserGoalLabel`: "Persönliches Ziel"
</action>

<acceptance_criteria>
- `nl.ts` exports an object satisfying `EmailLocale` with all 23 fields
- `de.ts` exports an object satisfying `EmailLocale` with all 23 fields
- TypeScript compilation passes
</acceptance_criteria>
</task>

<task id="02.6">
<title>Create FundraiserEmailData interface and renderFundraiserEmail function</title>

<read_first>
- `backend/src/email/render.ts` (existing RegistrationEmailData interface, renderConfirmationEmail function, interpolate and escapeHtml helpers)
- `backend/src/email/locales/types.ts` (updated EmailLocale with fundraiser fields)
- `src/components/ui/FundraiserConfirmation.tsx` (edit URL structure: `?by={slug}&edit={editToken}`)
</read_first>

<action>
In `backend/src/email/render.ts`:

1. Define `FundraiserEmailData` interface extending `RegistrationEmailData` with additional fields:
   - `slug: string` — fundraiser URL slug
   - `editToken: string` — secret edit token
   - `displayName: string` — fundraiser display name
   - `fundraiserGoalEur: number` — personal fundraising goal
   - `siteUrl: string` — base site URL (e.g. `https://european-resolve.org`)

2. Create `renderFundraiserEmail(data: FundraiserEmailData, localeCode: string): { subject: string; html: string }` function that:
   - Uses the same HTML structure as `renderConfirmationEmail` (UA blue header, white body, paper footer)
   - Uses `fundraiserSubject` from locale for the email subject
   - Uses `fundraiserIntro` instead of `confirmationIntro`
   - Includes the same registration details table (participant ID, tier, amount)
   - Includes the same rewards list
   - Adds a new fundraiser section between rewards and donation CTA:
     - Fundraiser details table: display name row, personal goal row (€{goalEur})
     - Shareable page URL with clickable link: `{siteUrl}/events/2026-run-for-ukraine/fundraiser?by={slug}`
     - Edit link with clickable link: `{siteUrl}/events/2026-run-for-ukraine/fundraiser?by={slug}&edit={editToken}`
     - Edit hint warning text
   - The fundraiser section uses the same visual style (bordered table, accent color)
   - Includes the donation CTA, event details, and footer (same as registration email)

3. Export `FundraiserEmailData` and `renderFundraiserEmail`.
</action>

<acceptance_criteria>
- `render.ts` exports `FundraiserEmailData` interface with 12 fields (7 from RegistrationEmailData + 5 new)
- `render.ts` exports `renderFundraiserEmail` function
- `renderFundraiserEmail` returns `{ subject: string; html: string }`
- HTML output contains fundraiser page URL: `/events/2026-run-for-ukraine/fundraiser?by=`
- HTML output contains edit link with `&edit=` query parameter
- HTML output contains registration details table (participantId, tier, amount)
- HTML output contains fundraiser details (display name, goal)
- HTML output uses UA brand colors (`#0057b8` header, `#ffd700` gold accent)
- TypeScript compilation passes
</acceptance_criteria>
</task>

<task id="02.7">
<title>Create sendFundraiserEmail service function</title>

<read_first>
- `backend/src/services/email.ts` (existing sendConfirmationEmail function, getTransporter helper)
- `backend/src/email/render.ts` (FundraiserEmailData and renderFundraiserEmail)
</read_first>

<action>
In `backend/src/services/email.ts`:

1. Import `renderFundraiserEmail` and `FundraiserEmailData` from `../email/render.js`
2. Create `sendFundraiserEmail(data: FundraiserEmailData, language: Language): Promise<void>` function following the same pattern as `sendConfirmationEmail`:
   - Get transporter (return early with warning if not configured)
   - Resolve locale code from language
   - Call `renderFundraiserEmail(data, localeCode)` to get subject and HTML
   - Send via `transport.sendMail()` with `config.smtp.from` as sender
   - Log success: `[email] Fundraiser confirmation sent to ${data.email} (locale: ${localeCode})`

3. Export `sendFundraiserEmail`.
</action>

<acceptance_criteria>
- `email.ts` exports `sendFundraiserEmail` function
- Function signature matches: `(data: FundraiserEmailData, language: Language) => Promise<void>`
- Function logs warning and returns early when SMTP not configured
- Function calls `renderFundraiserEmail` with correct locale code
- TypeScript compilation passes
</acceptance_criteria>
</task>

<task id="02.8">
<title>Wire sendFundraiserEmail into POST /api/fundraiser/register</title>

<read_first>
- `backend/src/routes/fundraiser.ts` (POST /api/fundraiser/register handler at lines 232-364)
- `backend/src/routes/register.ts` (reference for sendConfirmationEmail call pattern at lines 165-176)
- `backend/src/services/email.ts` (sendFundraiserEmail function)
- `backend/src/config.ts` (config.donationUrl, config.corsOrigins)
</read_first>

<action>
In `backend/src/routes/fundraiser.ts`:

1. Add import: `import { sendFundraiserEmail } from "../services/email.js";`
2. Add import: `import { config } from "../config.js";`
3. Add import for `Language` type (may already be imported from `../types.js`)

4. In the `POST /register` handler, after the response object is built (around line 362) and before the `return c.json(...)` statement, add a fire-and-forget email call:

```
sendFundraiserEmail(
  {
    name: fullName!.trim(),
    email: email!.trim().toLowerCase(),
    participantId,
    tierName: tier.name,
    amountEur: tier.price,
    rewards: tier.rewards,
    donationUrl: config.donationUrl,
    slug,
    editToken,
    displayName: displayName!.trim(),
    fundraiserGoalEur: goalEur,
    siteUrl: config.corsOrigins[0] ?? "https://european-resolve.org",
  },
  language as Language,
).catch((err) => console.error("[email] Failed to send fundraiser confirmation:", err));
```

The `.catch()` pattern matches `register.ts` — email failures never block the API response.
</action>

<acceptance_criteria>
- `fundraiser.ts` imports `sendFundraiserEmail` from `../services/email.js`
- `fundraiser.ts` imports `config` from `../config.js`
- `sendFundraiserEmail()` is called inside the `POST /register` handler
- The call uses `.catch()` fire-and-forget pattern (does not block the response)
- The call passes all required `FundraiserEmailData` fields: name, email, participantId, tierName, amountEur, rewards, donationUrl, slug, editToken, displayName, fundraiserGoalEur, siteUrl
- The call passes `language as Language` as the second argument
- TypeScript compilation passes: `npx tsc --noEmit` in `backend/`
</acceptance_criteria>
</task>

## Verification

```bash
cd backend
npx tsc --noEmit
# Expected: no errors — all locale files satisfy updated EmailLocale, all imports resolve

# Verify fundraiser email function exists
grep -c "renderFundraiserEmail" src/email/render.ts
# Expected: at least 2 (definition + export)

grep -c "sendFundraiserEmail" src/services/email.ts
# Expected: at least 2 (definition + export)

grep -c "sendFundraiserEmail" src/routes/fundraiser.ts
# Expected: at least 1 (call site)
```

## must_haves

- Track B participants receive an email with BOTH registration details AND fundraiser page information
- Fundraiser email includes shareable page URL and secret edit link
- Edit link warning tells the user to save it
- All 5 locale files (EN, FR, UK, NL, DE) have complete fundraiser translations
- Email uses the same UA branding (blue/gold header, paper background) as registration email
- Fire-and-forget sending pattern — email failure never blocks the API response
