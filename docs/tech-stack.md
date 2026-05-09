# Tech Stack

## Language

- **TypeScript 5.x** — strict mode, ES2022+ target

## Framework

- **Next.js** — App Router, `output: 'export'` (pure static HTML generation)

## Styling

- **CSS Modules** — component-scoped styles, zero runtime
- **Modern CSS** — nesting, `@layer`, container queries, `:has()`, View Transitions API

## Build & Package

- **npm** — package manager
- **Next.js CLI** — build tooling (`next build`, `next dev`)

## Testing

- **Vitest** — unit + component tests
- **Testing Library** — DOM assertions

## Code Quality

- **ESLint** — linting (Next.js default config)
- **Prettier** — formatting
- **TypeScript** — type checking (`tsc --noEmit`)

## CI/CD

- **GitHub Actions** — build, lint, test, deploy
- **Trunk-based development** — push to `main`, no PRs

## Deployment

- **Cloudflare Pages** — static hosting from `out/` directory
- Git-triggered deploys via GitHub integration

## Security & Compliance

- **GDPR** — Belgian NGO, data minimization, cookie consent if analytics added
- **No sensitive data in AI tools** — per information security policy
- **No server-side data processing** — static site, no backend
