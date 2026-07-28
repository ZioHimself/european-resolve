# Architecture

**Mapped:** 2026-07-28

## Pattern

**Static Site Generator** — Next.js App Router in static export mode. All pages are pre-rendered at build time. No server runtime in production.

## Layers

```
┌─────────────────────────────────────────────────┐
│  Pages (src/app/)                                │
│  ├── layout.tsx — root shell (Nav, Footer)       │
│  ├── page.tsx — home (hero + about + team grid)  │
│  ├── events/page.tsx — events timeline           │
│  ├── team/[slug]/page.tsx — member business card │
│  └── privacy/page.tsx — privacy policy           │
├─────────────────────────────────────────────────┤
│  Components (src/components/)                    │
│  ├── layout/ — Nav, Footer (static)             │
│  └── ui/ — MemberCard, BusinessCard, EventCard,  │
│            EventTimeline, ObfuscatedEmail         │
├─────────────────────────────────────────────────┤
│  Data / Lib (src/data/, src/lib/)                │
│  ├── members.ts — team member records            │
│  ├── events.ts — event types, parsing, fetching  │
│  ├── events-server.ts — server-only fetch + sharp│
│  └── qr.ts — vCard generation + QR SVG           │
├─────────────────────────────────────────────────┤
│  Styles (src/styles/)                            │
│  ├── globals.css — layer ordering + imports      │
│  ├── tokens.css — design tokens (colors, type)   │
│  └── base.css — reset + base typography          │
└─────────────────────────────────────────────────┘
```

## Data Flow

### Build Time
1. `events-server.ts` fetches raw events from Google Apps Script
2. Downloads event thumbnail images, resizes with `sharp`, writes to `public/events/`
3. `events.ts` parses raw events into display format
4. Pages render with full event data baked into static HTML
5. Team member pages generate vCard QR codes via `qr.ts`

### Client-Side (Hydration)
1. `EventTimeline` (client component) re-fetches events from API
2. Merges fresh data with build-time thumbnails
3. Falls back gracefully to build-time data on failure

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
