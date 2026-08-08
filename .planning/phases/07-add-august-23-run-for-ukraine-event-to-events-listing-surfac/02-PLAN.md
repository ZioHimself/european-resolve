---
phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
plan: 02
type: tdd
wave: 1
depends_on:
  - "01"
files_modified:
  - src/lib/events.ts
  - src/components/ui/EventCard.tsx
  - src/components/ui/EventCard.module.css
  - src/__tests__/events.test.ts
  - src/__tests__/events-page.spec.tsx
  - src/__tests__/features/events-page.feature
autonomous: true
requirements:
  - EVNT-04
must_haves:
  truths:
    - "Internal announcement URLs open in same tab without target or rel attrs (D-15, D-17)"
    - "External announcement URLs still open in new tab with rel=noopener noreferrer (D-16 external-only)"
    - "Future-dated and today-dated events show Upcoming badge beside type badge (D-22, D-23, D-24, D-25)"
    - "Past-dated events show date and type only — no Upcoming badge and no Past label (D-26)"
    - "Run for Ukraine fixture shows participation CTA to hub and Upcoming badge (D-01, D-03, D-04, D-13, D-14)"
    - "No Facebook URL or special-case UI for Run for Ukraine (D-02, D-16, D-17)"
  artifacts:
    - path: src/lib/events.ts
      provides: isInternalAnnouncementUrl and isEventUpcoming helpers
      exports: ["isInternalAnnouncementUrl", "isEventUpcoming"]
    - path: src/components/ui/EventCard.tsx
      provides: conditional announcement links and Upcoming badge in meta row
      contains: "isEventUpcoming"
    - path: src/components/ui/EventCard.module.css
      provides: badge row layout for type + Upcoming badges (D-24)
      contains: "badges"
    - path: src/__tests__/events.test.ts
      provides: unit tests for both helpers
    - path: src/__tests__/features/events-page.feature
      provides: link + Upcoming BDD scenarios
  key_links:
    - from: src/components/ui/EventCard.tsx
      to: src/lib/events.ts
      via: isInternalAnnouncementUrl + isEventUpcoming
      pattern: "isEventUpcoming\\(event\\.date\\)"
    - from: src/components/ui/EventCard.module.css
      to: src/components/ui/EventCard.tsx
      via: styles.badges wrapper in meta row
      pattern: "styles\\.badges"
---

<objective>
Implement generic EventCard enhancements via TDD: internal vs external announcement links (D-15–D-17), auto-derived Upcoming badge (D-22–D-26), and badge row layout.

Purpose: Participation funnel entry (D-01) requires same-tab hub navigation and scannable upcoming status without spreadsheet columns or special-case UI.
Output: Exported helpers, updated EventCard + CSS, passing unit + BDD tests.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
@$HOME/.claude/get-shit-done/references/tdd.md
</execution_context>

<context>
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-RESEARCH.md
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-PATTERNS.md
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-VALIDATION.md
@src/lib/events.ts
@src/components/ui/EventCard.tsx
@src/components/ui/EventCard.module.css
@src/__tests__/events.test.ts
@src/__tests__/events-page.spec.tsx
@src/__tests__/features/events-page.feature

<interfaces>
From src/lib/events.ts (existing exports):
```typescript
export type EventDisplay = {
  date: string;
  name: string;
  place: string;
  type: string;
  thumbnail: string;
  image_credit: string;
  announcement_url: string;
  announcement_title: string;
  organizers: { name: string; website?: string; role: string }[];
  media_features: string[];
  tags: string[];
};
export function groupOrganizersByRole(/* ... */): OrganizersByRole;
export function parseEvents(/* ... */): EventDisplay[];
```

From src/components/ui/EventCard.tsx (formatDate pattern for D-22):
```typescript
function formatDate(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  // ...
}
```

Current meta row (lines 35-38) — single type badge only:
```typescript
<div className={styles.meta}>
  <span className={styles.date}>{formatDate(event.date)}</span>
  <span className={styles.badge}>{event.type}</span>
</div>
```

