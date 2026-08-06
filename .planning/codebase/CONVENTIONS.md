# Conventions

**Mapped:** 2026-07-28

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
```typescript
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = { ... };

export default function PageName() {
  return <section className={styles.root}>...</section>;
}
```

### Client Components (opt-in)
```typescript
"use client";

import { useState, useEffect } from "react";
import styles from "./Component.module.css";

export function ComponentName({ props }: { props: Type }) {
  // hooks here
  return <div className={styles.root}>...</div>;
}
```

### Component File Pattern
- Component: `ComponentName.tsx` — named export
- Styles: `ComponentName.module.css` — co-located CSS Module
- No barrel files (`index.ts`) — direct imports

## CSS Patterns

### Layer System
```css
@layer tokens, base, components, utilities;
```
- `tokens` — design variables (colors, typography, spacing)
- `base` — reset + element-level styles
- `components` — component-scoped via CSS Modules
- `utilities` — (reserved, not yet used)

### CSS Modules
- Class names use camelCase: `.heroInner`, `.aboutText`
- One module per component
- Modern CSS features used: nesting (`&`), `:has()`, `text-wrap: balance/pretty`

### Design Tokens
All tokens defined as CSS custom properties in `src/styles/tokens.css`:
- Color palette: black (#0a1628), amber (#d4a012), paper (#f5f2eb), red (#c41e3a)
- Scales: `--color-{name}-{100|80|60|40|20|10|05}`
- Semantic: `--color-text-primary`, `--color-background`, `--color-link`, etc.
- Typography: Major third scale (1.250), `--text-{size}`, `--font-{weight}`
- Spacing: 4px base unit, `--space-{1–32}`
- Dark mode: `[data-theme="dark"]` + `prefers-color-scheme` media query

## Data Patterns

### Static Data
```typescript
export type Member = { slug: string; name: string; ... };
export const members = [ ... ] satisfies Member[];
```
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

## Localization Copy

- **Ukrainian (`uk`) locale uses informal register (`ти`), never formal (`ви`)** — applies to `backend/src/email/locales/uk.ts` and any other Ukrainian-facing copy. Verbs and possessives must agree: informal singular imperatives (`заверши`, not `завершіть`), `твій/твоя/твоє/твої` not `ваш/ваша/ваше/ваші`.
- Prefer impersonal/passive constructions (`тебе зареєстровано`, `оплата вже здійснена`) over a 2nd-person past-tense verb when addressing the reader informally — Ukrainian past tense agrees with gender (`зареєстрований` vs `зареєстрована`) and the recipient's gender is unknown, so a gendered verb can't be used. Non-past tense (present/future) doesn't have this problem and can address `ти` directly (e.g. `ти отримаєш`).
- **Never assume the reader is male.** When a gendered form can't be avoided (e.g. a short button label where the impersonal/passive rephrase doesn't fit), use one of two forms:
  - Compact: common stem + `_` + feminine ending — `ти зроби_ла`, `ти взя_ла`.
  - Full: both forms separated by a slash — `ти зробив/зробила`, `ти взяв/взяла`.
- **Ukraine's defenders include servicewomen** — always use both forms, e.g. `для військовослужбовиць і військовослужбовців`, `для захисниць і захисників`. Never write `захисників`/`військовослужбовців` alone when referring to Ukraine's defenders collectively.
- **Never use an em dash (—) in user-facing copy.** It's a clear tell of AI-generated text. Use a period, a comma, or restructure the sentence instead. Applies to prose copy: locale strings, email copy, UI text. Code comments are not affected.
