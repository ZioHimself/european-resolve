<!-- GSD:project-start source:PROJECT.md -->
## Project

**Run for Ukraine 2026**

A charity run event platform at `european-resolve.org/events/2026-run-for-ukraine/` that lets participants register, create personal fundraising pages, and track collective progress toward a demining goal. All donations redirect to an external Monobank jar belonging to the beneficiary (Hurkit — charging stations for defenders). The platform never holds, routes, or reconciles donor money.

**Core Value:** Participants can register and share personal fundraising pages that drive donations to the Monobank jar with full transparency about where money goes.

### Constraints

- **Static export**: Frontend pages must work as pre-rendered HTML (SEO, Cloudflare Pages)
- **No payment processing**: Platform redirects to Monobank jar; never touches money
- **GDPR**: Belgian NGO, data minimization, explicit consent for communications
- **Existing design system**: Must use project's CSS Modules + tokens (no Tailwind, no CSS-in-JS)
- **Google Sheets**: Backend writes registrations to Sheets (team's existing operational tool)
- **Monobank API**: Jar balance may be UAH-denominated; EUR conversion approach needed
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

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
## Deployment
- **Target:** Cloudflare Pages
- **Output:** Static files from `out/` directory
- **Trigger:** Push to `main` branch
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Code Style
- **TypeScript strict mode** — all strict checks enabled
- **Prettier** for formatting (default config)
- **ESLint** with `eslint-config-next`
- **No semicolons? / Semicolons?** — semicolons used consistently
- **Double quotes** for strings (JSX attributes)
- **Arrow functions** preferred for callbacks and inline functions
- **Named exports** for components (no default exports except pages)
## Component Patterns
### Server Components (default)
### Client Components (opt-in)
### Component File Pattern
- Component: `ComponentName.tsx` — named export
- Styles: `ComponentName.module.css` — co-located CSS Module
- No barrel files (`index.ts`) — direct imports
## CSS Patterns
### Layer System
- `tokens` — design variables (colors, typography, spacing)
- `base` — reset + element-level styles
- `components` — component-scoped via CSS Modules
- `utilities` — (reserved, not yet used)
### CSS Modules
- Class names use camelCase: `.heroInner`, `.aboutText`
- One module per component
- Modern CSS features used: nesting (`&`), `:has()`, `text-wrap: balance/pretty`
### Design Tokens
- Color palette: black (#0a1628), amber (#d4a012), paper (#f5f2eb), red (#c41e3a)
- Scales: `--color-{name}-{100|80|60|40|20|10|05}`
- Semantic: `--color-text-primary`, `--color-background`, `--color-link`, etc.
- Typography: Major third scale (1.250), `--text-{size}`, `--font-{weight}`
- Spacing: 4px base unit, `--space-{1–32}`
- Dark mode: `[data-theme="dark"]` + `prefers-color-scheme` media query
## Data Patterns
### Static Data
- Typed TypeScript objects with `satisfies` for inference + validation
- No JSON files — TypeScript for type safety
### Type Exports
- Types exported from same file as data
- Helper functions co-located with data (`getSocialUrl`, `getSocialHandle`)
### API Data
- Raw type (`RawEvent`) for API response shape
- Display type (`EventDisplay`) for component consumption
- Transform function (`parseEvents`) separates concerns
## Import Conventions
- Path alias: `@/` → `src/`
- Framework imports first (`next`, `react`)
- Types imported with `import type { ... }`
- Relative imports for co-located files only (CSS modules)
## Error Handling
- **Graceful degradation** — API failures return empty arrays, never throw
- **AbortController** for network timeouts
- **try/catch** with empty catch blocks for non-critical failures (thumbnails)
- **`notFound()`** from Next.js for invalid dynamic routes
## Accessibility
- Skip-to-content link in root layout
- `aria-label` on navigation landmarks
- Keyboard-focusable interactive elements
- `alt` text on all images
- Focus ring: amber, 2px solid, 2px offset
- `prefers-reduced-motion` respected (animations disabled)
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern
## Layers
```
```
## Data Flow
### Build Time
### Client-Side (Hydration)
### Static Data
- Members: hardcoded TypeScript array in `src/data/members.ts`
- No CMS, no database
## Key Abstractions
| Abstraction | Location | Purpose |
|-------------|----------|---------|
| `Member` type | `src/data/members.ts` | Team member schema (slug, name, title, city, photo, socials) |
| `RawEvent` / `EventDisplay` | `src/lib/events.ts` | Separate internal vs display event shapes |
| `SocialLink` (string \| object) | `src/data/members.ts` | Flexible social link format (URL-only or URL+handle) |
| `parseEvents()` | `src/lib/events.ts` | Transform raw API data → display data |
| `groupOrganizersByRole()` | `src/lib/events.ts` | Group event organizers for rendering |
| `generateVCard()` / `generateQRSvg()` | `src/lib/qr.ts` | vCard 3.0 + QR code generation |
| `ObfuscatedEmail` | `src/components/ui/` | Anti-spam email rendering (client-only reveal) |
## Entry Points
| Entry | Route | Rendering |
|-------|-------|-----------|
| Home | `/` | Static (server component) |
| Events | `/events` | Static with client-side refresh |
| Team Member | `/team/[slug]` | Static via `generateStaticParams()` |
| Privacy | `/privacy` | Static (server component) |
## Server vs Client Components
| Component | Type | Reason |
|-----------|------|--------|
| All pages | Server | Static rendering |
| `EventTimeline` | Client (`'use client'`) | Hydration + API refresh |
| `ObfuscatedEmail` | Client (`'use client'`) | Click handler for email reveal |
| Nav, Footer, Cards | Server | No interactivity needed |
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
