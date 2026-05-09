# ADR-006: CSS Modules + Modern CSS, No Runtime CSS-in-JS

**Status:** Accepted
**Date:** 2026-05-09

## Problem

Need a styling approach that gives full freedom, works with static export, and produces zero runtime overhead.

## Options Considered

1. **Tailwind CSS** — utility-first, fast prototyping, but opinionated class names, adds abstraction over CSS
2. **CSS-in-JS (styled-components, emotion)** — component-scoped, but runtime cost, hydration complexity
3. **CSS Modules + modern CSS** — component-scoped via build tooling, zero runtime, full CSS control

## Decision

CSS Modules for component scoping. Modern CSS features (nesting, `@layer`, container queries, `:has()`) for everything else. Global CSS for design tokens and base resets.

## Rationale

- Zero runtime cost — styles are extracted at build time
- Full control over the design system — no framework opinions between the designer and CSS
- Modern CSS (2025–2026) covers what historically required preprocessors or JS: nesting, scope, container queries
- `@layer` ordering (tokens, base, components, utilities) provides explicit cascade control
- Next.js has built-in CSS Module support — no additional configuration

## Consequences

- No utility classes out of the box (unlike Tailwind) — more CSS to write per component
- Team must know modern CSS features — acceptable given AI-assisted development
- Consistent with the design system's precision: every value is explicit, nothing is generated
