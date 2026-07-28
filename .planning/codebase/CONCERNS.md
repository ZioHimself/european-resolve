# Concerns

**Mapped:** 2026-07-28

## Technical Debt

| Area | Severity | Description | Location |
|------|----------|-------------|----------|
| `dangerouslySetInnerHTML` | Medium | Used for member bios (contains HTML links). XSS risk if data source is compromised | `src/components/ui/BusinessCard.tsx:40` |
| Hardcoded API URL | Low | Default Google Apps Script URL embedded in source; env var override exists but URL is visible | `src/lib/events.ts:2`, `src/lib/events-server.ts:4` |
| Empty catch blocks | Low | Several `catch {}` blocks swallow errors silently without logging | `src/lib/events.ts:99`, `src/lib/events-server.ts:57-59` |
| `resize-marco` script | Trivial | Absolute path to developer's machine in `package.json` scripts | `package.json:14` |

## Security Considerations

| Concern | Risk | Mitigation |
|---------|------|------------|
| Email obfuscation | Low | Client-side reveal via data attributes — determined bots can still extract | `ObfuscatedEmail.tsx` |
| No CSP headers | Low | Static site on Cloudflare Pages — could add via `_headers` file | — |
| External link targets | None | All external links use `rel="noopener noreferrer"` | Consistent across components |
| No cookies/analytics | None | GDPR-compliant by design — nothing to track | Privacy page confirms |

## Performance Considerations

| Area | Impact | Notes |
|------|--------|-------|
| Build-time thumbnail download | Medium | Each build fetches and processes external images; slow builds if many events or network issues | `events-server.ts` |
| No image optimization | Low | `images: { unoptimized: true }` — all images served at original size on mobile | Static export constraint |
| Client-side API re-fetch | Low | EventTimeline fetches on hydration even if build data is fresh | Designed for freshness |
| QR code SVGs inline | Trivial | Generated server-side and injected via `dangerouslySetInnerHTML` — small payload | `team/[slug]/page.tsx` |

## Fragile Areas

| Area | Why | Risk |
|------|-----|------|
| Google Apps Script API | External dependency; URL is a deployment-specific hash that breaks on script redeployment | Events page shows empty if API goes down |
| Thumbnail processing | Depends on external URLs being accessible at build time; silent failure per image | Missing thumbnails not immediately obvious |
| `members.ts` as CMS | Adding/editing members requires code changes and deployment | Acceptable for small team |

## Known Gaps

| Gap | Impact | Notes |
|-----|--------|-------|
| No 404 page | Low | Next.js default 404; no custom styling |
| No sitemap | Low | Would help SEO for a public org site |
| No OpenGraph images | Low | Social sharing previews are text-only |
| No contact form | Medium | Only email links; no structured way for public to reach the org |
| Light mode only (forced) | Low | `data-theme="light"` hardcoded in `<html>`; dark mode tokens defined but unused |
| No CI/CD config in repo | Low | Cloudflare Pages likely configured via dashboard; no `.github/workflows/` visible |

## Deleted `.cursorrules`

The git status shows `.cursorrules` was deleted (tracked file removed). This file was likely replaced by `.cursor/rules/` directory with more granular rule files.