Target helpers (co-located in events.ts after groupOrganizersByRole):
```typescript
export function isInternalAnnouncementUrl(url: string): boolean {
  return url.startsWith("/");
}

export function isEventUpcoming(isoDate: string, now: Date = new Date()): boolean {
  const eventDay = new Date(isoDate + "T00:00:00");
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return eventDay >= todayStart;
}
```

Optional `now` parameter enables deterministic unit tests via explicit Date argument (no fake timers required in helper itself). BDD tests use vi.setSystemTime before render.
</interfaces>
</context>

<feature>
  <name>EventCard link behavior + Upcoming badge</name>
  <files>src/lib/events.ts, src/components/ui/EventCard.tsx, src/components/ui/EventCard.module.css, src/__tests__/events.test.ts, src/__tests__/events-page.spec.tsx, src/__tests__/features/events-page.feature</files>
  <behavior>
    Unit — isInternalAnnouncementUrl:
    - "/events/2026-run-for-ukraine/" → true
    - "https://facebook.com/events/123" → false
    - "" → false

    Unit — isEventUpcoming (pass explicit now Date):
    - event date equals today → true (D-22)
    - event date after today → true (D-25)
    - event date before today → false (D-26)

    BDD — links:
    - Internal URL → href correct, no target, no rel (D-15)
    - External URL → target="_blank", rel="noopener noreferrer"

    BDD — Upcoming badge (D-23 copy exact "Upcoming"):
    - Future-dated event → badge "Upcoming" visible beside type badge
    - Past-dated event → no "Upcoming" text; type badge still visible (D-24, D-26)
    - Run for Ukraine fixture (date 2026-08-23) with system time before/on event date → shows Upcoming + participation fields (D-04–D-10)
  </behavior>
  <implementation>
    RED: Add unit describe blocks + BDD scenarios + step bindings. Tests fail (helpers missing; EventCard unchanged).
    GREEN: Export both helpers. EventCard conditional link attrs + Upcoming badge in meta badges row. CSS for .badges flex layout beside .badge type.
    REFACTOR: Run for Ukraine participation scenario; extend external announcement scenario with new-tab assertion. npm test green.
  </implementation>
