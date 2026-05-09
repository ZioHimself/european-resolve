# Best Practices — European Resolve

## 1. Language & Framework Conventions

### Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Files (components) | PascalCase | `EventCard.tsx`, `EventCard.module.css` |
| Files (utilities) | camelCase | `formatDate.ts` |
| Files (pages) | `page.tsx` in route dir | `src/app/events/page.tsx` |
| Variables, functions | camelCase | `eventList`, `formatDate()` |
| Types, interfaces | PascalCase, no `I` prefix | `Event`, `MemberProfile` |
| CSS classes | camelCase in Modules | `styles.cardTitle` |
| Constants | UPPER_SNAKE for true constants | `MAX_EVENTS_PER_PAGE` |
| Data files | camelCase | `src/data/events.ts` |

### Do

- Use `satisfies` for typed data objects: `const events = [...] satisfies Event[]`
- Use `readonly` on data arrays and objects that shouldn't mutate
- Co-locate CSS Module files with their component: `EventCard.tsx` + `EventCard.module.css`
- Use Next.js `<Link>` for internal navigation, standard `<a>` for external
- Mark interactive components with `'use client'` — keep the boundary as narrow as possible

### Don't

- Don't use `any` — use `unknown` and narrow, or define a proper type
- Don't use default exports for components — use named exports (`export function EventCard`)
- Don't import from `react` for server components — only needed in `'use client'` files
- Don't use `@import` in CSS Modules — use `composes` or CSS `@layer` for shared styles
- Don't use `next/image` with static export — use `<img>` with width/height attributes

### Import Order

```typescript
// 1. React/Next.js
import Link from 'next/link';

// 2. Third-party libraries
import { formatDistanceToNow } from 'date-fns';

// 3. Project modules (absolute paths)
import { events } from '@/data/events';

// 4. Relative imports
import { EventCard } from './EventCard';

// 5. Styles (always last)
import styles from './Events.module.css';
```

## 2. Quality Standards

### Testing

- **Unit tests** for data transformations, filters, formatters — pure functions in `src/lib/`
- **Component tests** via Testing Library — render component, assert visible text/structure
- **No E2E tests in MVP** — static site, manual smoke testing sufficient
- Test file location: co-located as `*.test.ts(x)` next to source

### Error Handling

- Static site — most errors are build-time. Fail the build rather than ship broken pages
- Use TypeScript strict mode to catch null/undefined at compile time
- Client-side interactivity (search, filters): wrap in try/catch, show user-friendly fallback
- Never swallow errors silently in `'use client'` components

### Security

- **No secrets in client code** — static export means everything is public
- **No analytics without cookie consent** — GDPR requirement
- **External links**: use `rel="noopener noreferrer"` on `target="_blank"` links
- **No user input persisted** — search/filter is client-side only, no data sent anywhere
- **Subresource Integrity** for CDN assets if any are loaded externally

### Code Review Focus

- Every page renders meaningful content as static HTML (view source, not just hydrated DOM)
- CSS doesn't break without JavaScript
- No hardcoded personal data — member info comes from typed data files
- Accessibility: semantic HTML, alt text, keyboard navigation, sufficient contrast

## 3. Architecture & Design Patterns

### Directory Structure

```
src/
├── app/                    # Next.js App Router (pages + layouts)
│   ├── layout.tsx          # Root layout (nav, footer, metadata)
│   ├── page.tsx            # Landing page
│   ├── about/page.tsx
│   ├── events/page.tsx
│   └── members/[slug]/page.tsx  # Business card pages
├── components/             # Reusable components
│   ├── ui/                 # Generic UI (Button, Card, Tag)
│   └── layout/             # Layout components (Nav, Footer, Section)
├── data/                   # Static data as typed TS objects
├── lib/                    # Utility functions (formatters, filters)
└── styles/                 # Global CSS, design tokens
```

### Data Management

- All content lives in `src/data/` as typed TypeScript objects
- Export arrays with `satisfies` for type safety without losing literal types
- No runtime data fetching in MVP — all data baked into static HTML at build time
- When data grows, migrate to Markdown/JSON content collections — same build-time pattern

### CSS Architecture

```css
/* src/styles/tokens.css — design tokens via CSS custom properties */
@layer tokens {
  :root {
    --color-primary: ...;
    --space-md: ...;
    --font-heading: ...;
  }
}

/* src/styles/base.css — resets and base typography */
@layer base { ... }

/* Component.module.css — component-scoped via CSS Modules */
@layer components { ... }
```

- Use `@layer` ordering: `tokens`, `base`, `components`, `utilities`
- Use CSS nesting instead of BEM or Sass
- Use container queries for component-level responsiveness
- Use `clamp()` for fluid typography and spacing

### Accessibility

- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`
- Language attribute: `<html lang="en">` (adjust per page if multilingual)
- Skip-to-content link as first focusable element
- All images have descriptive `alt` text (empty `alt=""` only for decorative images)

## 4. Development Workflow

### Git

- **Trunk-based**: push directly to `main`
- **No branches, no PRs** — human reviews in IDE, commits manually
- **Commit messages**: imperative mood, concise (`Add events page`, `Fix nav alignment`)
- **No agent commits** — AI agents write code, humans commit

### CI/CD

- GitHub Actions on push to `main`: lint, typecheck, test, build
- Build output (`out/`) deployed to Cloudflare Pages automatically
- Build must succeed locally (`npm run build`) before pushing

### Anti-Patterns

- NEVER use `getServerSideProps`, `getStaticProps` (Pages Router) — App Router only
- NEVER add API routes — static export doesn't support them
- NEVER use CSS-in-JS runtime libraries (styled-components, emotion, Tailwind runtime)
- NEVER store member contact info beyond what's on the public business card
- NEVER add tracking/analytics without GDPR-compliant cookie consent mechanism
