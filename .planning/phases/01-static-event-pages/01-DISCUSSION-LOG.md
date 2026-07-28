# Phase 1: Static Event Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-28
**Phase:** 1-Static Event Pages
**Areas discussed:** Navigation & Site Integration, Progress Section, Form Behavior, UA Brand Colors

---

## Navigation & Site Integration

### How should the site nav and event nav coexist?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep site Nav + add event sub-nav | Site nav stays; event-specific links (Register, Fundraise, Progress) in a slimmer bar underneath | |
| Replace site Nav entirely | Full takeover like prototype; visitor is "inside" event experience | |
| Merge into one bar | Site nav adds event links contextually on event routes | |
| Breadcrumbs-only (user proposed) | Keep site Nav, no sub-nav. All event navigation via breadcrumbs and the landing page as hub | ✓ |

**User's choice:** Keep site Nav, use breadcrumbs as primary in-event navigation. Landing page is the hub.
**Notes:** User proposed this approach — felt the event didn't need its own persistent nav bar since breadcrumbs + the landing page CTAs provide sufficient navigation.

### Where should co-organisers appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Landing page only | Below hero, part of event info section | ✓ |
| All event sub-pages | Slim bar above content on every event page | |

**User's choice:** Landing page only.

### How do users navigate between Track A and Track B?

| Option | Description | Selected |
|--------|-------------|----------|
| Breadcrumbs only | User goes back to landing page to switch tracks | ✓ |
| Cross-link at bottom | e.g., "Looking to raise funds instead?" at bottom of register page | |

**User's choice:** Breadcrumbs only — the same participant wouldn't typically want to navigate between the two tracks.

---

## Progress Section (Phase 1 Placeholder)

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder/skeleton state | 4 cards with labels, values show "—" or "0", progress bar at 0% | ✓ |
| Hide section entirely | Don't render until real data exists in Phase 3 | |
| Show goal only | Display "€3,000 goal" and empty bar, skip Raised/Participants/Donors | |

**User's choice:** Placeholder/skeleton state.
**Notes:** Communicates "this will be live" without fake data.

---

## Form Behavior (No Backend)

### Initial question: What happens when user submits?

| Option | Description | Selected |
|--------|-------------|----------|
| Validate + "opens soon" message | Form validates, then shows notice registration isn't live | |
| Disabled button + "Coming soon" | Form viewable but clearly non-functional | |
| Full mock flow | Submit to nothing, show fake confirmation page | |

**User's challenge:** "Should we even allow the user to spend resources to fill the form up if there is no way to submit it yet?"

### Revised question: What should the Register page show in Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Tiers only + "opens soon" CTA | Tier cards visible, form replaced with notice | |
| Entire page is a teaser | Brief description + "Notify me" email field only | |
| Everything visible but marked as preview | Banner: "Registration opens [date]", form visually muted/non-interactive | ✓ |

**User's choice:** Show everything as preview with clear banner.
**Notes:** User initially questioned whether showing the form at all was right, but chose to show it in preview mode for stakeholder review purposes.

---

## UA Brand Colors

| Option | Description | Selected |
|--------|-------------|----------|
| Two flat tokens | Just --color-ua-blue and --color-ua-yellow (hex). Simple, sufficient. | ✓ |
| Full scale | -100 through -10 for both blue and yellow. More flexibility. | |
| oklch native | Use oklch directly, skip hex conversion | |

**User's choice:** Two flat tokens only.
**Notes:** Prototype only uses UA colors in a handful of places (stripe, fee bars, progress bars) — no need for a full scale.

---

## Claude's Discretion

- Exact hex values for UA blue/yellow (oklch → hex conversion)
- Breadcrumb component implementation (new component or inline)
- Tier card "MOST CHOSEN" badge treatment
- Skeleton state visual treatment (grey pulsing, static dashes, or opacity)
- Banner wording for "Registration opens [date]" notice

## Deferred Ideas

- **Tier price → Monobank jar → tracking/donor wall attribution** — Cross-phase architecture concern spanning Phase 2 and 3. User raised: "how we'd carry the tier price over from the website into the mono jar and back into the donations tracking / donor wall." Positioned as Phase 2/3 discussion item since the data flow involves backend (Phase 2) and tracking (Phase 3).
- **Language switcher (EN/FR/UK)** — Visible in prototype nav, deferred to Phase 4 (i18n).
- **"Notify me" email capture** — Considered as alternative to disabled form, user chose preview mode instead.
