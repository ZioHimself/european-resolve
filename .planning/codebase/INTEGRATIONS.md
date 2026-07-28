# Integrations

**Mapped:** 2026-07-28

## External APIs

| Service | Usage | Module | Auth |
|---------|-------|--------|------|
| Google Apps Script | Events data source | `src/lib/events.ts`, `src/lib/events-server.ts` | Public endpoint (no auth) |

**Events API details:**
- URL: Google Apps Script macro endpoint (env var `NEXT_PUBLIC_EVENTS_API_URL`)
- Returns: JSON array of `RawEvent` objects
- Timeout: 10s (API), 15s (thumbnail downloads)
- Failure mode: graceful — returns empty array on error
- Called at build time (server) AND client-side (hydration refresh)

## External Assets

| Asset | Usage | Module |
|-------|-------|--------|
| Event thumbnail images | Downloaded from Google Drive URLs at build time | `src/lib/events-server.ts` |

Thumbnails are fetched from URLs in event data, resized to 800px width via `sharp`, and written to `public/events/{date}.jpg` during build.

## Databases

None. All data is either:
- Hardcoded in TypeScript (`src/data/members.ts`)
- Fetched from Google Apps Script at build time (events)

## Authentication Providers

None. Static site with no user authentication.

## Third-Party Services

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| Cloudflare Pages | Static hosting & CDN | GitHub push deploys |
| Google Fonts | Inter + Source Serif 4 | `next/font/google` (self-hosted at build) |

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_EVENTS_API_URL` | No (has default) | Override events API endpoint |

## Webhooks / Callbacks

None.

## Data Flow Summary

```
Google Sheets → Apps Script API → Next.js build → static HTML
                                → thumbnail URLs → sharp resize → public/events/
Members.ts (hardcoded) → Next.js build → static HTML
```
