# Pitfalls Research

**Researched:** 2026-07-28

## Critical Pitfalls

### 1. Monobank Jar Rate Limiting
**Warning signs:** 429 responses, empty balance reads
**Prevention:** Cache the longJarId (resolve short link once). Poll `/bank/jar/{id}` from the backend only (not from every client). Cache aggressively — 60s is plenty for a donation counter.
**Phase:** Backend API (Phase 2-3)

### 2. UAH ↔ EUR Currency Mismatch
**Warning signs:** Progress bar showing wrong numbers, confused donors
**Prevention:** Decide upfront: display in UAH (accurate) or EUR (relatable for Belgian audience). If EUR, document that it's an approximation. Show "~€X" with a tooltip explaining conversion. Use Monobank's own `/bank/currency` endpoint for UAH/EUR rate.
**Phase:** Progress dashboard (Phase 3)

### 3. Static Export + Dynamic Content Confusion
**Warning signs:** Build failures, "generateStaticParams required" errors, blank pages on first load
**Prevention:** 
- Known routes (landing, register, fundraise, progress) → static pages with client-side data fetching
- Fundraiser pages (`/p/[slug]`) → use Next.js 16 fallback shell pattern OR make it a purely client-rendered catch-all
- Never rely on server-side request APIs (cookies, headers) in static export
**Phase:** Frontend architecture (Phase 1)

### 4. Google Sheets as Database — Scale Limits
**Warning signs:** Slow reads, API quota exhaustion, race conditions on writes
**Prevention:** 
- Google Sheets API has 300 requests/min per project limit
- Backend should cache reads (participant count, fundraiser data) with short TTL
- Writes are less frequent (registrations come in bursts, not continuously)
- If >500 participants register, consider batching writes
- Sheets handles up to ~10M cells — well within event scale
**Phase:** Backend API (Phase 2)

### 5. CORS Configuration
**Warning signs:** Frontend fetch calls blocked in browser
**Prevention:** Backend must return proper CORS headers for the Cloudflare Pages domain. Set `Access-Control-Allow-Origin` to `https://european-resolve.org`. Don't use `*` in production.
**Phase:** Backend API scaffold (Phase 2)

### 6. Fundraiser Slug Collisions
**Warning signs:** Two "Julie Vanderberghe" participants get same slug
**Prevention:** Generate slugs from display name + short random suffix (e.g. `julie-vanderberghe-a3f`). Check uniqueness against Sheets before confirming.
**Phase:** Fundraiser creation (Phase 3)

### 7. Photo Upload in Static Context
**Warning signs:** Large base64 payloads, slow form submissions
**Prevention:** Upload directly to GCP Cloud Storage (signed URL from backend). Store the public URL in Sheets. Don't try to base64-encode images into Sheets cells.
**Phase:** Fundraiser creation (Phase 3)

## Moderate Pitfalls

### 8. Email Deliverability
**Warning signs:** Confirmation emails landing in spam
**Prevention:** Use a transactional email service (Resend, SendGrid) with proper SPF/DKIM on the european-resolve.org domain. Don't send from a noreply@cloudrun address.
**Phase:** Communications (Phase 4)

### 9. Mobile Form UX
**Warning signs:** Users abandoning registration mid-flow
**Prevention:** 
- Single-page form with clear progress (not multi-step wizard for v1)
- Large tap targets, proper input types (email, tel, select)
- Show total clearly before "Continue to payment" CTA
**Phase:** Frontend forms (Phase 1)

### 10. Jar Link Stability
**Warning signs:** Monobank jar URL changes, all "Donate" buttons break
**Prevention:** Store the jar URL in a config (environment variable or Sheets "Config" tab). If Monobank changes the jar, update one place — not every page.
**Phase:** Configuration (Phase 2)

### 11. Event Over — What Happens to Pages?
**Warning signs:** Stale pages accepting registrations after the event
**Prevention:** Backend should check an "event active" flag. After the event, registration endpoint returns 410 Gone. Frontend shows "Event completed" state with final totals.
**Phase:** Post-event (Phase 4)

## Low-Risk Pitfalls

### 12. CSS Token Mapping (Prototype → Project)
**Warning signs:** Inconsistent styling, two competing color systems
**Prevention:** Map prototype's Tailwind tokens to existing CSS custom properties:
- `--ua-blue` (oklch 0.42 0.19 258) → new token `--color-ua-blue` in tokens.css
- `--ua-yellow` (oklch 0.85 0.17 92) → new token `--color-ua-yellow` in tokens.css
- `--ink` → already have `--color-black` (#0a1628)
- `--paper` → already have `--color-paper` (#f5f2eb)
- `--card` → already have `--color-surface` (#ffffff)
- `--border` → already have `--color-border` (--color-black-20)
**Phase:** Design tokens (Phase 1)

### 13. Donor Wall Spam
**Warning signs:** Fake entries, inappropriate messages
**Prevention:** Rate-limit donor wall submissions. Optional: admin approval queue (check Sheets manually). Keep messages short (max 140 chars).
**Phase:** Donor wall (Phase 3)
