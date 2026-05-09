# ADR-007: Hybrid Events Data — Build-Time SSG + Client-Side Refresh

**Status:** Accepted
**Date:** 2026-05-09

## Problem

Events data lives in Google Sheets (non-technical team members edit it). The site must be static for SEO, but events should update without redeployment.

## Decision

Hybrid approach: fetch Google Sheets data at build time (baked into static HTML for SEO), then re-fetch client-side on page load for freshness.

## Rationale

- Build-time fetch produces static HTML — search engines index all events
- Client-side refresh shows latest data without waiting for a rebuild
- Google Sheets macro REST API is the data source — details TBD
- Pattern is native to Next.js: server components for build-time, `'use client'` for runtime

## Consequences

- Brief moment on page load where build-time data shows before client data replaces it — content is the same or newer, never stale-then-empty
- Requires `GOOGLE_SHEETS_API_URL` as a build-time environment variable in Cloudflare Pages
- If Google Sheets API is down at build time, build uses previously cached data or empty state
- If API is down at runtime, client-side fetch fails silently — static data remains visible
