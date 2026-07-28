# Architecture Research

**Researched:** 2026-07-28

## System Architecture

### Component Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (Cloudflare Pages — static export)                      │
│                                                                   │
│  ┌─ Event Pages ──────────────────────────────────────────────┐ │
│  │ /events/2026-run-for-ukraine/          (landing)           │ │
│  │ /events/2026-run-for-ukraine/register   (Track A form)     │ │
│  │ /events/2026-run-for-ukraine/fundraise  (Track B form)     │ │
│  │ /events/2026-run-for-ukraine/progress   (live dashboard)   │ │
│  │ /events/2026-run-for-ukraine/p/[slug]   (fundraiser page)  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ Shared (existing) ───────────────────────────────────────┐  │
│  │ Nav, Footer, Layout shell, design tokens                   │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS (fetch from client components)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND API (GCP Cloud Run)                                      │
│                                                                   │
│  ┌─ Routes ──────────────────────────────────────────────────┐  │
│  │ POST /api/register          → validate + write Sheets     │  │
│  │ POST /api/fundraiser        → create page + write Sheets  │  │
│  │ GET  /api/fundraiser/:slug  → read from Sheets            │  │
│  │ GET  /api/progress          → cached jar + participant ct │  │
│  │ GET  /api/donors/:slug      → opt-in donor entries        │  │
│  │ POST /api/donors            → add donor wall entry        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─ Background ─────────────────────────────────────────────┐   │
│  │ Cron/interval: poll Monobank jar → cache balance          │   │
│  │ Cron/interval: poll ECB/Mono rates → cache EUR rate       │   │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
              ┌───────────┼────────────┐
              ▼           ▼            ▼
┌──────────────┐  ┌────────────┐  ┌─────────────┐
│ Google Sheets │  │ Monobank   │  │ Email (TBD) │
│ (data store) │  │ Jar API    │  │ SendGrid /  │
│              │  │ (read-only)│  │ Resend / SES│
└──────────────┘  └────────────┘  └─────────────┘
```

### Data Flow

**Registration (Track A):**
1. User fills form on static page (client component)
2. Client POSTs to GCP backend `/api/register`
3. Backend validates, writes to Google Sheets "Registrations" tab
4. Backend returns success + participant ID
5. Client shows confirmation + Monobank jar redirect for donation
6. (Future) Backend sends confirmation email

**Fundraiser Creation (Track B):**
1. User fills form on static page (display name, photo upload, message, goal)
2. Client POSTs to GCP backend `/api/fundraiser`
3. Backend generates slug, writes to Google Sheets "Fundraisers" tab
4. Backend returns slug + shareable URL
5. Client redirects to the newly created fundraiser page

**Fundraiser Page View:**
1. Static shell loads (loading state via Suspense)
2. Client component fetches `/api/fundraiser/:slug`
3. Also fetches `/api/progress` for collective jar total
4. Also fetches `/api/donors/:slug` for donor wall
5. Renders with real data

**Live Progress:**
1. Backend polls Monobank `/bank/jar/{id}` every 60s
2. Caches result in memory (or simple file/KV)
3. Frontend polls `/api/progress` every 30s (or uses SSE)
4. Displays: amount (UAH→EUR), goal %, participant count, donor count

### Build Order (dependency chain)

```
Phase 1: Static event pages (no backend needed)
    → Landing page, tier cards, forms (UI only, no submission)
    → Breadcrumbs, routing, design tokens
    
Phase 2: Backend API scaffold
    → Cloud Run setup, Google Sheets integration
    → Registration endpoint
    
Phase 3: Live features
    → Monobank jar polling + progress endpoint
    → Fundraiser page creation + dynamic pages
    → Donor wall
    
Phase 4: Polish & comms
    → Email confirmations
    → Social sharing
    → i18n structure
```

## Key Technical Decisions

| Decision | Recommendation | Alternative |
|----------|---------------|-------------|
| Backend runtime | Cloud Run (Node.js) | Cloud Functions (more limited) |
| HTTP framework | Hono (fast, lightweight) | Express (heavier, more ecosystem) |
| Data store | Google Sheets API (service account) | Firestore (overkill for this scale) |
| Jar balance cache | In-memory on Cloud Run instance | Redis/Memorystore (unnecessary) |
| Image upload (fundraiser photos) | Cloud Storage bucket + signed URLs | Base64 in Sheets (size limit) |
| Email | Resend (simple, good DX) | SendGrid (more features, complex) |
| EUR conversion | Monobank `/bank/currency` endpoint | ECB XML feed (daily only) |
| Frontend data fetching | SWR (caching, revalidation) | Raw useEffect (simpler but no cache) |
