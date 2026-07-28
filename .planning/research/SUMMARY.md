# Research Summary

**Completed:** 2026-07-28

## Key Findings

### Stack
- Extend existing Next.js 16 static export for frontend (no framework change)
- **GCP Cloud Run** for backend API (simpler than only-facts GKE pattern; auto-scales to zero)
- **Hono** (lightweight HTTP framework) over Express for Cloud Run
- **Google Sheets API** (service account) for data persistence — same operational model as team's existing Sheets usage
- **Monobank Jar API** — two public, unauthenticated endpoints for reading jar balance; no SDK needed

### Table Stakes
- Event landing page with live progress stats
- Two-track registration (subscription tiers + personal fundraising)
- Tier cards with transparent cause/logistics fee split
- Fundraiser page creation with shareable URLs
- Monobank jar redirect for all donation CTAs
- Social sharing buttons on fundraiser pages
- GDPR consent at registration

### Critical Integration: Monobank Jar
```
GET https://api.monobank.ua/bank/jar/{longJarId}
→ { title, amount, goal }
```
- **No auth required** — community-documented public endpoint
- Amount in UAH kopiykas; need EUR conversion for Belgian audience
- Rate limits exist — poll from backend only (every 60s), serve cached value to all clients
- Resolve short jar link to longJarId once, cache forever

### Critical Integration: Google Sheets
- Existing pattern: Apps Script macro → public JSON endpoint (read-only)
- New pattern: GCP backend → Sheets API (service account) for read + write
- Sheets handles this scale easily (~hundreds of registrations, not millions)
- Team can view/edit data directly in familiar Sheets UI

### Watch Out For
1. **UAH/EUR currency display** — jar reports in UAH; Belgian donors think in EUR. Decide display currency + conversion approach upfront.
2. **Static export + dynamic fundraiser pages** — use Next.js 16 fallback shell + client-side fetching; don't fight the static export constraint.
3. **CORS** — backend must allow `european-resolve.org` origin explicitly.
4. **Monobank rate limits** — never call jar API from client; always proxy through backend cache.
5. **Slug uniqueness** — append random suffix to prevent collisions.
6. **Photo uploads** — use Cloud Storage signed URLs, not base64 in Sheets.

### Design Token Mapping (Prototype → Project)

| Prototype Token | Value | Project Equivalent | Action |
|----------------|-------|-------------------|--------|
| `--ua-blue` | oklch(0.42 0.19 258) | (new) `--color-ua-blue` | Add to tokens.css |
| `--ua-yellow` | oklch(0.85 0.17 92) | (new) `--color-ua-yellow` | Add to tokens.css |
| `--ink` | oklch(0.16 0.02 250) | `--color-black` (#0a1628) | Direct map |
| `--paper` | oklch(0.985 0.003 240) | `--color-paper` (#f5f2eb) | Direct map |
| `--card` | oklch(1 0 0) | `--color-surface` (#ffffff) | Direct map |
| `--border` | oklch(0.9 0.01 250) | `--color-border` (--color-black-20) | Close enough |
| `--muted` | oklch(0.96 0.01 250) | `--color-black-05` (#f3f4f6) | Close map |
| `--primary` | oklch(0.36 0.13 258) | `--color-ua-blue` (same hue family) | Use ua-blue |
| `--radius` | 0.5rem | `--radius-lg` (0.5rem) | Exact match |
| font-family | Inter | `--font-sans` (Inter) | Already set |

### Phasing Recommendation

| Phase | Delivers | Backend Needed |
|-------|----------|---------------|
| 1 — Static Event Pages | Landing page, tier cards, forms (UI shell), breadcrumbs, design tokens | No |
| 2 — Backend API | Cloud Run scaffold, registration endpoint, Google Sheets write | Yes |
| 3 — Live Features | Jar polling, progress dashboard, fundraiser creation + pages, donor wall | Yes |
| 4 — Communications & Polish | Confirmation emails, social sharing, i18n structure, post-event state | Yes |

Files: `.planning/research/`
