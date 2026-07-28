# Stack

**Mapped:** 2026-07-28

## Language & Runtime

| Technology | Version | Notes |
|-----------|---------|-------|
| TypeScript | ^6.0.3 | Strict mode, bundler module resolution |
| Node.js | (implied by Next.js 16) | ES2022 target |

## Framework

| Framework | Version | Configuration |
|-----------|---------|---------------|
| Next.js | ^16.2.6 | App Router, static export (`output: "export"`) |
| React | ^19.2.6 | Server components + `'use client'` for interactivity |
| React DOM | ^19.2.6 | — |

**Key Next.js config:**
- `output: "export"` — pure static HTML generation, no server runtime
- `images: { unoptimized: true }` — no image optimization (standard `<img>` tags)

## Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^16.2.6 | Framework |
| `react` / `react-dom` | ^19.2.6 | UI library |
| `qrcode` | ^1.5.4 | Generate QR codes (vCards for team members) |
| `sharp` | ^0.34.5 | Image processing (event thumbnail resizing at build) |
| `server-only` | ^0.0.1 | Guard server-only code from client bundles |
| `typescript` | ^6.0.3 | Language |
| `@types/node` | ^25.6.2 | Node type definitions |
| `@types/react` | ^19.2.14 | React type definitions |
| `@types/react-dom` | ^19.2.3 | React DOM type definitions |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | ^4.1.5 | Test runner |
| `@testing-library/react` | ^16.3.2 | Component testing utilities |
| `@testing-library/jest-dom` | ^6.9.1 | DOM assertion matchers |
| `@vitejs/plugin-react` | ^6.0.1 | React plugin for Vitest |
| `jsdom` | ^29.1.1 | DOM environment for tests |
| `@amiceli/vitest-cucumber` | ^6.5.0 | BDD/Gherkin test support |
| `@types/qrcode` | ^1.5.6 | QR code type definitions |
| `eslint` | ^9.39.4 | Linting |
| `eslint-config-next` | ^16.2.6 | Next.js ESLint rules |
| `@eslint/eslintrc` | ^3.3.5 | ESLint config utilities |
| `prettier` | ^3.8.3 | Code formatting |

## Configuration

| File | Purpose |
|------|---------|
| `next.config.ts` | Static export, unoptimized images |
| `tsconfig.json` | Strict TS, bundler resolution, `@/*` path alias |
| `vitest.config.ts` | jsdom environment, React plugin, `@/` alias |
| `vitest.setup.ts` | Loads `@testing-library/jest-dom/vitest` matchers |

## Build & Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Local development server |
| `build` | `next build` | Static export to `out/` |
| `lint` | `eslint .` | Lint codebase |
| `typecheck` | `tsc --noEmit` | Type checking |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Watch mode |
| `format` | `prettier --write .` | Format all files |

## Fonts

- **Inter** (sans-serif) — subsets: latin, latin-ext, cyrillic; CSS variable `--font-inter`
- **Source Serif 4** (serif) — subsets: latin, latin-ext, cyrillic; CSS variable `--font-source-serif`

Loaded via `next/font/google` with `display: "swap"`.

## Deployment

- **Target:** Cloudflare Pages
- **Output:** Static files from `out/` directory
- **Trigger:** Push to `main` branch
