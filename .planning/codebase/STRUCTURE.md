# Structure

**Mapped:** 2026-07-28

## Directory Layout

```
european-resolve/
├── .claude/               # AI agent config (SDD framework)
├── docs/                  # Project documentation
│   ├── adrs/             # Architecture Decision Records (001–008)
│   ├── project/          # Project initialization config
│   ├── best-practices.md # Design/dev best practices
│   ├── tech-stack.md     # Technology decisions
│   └── sdd/             # SDD framework state
├── public/               # Static assets (served as-is)
│   ├── events/          # Build-time event thumbnails (generated)
│   ├── icons/           # Social platform icons (png)
│   └── team/            # Team member photos (png)
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── layout.tsx   # Root layout (Nav + Footer shell)
│   │   ├── page.tsx     # Home page
│   │   ├── page.module.css
│   │   ├── events/     # Events page
│   │   │   ├── page.tsx
│   │   │   └── page.module.css
│   │   ├── privacy/    # Privacy policy
│   │   │   ├── page.tsx
│   │   │   └── page.module.css
│   │   └── team/
│   │       └── [slug]/  # Dynamic team member pages
│   │           └── page.tsx
│   ├── components/
│   │   ├── layout/      # Site-wide layout components
│   │   │   ├── Nav.tsx / Nav.module.css
│   │   │   └── Footer.tsx / Footer.module.css
│   │   └── ui/          # Reusable UI components
│   │       ├── MemberCard.tsx / .module.css
│   │       ├── BusinessCard.tsx / .module.css
│   │       ├── EventCard.tsx / .module.css
│   │       ├── EventTimeline.tsx / .module.css
│   │       └── ObfuscatedEmail.tsx / .module.css
│   ├── data/
│   │   └── members.ts   # Team member records + types
│   ├── lib/
│   │   ├── events.ts        # Event types, parsing, client fetch
│   │   ├── events-server.ts # Server-only fetch + thumbnail processing
│   │   └── qr.ts            # vCard + QR code generation
│   ├── styles/
│   │   ├── globals.css  # Layer ordering + imports
│   │   ├── tokens.css   # Design tokens (colors, typography, spacing)
│   │   └── base.css     # CSS reset + base styles
│   └── __tests__/
│       ├── components.test.tsx       # Nav, Footer, MemberCard, BusinessCard
│       ├── events.test.ts            # parseEvents, groupOrganizersByRole
│       ├── events-page.spec.tsx      # BDD/Gherkin EventTimeline scenarios
│       ├── members.test.ts           # members data + getSocialUrl/Handle
│       ├── qr.test.ts               # vCard generation
│       ├── ObfuscatedEmail.test.tsx  # Email obfuscation component
│       └── features/
│           └── events-page.feature   # Gherkin feature file
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts
├── package.json
└── AGENTS.md
```

## Key Locations

| What | Where |
|------|-------|
| Pages | `src/app/{route}/page.tsx` |
| Page styles | `src/app/{route}/page.module.css` |
| Layout components | `src/components/layout/` |
| UI components | `src/components/ui/` |
| Component styles | Co-located `*.module.css` |
| Static data | `src/data/` |
| Business logic | `src/lib/` |
| Design tokens | `src/styles/tokens.css` |
| Tests | `src/__tests__/` |
| BDD features | `src/__tests__/features/` |
| Static assets | `public/` |
| ADRs | `docs/adrs/` |

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Pages | `page.tsx` in route folder | `src/app/events/page.tsx` |
| Components | PascalCase | `MemberCard.tsx` |
| CSS Modules | PascalCase matching component | `MemberCard.module.css` |
| Data files | camelCase | `members.ts` |
| Lib files | camelCase, domain-prefixed | `events-server.ts` |
| Tests | `{name}.test.ts(x)` or `{name}.spec.tsx` | `events.test.ts` |
| Feature files | kebab-case | `events-page.feature` |
| ADRs | `NNN-kebab-case.md` | `001-nextjs-static-export.md` |
| Team photos | `{slug}.png` | `michael-desloover.png` |
| Event thumbnails | `{date}.jpg` | `2026-02-22.jpg` |

## Path Alias

`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vitest.config.ts`)
