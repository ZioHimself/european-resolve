# Phase 3: Fundraising Pages & Live Progress - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-29
**Phase:** 03-fundraising-pages-live-progress
**Areas discussed:** Photo upload & storage, Fundraiser identity & edit access, Donor wall model

---

## Fundraiser Page Delivery (resolved via freeform input)

User clarified upfront: "We have React, so dynamic routing within the application should be possible. The fundraiser pages are limited in their structure — their difference is only about the values in the page. I don't see any need to render anything on backend for this."

**Decision:** Client-side React routes with fixed layout, data fetched via API.

---

## Photo Upload & Storage

### Where to store photos?

| Option | Description | Selected |
|--------|-------------|----------|
| Google Cloud Storage | Already using GCP for Cloud Run + Sheets. Signed upload URLs, public read. | |
| Cloudflare R2 | Already deploying frontend on Cloudflare. S3-compatible, no egress fees. | |
| Base64 in Google Sheets | Zero infrastructure but Sheets cells have size limits. | |

**User's choice:** Free-text — "Could we upload them to folders within gdrive?"

### Confirmed Google Drive approach

| Option | Description | Selected |
|--------|-------------|----------|
| Google Drive folder | Same auth, minimal new infrastructure | ✓ |
| GCS bucket | Proper CDN-friendly URLs, same GCP project | |
| You decide | Best approach given constraints | |

**User's choice:** Google Drive folder

### Photo size & format

| Option | Description | Selected |
|--------|-------------|----------|
| Backend resizes (~400x400 WebP) | Consistent file sizes, fast loads | ✓ |
| Client-side resize | Reduces upload time, frontend complexity | |
| Store as-is | Simplest but risk of huge photos | |

**User's choice:** Backend resizes to ~400x400 WebP

---

## Fundraiser Identity & Edit Access

### Edit model

| Option | Description | Selected |
|--------|-------------|----------|
| Secret edit link | Backend generates edit token, bookmark/save the link | ✓ |
| Edit once, no edits | Create and publish, page is final | |
| Email-based access | Enter email to request edit link | |

**User's choice:** Secret edit link with token

### Slug generation

| Option | Description | Selected |
|--------|-------------|----------|
| Auto from display name | "Maria K" → maria-k, collisions handled with numbers | ✓ |
| User chooses | Custom URL field, more validation needed | |
| Random short ID | e.g., f8k2x — simple but not memorable | |

**User's choice:** Auto-generated from display name

### Draft/publish flow

| Option | Description | Selected |
|--------|-------------|----------|
| Simple toggle | Starts as draft with banner, publish via edit link | ✓ |
| Skip draft, publish immediately | Page goes live on creation | |
| You decide | Claude decides the UX | |

**User's choice:** Simple toggle (draft → publish)

---

## Donor Wall Model

### Who can add entries?

| Option | Description | Selected |
|--------|-------------|----------|
| Any visitor | Simple "leave a message" form, not tied to donations | |
| After donating | Show wall form only after donation confirmation | ✓ |
| Fundraiser manages | Only fundraiser adds supporters via edit link | |

**User's choice:** Free-text — "I'd like the comments to be postable only after a donation. Donating from a fundraising page would allow one to comment."

### Donation confirmation flow

| Option | Description | Selected |
|--------|-------------|----------|
| Honour-system button | "I've donated" button reveals wall form, low friction | ✓ |
| Token flow | Generate donation token, verify via redirect | |
| You decide | Simplest approach preventing casual spam | |

**User's choice:** Honour-system button

### Spam prevention

| Option | Description | Selected |
|--------|-------------|----------|
| Basic validation | Required fields, character limits, rate limiting | ✓ |
| Moderation queue | Entries pending until approved | |
| CAPTCHA | reCAPTCHA or similar before submission | |

**User's choice:** Basic validation only

### Wall anonymity

| Option | Description | Selected |
|--------|-------------|----------|
| Name required, message optional | Display name mandatory, message optional | |
| Anonymous option | Can post as "Anonymous supporter" | |
| Both required | Every entry has name and message | ✓ |

**User's choice:** Both name and message required

---

## Claude's Discretion

- Client-side routing implementation details
- Google Drive folder structure and permissions
- Photo upload API shape (multipart vs base64)
- Form validation rules
- Social sharing URL construction per platform
- Progress dashboard polling interval and caching
- Edit page UX details
- Draft banner design
- Donor wall display order
- "I've donated" button integration with WhyDonate widget

## Deferred Ideas

- Zapier integration for donation verification
- WhyDonate progress widget as alternative to custom dashboard
- Recurring donations
- Per-fundraiser donation totals (requires individual campaigns)
