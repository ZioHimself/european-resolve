---
phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
plan: 03
type: execute
wave: 2
depends_on:
  - "02"
files_modified: []
autonomous: false
requirements:
  - EVNT-04
must_haves:
  truths:
    - "Events DB spreadsheet contains Run for Ukraine 2026 row dated 2026-08-23 (D-04, D-21)"
    - "Spreadsheet type Charity run, place Place du Luxembourg Brussels, three Co-organiser entries with websites, tags Ukraine Independence Belgium Run (D-06, D-07, D-08, D-09, D-10)"
    - "Spreadsheet fields match locked values: name, announcement_url, announcement_title (D-05, D-13, D-14)"
    - "Non-displayed fields and image_credit left empty per D-11, D-12"
    - "announcement_url is /events/2026-run-for-ukraine/ — not Facebook (D-13, D-16)"
    - "thumbnail_url from Drive upload produces public/events/2026-08-23.jpg at build when URL valid (D-18, D-19, D-20)"
    - "/events static HTML includes Run for Ukraine card with Upcoming badge linking to event hub (D-01, D-22, D-23; roadmap success #2–3)"
    - "npm run build succeeds with spreadsheet row present (roadmap success #5)"
  artifacts:
    - path: public/events/2026-08-23.jpg
      provides: build-time thumbnail for Run for Ukraine card
      min_lines: 1
    - path: out/events/index.html
      provides: static events listing with new card and Upcoming badge
      contains: "Run for Ukraine 2026"
  key_links:
    - from: Events DB spreadsheet row
      to: out/events/index.html
      via: fetchRawEvents → parseEvents → EventTimeline at build
      pattern: "2026-run-for-ukraine"
    - from: spreadsheet thumbnail_url
      to: public/events/2026-08-23.jpg
      via: processEventThumbnails at build
      pattern: "2026-08-23"
---

<objective>
Complete manual operational steps: add Events DB spreadsheet row, verify Drive thumbnail fetch, and gate Phase 7 with production build verification including Upcoming badge in static HTML.

Purpose: D-21 locks spreadsheet entry as manual ops; code from Plan 02 is useless without live data row (D-04–D-20). Build gate confirms D-22 auto-derivation renders "Upcoming" for future-dated Run for Ukraine row.
Output: Verified spreadsheet row, optional thumbnail file, passing build with card visible in static export.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-RESEARCH.md
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-VALIDATION.md
@src/data/event.ts
@src/lib/events-server.ts
@src/app/events/2026-run-for-ukraine/page.tsx

<interfaces>
Spreadsheet row checklist (D-04–D-14, D-18–D-20):

| Field | Value |
|-------|-------|
| date | 2026-08-23 |
| name | Run for Ukraine 2026 |
| type | Charity run |
| place | Place du Luxembourg, Brussels |
| announcement_url | /events/2026-run-for-ukraine/ |
| announcement_title | View event & register |
| thumbnail_url | Google Drive direct-download URL (team upload) |
| tags | Ukraine, Independence, Belgium, Run |
| organizers | Embassy of Ukraine in the Kingdom of Belgium, Ukrainian Voices, European Resolve — role Co-organiser |
| organizer websites | https://belgium.mfa.gov.ua/en, https://uv-rc.org/, https://european-resolve.org |
| description, notes, contacts, image_credit | empty (D-11, D-12) |

No spreadsheet status column — Upcoming badge is auto-derived at render from date per D-22. Do NOT set announcement_url to Facebook (D-16).

Build pipeline: src/app/events/page.tsx calls fetchRawEvents() + processEventThumbnails() at build time.
</interfaces>
</context>