</feature>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1 (RED): Failing unit + BDD tests for links and Upcoming badge</name>
  <files>src/__tests__/events.test.ts, src/__tests__/features/events-page.feature, src/__tests__/events-page.spec.tsx</files>
  <read_first>
    - src/__tests__/events.test.ts (groupOrganizersByRole describe pattern, lines 216+)
    - src/__tests__/events-page.spec.tsx (makeEvent factory, announcement scenario lines 195-232)
    - src/__tests__/features/events-page.feature (existing announcement scenario lines 37-42)
    - .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md (D-15–D-17, D-22–D-26)
    - .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-PATTERNS.md (BDD step patterns)
  </read_first>
  <behavior>
    - isInternalAnnouncementUrl root-relative → true; external/empty → false
    - isEventUpcoming with now=2026-08-23 and date 2026-08-23 → true (today)
    - isEventUpcoming with now=2026-08-01 and date 2026-08-23 → true (future)
    - isEventUpcoming with now=2026-08-24 and date 2026-08-23 → false (past)
    - Internal announcement link renders without target or rel
    - External announcement link renders with target="_blank" and rel="noopener noreferrer"
    - Future event card shows "Upcoming" badge text
    - Past event card does not show "Upcoming" text
  </behavior>
  <action>
    RED gate — tests only, no production implementation yet.

    In src/__tests__/events.test.ts: add isInternalAnnouncementUrl and isEventUpcoming to import from @/lib/events.

    Add describe("isInternalAnnouncementUrl") with three it() cases (root-relative, external https, empty string).

    Add describe("isEventUpcoming") with three it() cases passing explicit now Date as second argument:
    1. today: isEventUpcoming("2026-08-23", new Date(2026, 7, 23)) → true
    2. future: isEventUpcoming("2026-08-23", new Date(2026, 7, 1)) → true
    3. past: isEventUpcoming("2026-08-23", new Date(2026, 7, 24)) → false
    Use month index 7 for August (JS Date months are 0-based).

    In src/__tests__/features/events-page.feature add scenarios:
    1. "Open internal announcement link in same tab" — URL "/events/2026-run-for-ukraine/", title "View event & register"
    2. "Open external announcement link in new tab" — Facebook URL
    3. "Show Upcoming badge for future-dated event" — event date "2026-12-31", type "Charity run", assert Upcoming badge displayed beside type badge
    4. "Hide Upcoming badge for past-dated event" — event date "2020-01-01", assert no Upcoming text, type badge still shown

    In src/__tests__/events-page.spec.tsx add Scenario bindings:
    - Then("the link opens in the same tab") — closest("a") has no target and no rel
    - Then("the announcement link opens in a new tab") — target="_blank", rel="noopener noreferrer"
    - Then('an Upcoming badge is displayed') — screen.getByText("Upcoming") in document; type badge also present (D-24)
    - Then('no Upcoming badge is displayed') — screen.queryByText("Upcoming") is null
    - Given steps for future/past event dates using makeEvent overrides
    - In Upcoming scenarios, call vi.setSystemTime(new Date("2026-08-08T12:00:00")) in Given or BeforeScenario so 2026-12-31 is future and 2020-01-01 is past; restore timers in AfterEachScenario

    Run tests — they MUST fail (import errors and/or missing badge/link behavior). RED gate: fail for the right reason before any production code.
  </action>
  <acceptance_criteria>
    - Unit tests exist for both helpers and fail for correct reason (not skipped)
    - Four new BDD scenarios exist in feature file with matching spec.tsx bindings
    - `npx vitest run src/__tests__/events.test.ts src/__tests__/events-page.spec.tsx -x` exits non-zero (RED)
  </acceptance_criteria>
  <verify>
    <automated>npx vitest run src/__tests__/events.test.ts src/__tests__/events-page.spec.tsx -x; test $? -ne 0</automated>
  </verify>
  <done>RED gate: failing tests written; no production code changed</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2 (GREEN): Implement helpers, EventCard links, Upcoming badge, and CSS (D-15–D-17, D-22–D-26)</name>
  <files>src/lib/events.ts, src/components/ui/EventCard.tsx, src/components/ui/EventCard.module.css</files>
  <read_first>
    - src/lib/events.ts (insert after groupOrganizersByRole, before fetchEvents)
    - src/components/ui/EventCard.tsx (meta row lines 35-38, announcement link lines 69-80)
    - src/components/ui/EventCard.module.css (.meta and .badge styles)
    - .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md (D-22–D-26 badge placement)
  </read_first>
  <action>
    GREEN gate — minimal implementation per locked decisions.

    In src/lib/events.ts:
    1. Export isInternalAnnouncementUrl(url: string): boolean returning url.startsWith("/") (D-13, D-17)
    2. Export isEventUpcoming(isoDate: string, now?: Date): boolean using isoDate + "T00:00:00" local midnight comparison per D-22; optional now defaults to new Date()

    In src/components/ui/EventCard.tsx:
    1. Extend import: groupOrganizersByRole, isInternalAnnouncementUrl, isEventUpcoming from @/lib/events
    2. Replace meta row right side with a badges container (styles.badges): always render type badge; conditionally render Upcoming badge when isEventUpcoming(event.date) — exact copy "Upcoming" per D-23; applies to all events per D-25; never render Past label per D-26
    3. Replace announcement link with conditional spread: internal → href only; external → target="_blank" rel="noopener noreferrer" (D-15, D-16)
    4. Remove duplicate inner event.announcement_url guard inside links div
    5. Do NOT special-case date 2026-08-23, add Facebook URLs, or use Next.js Link (D-16, D-17)

    In src/components/ui/EventCard.module.css:
    1. Add .badges flex container (align-items center, gap, flex-wrap) for meta row right side per D-24
    2. Add .badgeUpcoming (or .badge.upcoming) distinct enough from type badge for readability — reuse amber token scale per discretion; both badges visible side by side
    3. Keep .meta space-between layout: date left, .badges right

    Run unit + BDD tests from Task 1 — must pass. GREEN gate: all RED tests pass.
  </action>
  <acceptance_criteria>
    - Both helpers exported from src/lib/events.ts
    - EventCard meta row shows type + Upcoming badges together when upcoming (D-24)
    - Past events omit Upcoming badge only — no Past badge anywhere (D-26)
    - Announcement link uses helper for attrs only; organizer links unchanged
    - `npx vitest run src/__tests__/events.test.ts src/__tests__/events-page.spec.tsx -x` passes
  </acceptance_criteria>
  <verify>
    <automated>npx vitest run src/__tests__/events.test.ts src/__tests__/events-page.spec.tsx -x</automated>
  </verify>
  <done>GREEN gate: helpers + EventCard + CSS pass all RED tests</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3 (REFACTOR): Run for Ukraine fixture + external scenario hardening (D-01–D-10, D-14, D-22)</name>
  <files>src/__tests__/features/events-page.feature, src/__tests__/events-page.spec.tsx</files>
  <read_first>
    - .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md (D-04 through D-10, D-14, D-22)
    - src/__tests__/events-page.spec.tsx ("Display event card with all fields" scenario pattern)
    - src/__tests__/features/events-page.feature
  </read_first>
  <action>
    REFACTOR gate — strengthen acceptance coverage without behavior change.

    1. Extend existing scenario "Show announcement link when URL is present" with step: And the announcement link opens in a new tab

    2. Add scenario "Display Run for Ukraine 2026 participation card" with makeEvent fixture per D-04–D-10:
       - date: "2026-08-23", name: "Run for Ukraine 2026", type: "Charity run"
       - place: "Place du Luxembourg, Brussels"
       - announcement_url: "/events/2026-run-for-ukraine/", announcement_title: "View event & register"
       - thumbnail: "/events/2026-08-23.jpg"
       - tags: ["Ukraine", "Independence", "Belgium", "Run"]
       - organizers: Embassy (https://belgium.mfa.gov.ua/en), Ukrainian Voices (https://uv-rc.org/), European Resolve (https://european-resolve.org) — role "Co-organiser"

    3. In spec.tsx Given for Run for Ukraine scenario: vi.setSystemTime(new Date("2026-08-08T12:00:00")) so 2026-08-23 is upcoming

    4. Assert: formatted date "23 August 2026", name, type badge "Charity run", Upcoming badge (D-22, D-23), place, tags, CTA same-tab to hub, no text or href containing "facebook" (D-16)

    Run npm test. REFACTOR gate: full suite green.
  </action>
  <acceptance_criteria>
    - Run for Ukraine BDD scenario passes with participation fields and Upcoming badge (D-01, D-05–D-10, D-22)
    - External announcement scenario asserts new-tab behavior
    - npm test passes
  </acceptance_criteria>
  <verify>
    <automated>npm test</automated>
  </verify>
  <done>REFACTOR gate complete; TDD cycle closed for link + Upcoming behavior</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| spreadsheet→EventCard | announcement_url from trusted team spreadsheet rendered in href |
| browser→external sites | External announcement links open new tab |
| client clock→Upcoming badge | Derived from viewer local date at render time (D-22) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-02 | Spoofing | announcement_url open redirect | accept | Spreadsheet is team-controlled; D-13 uses relative internal paths |
| T-07-03 | Information disclosure | target="_blank" tabnabbing | mitigate | Keep rel="noopener noreferrer" on external links only (Task 2 GREEN) |
| T-07-04 | Tampering | javascript: URLs in href | accept | No spreadsheet workflow for javascript: scheme; React escapes text nodes |
| T-07-07 | Spoofing | client clock skew affects Upcoming | accept | Date-only local comparison is intentional per D-22; no security impact |
| T-07-SC | Tampering | npm/pip/cargo installs | accept | No new packages |

</threat_model>

<verification>
- RED gate: tests fail before implementation; GREEN gate: same tests pass after EventCard change
- Unit: isInternalAnnouncementUrl + isEventUpcoming cases pass (today/future/past)
- BDD: internal same-tab, external new-tab, Upcoming show/hide, Run for Ukraine fixture pass
- npm test green
</verification>

<success_criteria>
- D-13, D-14, D-15, D-16, D-17, D-22, D-23, D-24, D-25, D-26 implemented generically in EventCard
- EVNT-04 inverse navigation (list → hub) verified via BDD fixture
- No special-case Run for Ukraine code paths
</success_criteria>

<output>
Create `.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-02-SUMMARY.md` when done. Include ## TDD Gate Compliance section documenting RED/GREEN/REFACTOR test states.
</output>
