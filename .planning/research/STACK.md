# Stack Research

**Researched:** 2026-07-28

## Recommended Stack (extends existing)

### Frontend (no changes to framework)
- **Next.js 16** (App Router, static export) — already in place
- **CSS Modules** — project's existing styling approach
- **React 19** — server components for static pages, client components for interactive forms

### Backend API (new)
- **Node.js / TypeScript** on GCP Cloud Run (lightweight, auto-scaling, pay-per-use)
- **Express** or **Hono** for HTTP framework (Hono is lighter, faster, better for serverless)
- **Google Sheets API** via service account for data persistence
- **Monobank Jar API** (public, no auth) for live balance reads

### Why NOT the only-facts GKE pattern
The only-facts project uses Terraform + GKE + MongoDB — full infrastructure for a long-running pipeline. This event page needs:
- A few API endpoints (register, create fundraiser, get stats)
- Google Sheets as the "database"
- Periodic jar balance polling

**Cloud Run** is the right fit: simpler, cheaper, no cluster management, auto-scales to zero when unused after the event.

## Integration Details

### Monobank Jar (public endpoints, no auth required)
```
GET https://api.monobank.ua/bank/jar/{longJarId}
→ { title, amount, goal }  (amount in kopiykas, UAH)

GET https://send.monobank.ua/api/handler?id={shortId}
→ { longJarId, ... }  (use to resolve short link → cache longJarId)
```
- Both endpoints are read-only, unauthenticated
- `send.monobank.ua` has stricter rate limits — resolve once, cache `longJarId`
- Poll `/bank/jar/{id}` on the backend (e.g. every 60s), cache + serve to frontend
- Amount is in UAH kopiykas (divide by 100 for UAH display)
- EUR conversion: use ECB reference rate or Monobank's own `/bank/currency` endpoint

### Google Sheets (existing pattern)
The project already uses Google Apps Script macros for events data:
```
GET https://script.google.com/macros/s/{id}/exec → JSON array
```
For the backend, two options:
1. **Apps Script endpoints** (same pattern) — deploy macros that handle POST for writes
2. **Google Sheets API** (service account) — direct read/write from GCP backend

Recommendation: **Google Sheets API with service account** for the backend (more control, no Apps Script deployment step), keep the existing Apps Script pattern for read-only event data on the frontend.

### Next.js Static Export + Dynamic Routes
- Known pages (`/events/2026-run-for-ukraine/`, `/register`, `/fundraise`) → `generateStaticParams`
- Fundraiser pages (`/events/2026-run-for-ukraine/p/[slug]`) → client-side data fetching
- Next.js 16 supports fallback shells for dynamic routes in static export mode
- Use `Suspense` boundary + client component for param-dependent content
- Progress stats → client-side polling (SWR or useEffect + setInterval)

## Deployment Topology

```
┌─ Cloudflare Pages ──────────────────────────────┐
│  Static HTML/CSS/JS (Next.js export)            │
│  • Event landing page                           │
│  • Registration form (client-side submit)       │
│  • Fundraiser creation form                     │
│  • Fundraiser page shells (client-fetch)        │
│  • Progress dashboard (client-fetch)            │
└──────────────────────────────────────────────────┘
         │ API calls (fetch)
         ▼
┌─ GCP Cloud Run ─────────────────────────────────┐
│  Node.js/TypeScript API                          │
│  • POST /api/register (→ Google Sheets)         │
│  • POST /api/fundraiser (→ Google Sheets)       │
│  • GET /api/fundraiser/:slug (→ Google Sheets)  │
│  • GET /api/progress (→ cached jar balance)     │
│  • GET /api/donors/:slug (→ Google Sheets)      │
│  • Cron: poll Monobank jar every 60s            │
└──────────────────────────────────────────────────┘
         │
         ▼
┌─ Google Sheets ─────────────────────────────────┐
│  • Registrations (name, email, tier, track...)  │
│  • Fundraiser pages (slug, name, message, goal) │
│  • Donor wall entries (opt-in name + message)   │
│  • Jar balance log (timestamp, amount)          │
└──────────────────────────────────────────────────┘
```
