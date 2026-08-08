# Phase 7: Run for Ukraine Events Listing - Context

**Gathered:** 2026-08-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Add the August 23 Run for Ukraine 2026 event to the public `/events` timeline as a regular Events DB spreadsheet entry. The listing uses the existing `fetchRawEvents` → `parseEvents` → `EventCard` flow with no special-case UI. Display fields align with `src/data/event.ts` / locale content where applicable. The card acts as a **conversion entry point** for site visitors (register, donate, fundraise), not as a Facebook announcement archive.

</domain>

<decisions>
## Implementation Decisions

### Event UX Goals (derived via discussion)
- **D-01:** The `/events` card for this event serves **participation**, not archive. Job-to-be-done: discover → understand → **act** (register / donate / create fundraising page).
- **D-02:** `/events` audience is people **already on european-resolve.org** who should convert on-site. Facebook is **outbound marketing** for people who never visit the site — not part of `/events` card UX.
- **D-03:** Unlike past civic actions (manifestations, protests), this is a **future participatory event** with a full registration hub. Card behavior should reflect "invitation to join," not "reference link to external recap."

### Spreadsheet Field Values
- **D-04:** `date`: `2026-08-23`
- **D-05:** `name`: `Run for Ukraine 2026` (short brand name; not the full hero title from locales)
- **D-06:** `type`: `Charity run`
- **D-07:** `place`: `Place du Luxembourg, Brussels`
- **D-08:** `organizers`: Embassy of Ukraine in the Kingdom of Belgium, Ukrainian Voices, European Resolve — all with role `Co-organiser`
- **D-09:** Organizer websites: include URLs for all three where known (European Resolve, Embassy, Ukrainian Voices)
- **D-10:** `tags`: `Ukraine`, `Independence`, `Belgium`, `Run`
- **D-11:** Non-displayed fields (`description`, `notes`, `contacts`, attendance, media counts): **leave empty for now** — only fill fields the card uses plus announcement/thumbnail
- **D-12:** `image_credit`: **not set** (empty)

