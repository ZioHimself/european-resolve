# AGENTS.md
<!-- This file orients AI agents working in this repository. Keep it under 200 lines. -->

## Project Overview

European Resolve is a static website for a Belgian NGO focused on European security and democracy.
It serves the public and policymakers by presenting research, events, and civic action resources.
Deployed as static HTML on Cloudflare Pages — no server-side runtime.

## Architecture

- **Next.js (static export)** — React-based framework generating pure static HTML (`output: 'export'`)
- **CSS Modules + modern CSS** — component-scoped styling, no runtime CSS-in-JS
- **Cloudflare Pages** — static file hosting from `out/` directory

Data flow: Content (JSON/TSX) -> Next.js build -> static HTML/CSS/JS -> Cloudflare Pages CDN

Deployment: Static files served from Cloudflare Pages, triggered by push to `main`.

## Key Directories

| Directory | Contains |
|-----------|----------|
| `src/app/` | Next.js App Router pages and layouts |
| `src/components/` | React components (static + interactive) |
| `src/data/` | Content data (events, member info) as JSON/TS |
| `src/styles/` | Global CSS and design tokens |
| `public/` | Static assets (images, fonts, favicons) |
| `docs/` | Project documentation |
| `.claude/` | SDD framework files (DO NOT MODIFY) |

## Build, Test, Run

| Action | Command |
|--------|---------|
| Build | `npm run build` |
| Test (all) | `npm test` |
| Test (single file) | `npx vitest run {file}` |
| Lint | `npm run lint` |
| Format | `npx prettier --write .` |
| Type check | `npx tsc --noEmit` |
| Run locally | `npm run dev` |

## Tech Stack

- **Language:** TypeScript 5.x (strict mode)
- **Framework:** Next.js (App Router, static export)
- **Styling:** CSS Modules + modern CSS (nesting, @layer, container queries)
- **Test framework:** Vitest + Testing Library
- **CI/CD:** GitHub Actions
- **Deployment:** Cloudflare Pages (static)

## Coding Conventions

- CSS Modules for component styles; global CSS only for tokens and base resets
- Modern CSS features (nesting, `:has()`, `@layer`) preferred over JS workarounds
- `'use client'` only on components that need browser interactivity
- Static data as typed TypeScript objects in `src/data/`
- All pages must render meaningful content without JavaScript (SEO)

## Forbidden Patterns

- NEVER make git commits — human commits only, trunk-based development
- NEVER use CSS-in-JS runtime libraries (styled-components, emotion)
- NEVER add server-side features (API routes, middleware, ISR) — static export only
- NEVER store sensitive org data in code or AI tool context
- NEVER modify files listed in `sdd-config.yaml → protected_files`

## Agent-Specific Guidance

- When creating new pages, follow Next.js App Router conventions (`src/app/{route}/page.tsx`)
- When creating components, co-locate CSS Module files (`Component.module.css`)
- If a task is ambiguous, flag it as an escalate-level gap — do not guess
- Read `docs/best-practices.md` before making any design decisions
- All SDD pipeline artifacts go under `docs/sdd/{epic}/{task}/`
- This is a static site — every page must work as pre-rendered HTML

## Security & Compliance

- **GDPR applies** — Belgian NGO, data minimization, cookie consent if analytics added
- **No sensitive data in AI tools** — per information security policy
- **Source protection** — minimize collection, restrict access, pseudonymize where possible
- **72h breach notification** to Belgian DPA if personal data breach with risk to individuals

## Known Gotchas

- `output: 'export'` means no `next/image` optimization (use standard `<img>` or configure loader)
- No dynamic routes without `generateStaticParams`
- Test commands won't work until project is scaffolded (`npm init` + dependencies)
