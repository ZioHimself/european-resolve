# ADR-001: Next.js with Static Export

**Status:** Accepted
**Date:** 2026-05-09

## Problem

Need a framework for a static website on Cloudflare Pages. Must support: SEO via static HTML, interactive features (events search, future tracker), strong AI tooling coverage for development velocity.

## Options Considered

1. **Vanilla Vite + TypeScript + HTML + CSS** — minimal, but no component model, painful for 5+ pages with shared layouts and future interactive tracker
2. **Astro** — static-first, islands architecture, but smaller AI knowledge base, framework lock-in concern
3. **Next.js with `output: 'export'`** — React ecosystem, deep AI coverage, static HTML output, upgrade path to server-side if needed

## Decision

Next.js with `output: 'export'`.

## Rationale

- React has the deepest AI training data coverage — directly impacts development speed
- `output: 'export'` generates pure static HTML files, identical SEO to hand-written HTML
- Component model handles shared layouts, team pages, and future tracker without framework-building
- Upgrade path: remove `output: 'export'` to enable server-side features without rewriting
- Cloudflare Pages serves the `out/` directory with zero configuration

## Consequences

- Ships React runtime to client (~40KB gzipped) even for static pages
- No server-side features (API routes, middleware, ISR) while in static export mode
- `next/image` optimization unavailable — use `<img>` with manual optimization
