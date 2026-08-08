# Phase 7: Run for Ukraine Events Listing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-08
**Phase:** 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
**Areas discussed:** Spreadsheet field values, Card navigation, Thumbnail (+ Socratic UX goals session)

---

## Spreadsheet Field Values

| Option | Description | Selected |
|--------|-------------|----------|
| Full hero title | "35 Years of Ukraine Independence: Charity and Run" | |
| Short brand name | "Run for Ukraine 2026" | ✓ |
| Hybrid | "Run for Ukraine 2026: Charity and Run" | |

| Option | Description | Selected |
|--------|-------------|----------|
| Charity run | Type badge | ✓ |
| Run | Short badge | |
| Fundraiser | Donation emphasis | |

| Option | Description | Selected |
|--------|-------------|----------|
| Place du Luxembourg, Brussels | Venue + city | ✓ |
| Full location with country | Place du Luxembourg, Brussels, Belgium | |
| City only | Brussels, Belgium | |

**User's choice:** Name "Run for Ukraine 2026"; type "Charity run"; place "Place du Luxembourg, Brussels"; organizers Embassy of Ukraine in the Kingdom of Belgium, Ukrainian Voices, European Resolve (all Co-organiser); tags Ukraine, Independence, Belgium, Run; websites for all three where known.

**Notes:** Hidden fields (description, notes, contacts) deferred — unnecessary for now. No image_credit.

---

## Card Navigation (incl. Socratic UX goals)

| Option | Description | Selected |
|--------|-------------|----------|
| Facebook link | Matches existing external announcement pattern | |
| Internal hub link | `/events/2026-run-for-ukraine/` — participation funnel | ✓ |
| Both | Facebook + internal "View event page" | |

| Option | Description | Selected |
|--------|-------------|----------|
| Same tab | Entering the event | ✓ |
| New tab | Reference link (current EventCard default) | |

| Option | Description | Selected |
|--------|-------------|----------|
| Facebook on card | Secondary social link | |
| Facebook nowhere on card | Outbound marketing only | ✓ |

**User's choice:** Internal link (B); same-tab navigation; no Facebook on card. Facebook audience is people who never visit european-resolve.org; `/events` converts site visitors.

**Notes:** Socratic discussion established card job = discover → understand → act (register/donate/fundraise), unlike past archive-style events. announcement_title set to action-oriented "View event & register" (not Facebook long title). User initially provided Facebook URL/title for comparison; final decision excludes Facebook from card UX.

---

## Thumbnail

| Option | Description | Selected |
|--------|-------------|----------|
| Google Drive thumbnail_url | Standard build pipeline | ✓ |
| Commit to repo | public/events/2026-08-23.jpg directly | |

**User's choice:** Promo banner via Drive URL (2A). Banner provided during session (CHARITY RUN for UKRAINE artwork). No image_credit.

---

## Areas Not Discussed

- **Sync strategy** (manual row vs build-time validation) — left to planner discretion; manual spreadsheet row with event.ts as reference

## Claude's Discretion

- Organizer website URLs
- Internal-link detection heuristic (relative vs same-origin)
- Google Drive sharing for build-time fetch

## Deferred Ideas

- Facebook secondary link on card
- Hidden spreadsheet fields for team reference
- image_credit on thumbnail
- Whole-card clickable interaction
- Automated spreadsheet ↔ event.ts sync