<tasks>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 1: Add Run for Ukraine row to Events DB spreadsheet (D-04–D-14, D-21)</name>
  <files>Events DB spreadsheet (external Google Sheets)</files>
  <read_first>
    - .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md (D-04 through D-14, D-21)
    - src/data/event.ts (eventDetails date, location, coOrganisers reference)
    - src/locales/en.ts (hero.title — listing uses shorter name per D-05)
  </read_first>
  <action>
    Human adds a new row to the Events DB spreadsheet with field values from the interfaces table above. Verify:
    - announcement_url is exactly `/events/2026-run-for-ukraine/` (internal hub, D-13)
    - No Facebook URL in any card-visible field (D-16)
    - Non-displayed fields left empty per D-11
    - No status/upcoming column — badge is code-derived per D-22
    - Ukrainian Voices website https://uv-rc.org/ — confirm with team if uncertain ([ASSUMED] per RESEARCH A1)

    After saving, verify API returns the row via curl against NEXT_PUBLIC_EVENTS_API_URL (default in src/lib/events.ts).
  </action>
  <acceptance_criteria>
    - Spreadsheet row saved with date 2026-08-23
    - Events API JSON includes "Run for Ukraine 2026" entry
    - announcement_url in API response is /events/2026-run-for-ukraine/
  </acceptance_criteria>
  <verify>
    <automated>curl -sf "${NEXT_PUBLIC_EVENTS_API_URL:-https://script.google.com/macros/s/AKfycbzwkdsn95MkUUw6WVeri05Rzfj4U3sEOpjbHegBTqNXkcg7sYKhYdyqQLlZATmYQ3GgdA/exec}" | grep -c "Run for Ukraine 2026"</automated>
    <human-check>Confirm spreadsheet row fields match D-04–D-14 checklist before relying on API grep alone</human-check>
  </verify>
  <how-to-verify>
    1. Open Events DB spreadsheet and confirm row matches checklist
    2. Fetch NEXT_PUBLIC_EVENTS_API_URL and confirm Run for Ukraine entry present
    3. Confirm announcement_url is internal path, not facebook.com
  </how-to-verify>
  <resume-signal>Type "row added" when spreadsheet row is saved and API returns the event</resume-signal>
  <done>D-21 manual spreadsheet row live in Events DB</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 2: Upload promo banner and set thumbnail_url (D-18–D-20)</name>
  <files>Events DB spreadsheet thumbnail_url field, Google Drive</files>
  <read_first>
    - .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-RESEARCH.md (Pitfall 3: Drive fetch at build)
    - src/lib/events-server.ts (processEventThumbnails, THUMBNAIL_TIMEOUT_MS 15000)
  </read_first>
  <action>
    Human uploads charity run promo banner to Google Drive. Set spreadsheet thumbnail_url to a direct-download URL (not view-only HTML page). Verify fetchability before build:

    curl -I against thumbnail_url — expect HTTP 200 and image content-type.

    Drive sharing must allow anonymous fetch at build time (D-20). If Drive fails, build still succeeds without thumbnail (graceful degradation) but success criterion #4 requires working URL.
  </action>
  <acceptance_criteria>
    - thumbnail_url field populated in spreadsheet row
    - curl -I returns 200 for thumbnail URL
  </acceptance_criteria>
  <verify>
    <automated>curl -sfI "$THUMBNAIL_URL" | head -1 | grep -q "200"</automated>
    <human-check>Set THUMBNAIL_URL env var to spreadsheet thumbnail_url before running curl gate</human-check>
  </verify>
  <how-to-verify>
    1. Upload banner image to Drive with link sharing enabled
    2. Paste direct-download URL into thumbnail_url column
    3. Run curl -I against URL; confirm 200 response
  </how-to-verify>
  <resume-signal>Type "thumbnail ready" when URL verified fetchable</resume-signal>
  <done>D-18/D-19 thumbnail URL set and fetchable</done>
</task>

<task type="auto">
  <name>Task 3: Build verification — static /events includes Run for Ukraine card with Upcoming badge</name>
  <files>out/events/index.html, public/events/2026-08-23.jpg</files>
  <read_first>
    - src/app/events/page.tsx (build-time fetch orchestration)
    - .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-VALIDATION.md (manual verifications table)
    - .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md (D-22, D-23, D-16)
  </read_first>
  <action>
    Run npm run build. After build completes:

    1. Confirm out/events/index.html contains "Run for Ukraine 2026"
    2. Confirm out/events/index.html contains href "/events/2026-run-for-ukraine/"
    3. Confirm out/events/index.html contains "Upcoming" badge text for future-dated card (D-22, D-23)
    4. Confirm public/events/2026-08-23.jpg exists if thumbnail_url was valid (optional if Drive unavailable — note in SUMMARY)
    5. Confirm no facebook.com/events/1826555465375638 in events listing HTML (D-16)
    6. Run npm test as final automated gate

    Use grep on out/events/index.html for assertions.
  </action>
  <acceptance_criteria>
    - npm run build exits 0
    - out/events/index.html contains event name, hub link, and Upcoming badge text
    - Facebook event URL absent from listing HTML
    - npm test passes
  </acceptance_criteria>
  <verify>
    <automated>npm run build && grep -q "Run for Ukraine 2026" out/events/index.html && grep -q "/events/2026-run-for-ukraine/" out/events/index.html && grep -q "Upcoming" out/events/index.html && ! grep -q "facebook.com/events/1826555465375638" out/events/index.html && npm test</automated>
  </verify>
  <done>Phase 7 roadmap success criteria 1–5 verified; EVNT-04 bidirectional nav live; D-22 Upcoming visible in production HTML</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| team→spreadsheet | Manual row entry — trusted operator |
| build→Drive URL | Fetch external image at build time |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-05 | Tampering | malicious thumbnail_url | accept | Spreadsheet access restricted to team; processEventThumbnails skips on failure |
| T-07-06 | Denial of service | Drive timeout at build | accept | 15s timeout + graceful skip; build succeeds without image |
| T-07-SC | Tampering | npm/pip/cargo installs | accept | No new packages |

</threat_model>

<verification>
- Spreadsheet row present (human checkpoint)
- Thumbnail URL fetchable (human checkpoint)
- npm run build succeeds
- Static HTML contains Run for Ukraine card with internal hub link and Upcoming badge
- npm test passes
</verification>

<success_criteria>
- All roadmap Phase 7 success criteria met
- D-04 through D-26 operational and code decisions reflected in live data and static export
- EVNT-04 complete: breadcrumbs (Phase 1) + events card (Phase 7) bidirectional
</success_criteria>

<output>
Create `.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-03-SUMMARY.md` when done. Record spreadsheet confirmation, thumbnail status, and build grep results.
</output>