### Card Navigation & Announcement Link
- **D-13:** `announcement_url`: `/events/2026-run-for-ukraine/` (internal event hub — satisfies roadmap success criterion #3)
- **D-14:** `announcement_title`: `View event & register` — action-oriented CTA for entering the hub (not the Facebook-style long title)
- **D-15:** Clicking the announcement link should feel like **entering the event** — navigate in the **same tab**, not `target="_blank"` (differs from current EventCard behavior for external links)
- **D-16:** **No Facebook link on the card.** Facebook event URL (`https://www.facebook.com/events/1826555465375638`) is for social/outbound distribution only; not surfaced in `/events` UX
- **D-17:** No special-case card UI for this event — use standard `EventCard`; any same-tab / internal-link behavior applies generically to internal `announcement_url` values (relative paths or same-origin URLs)

### Thumbnail
- **D-18:** Use the charity run **promo banner** as the event thumbnail (CHARITY RUN for UKRAINE, Pl. du Luxembourg, 23.08 | 10:00, co-organiser logos)
- **D-19:** Provide banner via **`thumbnail_url` in the spreadsheet** pointing to a Google Drive (or equivalent) downloadable URL — standard `processEventThumbnails` pipeline → `public/events/2026-08-23.jpg`
- **D-20:** Team uploads banner to Drive; spreadsheet row holds the URL. Do not hardcode banner in repo unless Drive upload fails.

### Data Sync (not discussed — planner discretion)
- **D-21:** Spreadsheet row is added **manually** to Events DB. Use `src/data/event.ts` and `src/locales/en.ts` (`hero.title`, location, co-organisers) as reference when filling fields — no automated export/validation script required for this phase unless planner finds it trivial.

### Claude's Discretion
- Exact organizer website URLs (Embassy, Ukrainian Voices) — use official URLs
- Whether internal-link same-tab behavior keys off relative path (`/events/...`) vs same-origin absolute URL
- `announcement_title` exact wording if "View event & register" needs i18n consideration (events page is EN-only today)
- Google Drive sharing settings for thumbnail URL (must be fetchable at build time)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase & Requirements
- `.planning/ROADMAP.md` — Phase 7 goal, success criteria (spreadsheet row, timeline render, click → landing page, thumbnail at build, build succeeds)
- `.planning/REQUIREMENTS.md` — EVNT-04 (navigate back to events list via breadcrumbs; inverse: events list links to event)

### Event Content (source of truth for field values)
- `src/data/event.ts` — `eventDetails` (date, location, beneficiary, co-organisers)
- `src/locales/en.ts` — `hero.title` (full event name on hub; listing uses shorter brand name per D-05)

### Events Listing Pipeline
- `src/lib/events.ts` — `RawEvent`, `EventDisplay`, `parseEvents()`
- `src/lib/events-server.ts` — `fetchRawEvents()`, `processEventThumbnails()`
- `src/app/events/page.tsx` — build-time fetch + render
- `src/components/ui/EventTimeline.tsx` — client-side refresh
- `src/components/ui/EventCard.tsx` — card layout, announcement link (currently always `target="_blank"`)

### Event Hub (link target)
- `src/app/events/2026-run-for-ukraine/page.tsx` — landing page with breadcrumbs back to `/events`

### Tests
- `src/__tests__/events.test.ts` — `parseEvents` unit tests
- `src/__tests__/events-page.spec.tsx` — EventCard BDD scenarios
- `src/__tests__/features/events-page.feature` — Gherkin acceptance criteria

### Prior Phase Context
- `.planning/phases/01-static-event-pages/01-CONTEXT.md` — breadcrumbs as primary in-event navigation (D-02)

### Assets
- User-provided promo banner (upload to Google Drive for `thumbnail_url`) — reference image provided during discuss-phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EventCard.tsx`: Renders all spreadsheet-driven fields; announcement link at bottom of card
- `processEventThumbnails()`: Downloads `thumbnail_url`, resizes to 800px, writes `public/events/{date}.jpg`
- `event.ts` / `coOrganisers`: Reference for organizer names matching the hub

### Established Patterns
- Events fetched from Google Apps Script API at build time + client refresh
- `announcement_url` historically external (Facebook) with `target="_blank"`
- Thumbnails optional; keyed by event `date` in filename
- No CMS — spreadsheet is operational source for `/events` timeline

### Integration Points
- **Spreadsheet:** New row in Events DB (manual) with fields per D-04–D-14, D-18–D-19
- **EventCard:** May need generic internal-link handling (same-tab) for relative `announcement_url` — affects all future internal announcements, not a one-off
- **Build:** `npm run build` must fetch new row, process banner thumbnail, emit static `/events` page with Run for Ukraine card

### Gap vs Current Behavior
- EventCard always uses `target="_blank"` on announcement links — conflicts with D-15 for internal URLs
- Roadmap originally mentioned Facebook-style announcement; user decision overrides with internal hub link

</code_context>

<specifics>
## Specific Ideas

- Promo banner: "CHARITY RUN for UKRAINE", Pl. du Luxembourg, 23.08 | 10:00, co-organiser strip (Embassy, European Resolve, UV RC, be.brussels, HURKIT RUN)
- Facebook event exists for outbound marketing: `https://www.facebook.com/events/1826555465375638` — intentionally excluded from card
- Socratic framing: past events = archive/awareness; this event = participation funnel entry

</specifics>

<deferred>
## Deferred Ideas

- **Facebook link on EventCard** — secondary "Find on Facebook" link; user chose nowhere on card
- **Hidden spreadsheet fields** — description, notes, contacts for team reference; defer until needed
- **`image_credit`** on thumbnail — user declined
- **Whole-card clickable** — only announcement link is interactive today; acceptable unless planner finds low-friction improvement trivial with internal-link work
- **Build-time validation** comparing spreadsheet row vs `event.ts` — not required this phase

</deferred>

---

*Phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac*
*Context gathered: 2026-08-08*
