# Phase 7: Run for Ukraine Events Listing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-08 (updated 2026-08-08)
**Phase:** 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
**Areas discussed:** Spreadsheet field values, Card navigation, Thumbnail (+ Socratic UX goals session); **Upcoming event status label** (revisit)

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

## Upcoming Event Status Label (revisit 2026-08-08)

| Option | Description | Selected |
|--------|-------------|----------|
| Auto from date | Show label when event date is today or in the future | ✓ |
| Spreadsheet field | Operator sets status explicitly | |
| Both | Auto from date with spreadsheet override | |

| Option | Description | Selected |
|--------|-------------|----------|
| Upcoming | Neutral temporal status | ✓ |
| Planned | Scheduled, not yet happened | |
| Register now | Action-oriented (overlaps announcement CTA) | |

| Option | Description | Selected |
|--------|-------------|----------|
| New badge next to type | "Upcoming" beside "Charity run" in meta row | ✓ |
| Replace type badge | Show Upcoming instead of type | |
| Date styling only | Highlight date, no extra badge | |

| Option | Description | Selected |
|--------|-------------|----------|
| All future-dated events | Any event with date >= today | ✓ |
| Internal-hub events only | Only when announcement_url starts with / | |

| Option | Description | Selected |
|--------|-------------|----------|
| No past label | Only show Upcoming; past events show date only | ✓ |
| Past badge | Also show "Past" for completed events | |

**User's choice:** Auto-derive Upcoming from date (today or future); copy "Upcoming"; new badge beside type badge; all future events; no Past label. No spreadsheet status column.

**Notes:** Complements D-01–D-03 participation UX — makes future events scannable on `/events` without reading the full date. Run for Ukraine 2026-08-23 qualifies automatically.

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
- Spreadsheet status column (chose auto date derivation instead)
- "Past" event badge (chose upcoming-only labeling)
