# Phase 8: Post-event registration closure — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-23
**Phase:** 08-post-event-registration-closure-activate-completed-mode-back
**Areas discussed:** Closure timing, Backend guard scope, Final stats snapshot, Gallery & results content

---

## Closure Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Manual deploy after the event | Ops sets env var in Cloudflare Pages and triggers rebuild. Matches Phase 4 D-07. | ✓ |
| Scheduled auto-flip at a fixed time | Flip at fixed datetime; needs new code beyond env-var pattern. | |
| Auto from calendar date | Derive completed mode from date; changes Phase 4 approach. | |

**User's choice:** Manual deploy after the event

### Follow-up: When to pull the trigger?

| Option | Description | Selected |
|--------|-------------|----------|
| Same evening after the run | Close as soon as physical run ends. | |
| Next business day | Stragglers until Monday. | |
| You decide — when stats are final | Ops judgment when numbers are ready. | ✓ |

**User's choice:** You decide — when stats are final

**Notes:** User clarified: "We will decide in the team and then trigger re-deployment."

### Same deploy clears Upcoming badge?

| Option | Description | Selected |
|--------|-------------|----------|
| Same deploy clears Upcoming badge | One deploy flips hub + rebuilds /events. | ✓ |
| Badge can lag | Hub closure priority; badge later. | |

**User's choice:** Same deploy clears Upcoming badge

### Closure runbook deliverable?

| Option | Description | Selected |
|--------|-------------|----------|
| Written runbook in repo | Numbered checklist as RUNBOOK.md. | |
| CONTEXT.md decisions only | No separate runbook file. | ✓ |

**User's choice:** CONTEXT.md decisions only

---

## Backend Guard Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Block all new registrations | POST /api/register and fundraiser creation return 403. | ✓ |
| Block Track A only | Keep fundraise open. | |

**User's choice:** Block all new registrations

### confirm-payment for pending registrations?

| Option | Description | Selected |
|--------|-------------|----------|
| Allow confirm-payment for existing pending | Deep links / tokens still work. | ✓ |
| Block all confirm-payment | Hard stop; ops handles manually. | |

**User's choice:** Allow confirm-payment for existing pending registrations

### Donor wall submissions?

| Option | Description | Selected |
|--------|-------------|----------|
| Block new donor wall entries | Backend rejects; frontend already hides form. | ✓ |
| Keep donor wall open | Social proof keeps growing. | |

**User's choice:** Block new donor wall entries

### Fundraiser edits after closure?

| Option | Description | Selected |
|--------|-------------|----------|
| Block fundraiser edits & publish | Pages frozen as archives. | ✓ |
| Allow edits to existing pages | Participants can update message/photo. | |

**User's choice:** Block fundraiser edits & publish

### Backend closure signal?

| Option | Description | Selected |
|--------|-------------|----------|
| EVENT_STATUS env var on backend | Mirrors frontend; set in Cloud Run deploy. | ✓ |
| Hardcoded event end date | No second env var. | |

**User's choice:** EVENT_STATUS env var on backend

### User clarification (mid-discussion)

**Question:** Would shutting down backend and registration page navigation be covered?

**Answer captured:** No full backend shutdown — selective write guards only. Registration routes stay reachable with closed banners (Phase 4 UI), not removed or redirected. API stays up for reads and pending confirm-payment.

### Closed routes: redirect vs banner?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep closed-banner pages | Phase 4 UI; URLs bookmarkable. | ✓ |
| Redirect to landing page | 301/302 from /register and /fundraise. | |

**User's choice:** Keep closed-banner pages

---

## Final Stats Snapshot

**User's choice (freeform):** Snapshot happens once WhyDonate donations are fully reconciled and traced to registrations.

### Mechanism after reconciliation?

| Option | Description | Selected |
|--------|-------------|----------|
| Script from reconciled Sheets data | Script outputs/updates finalStats; ops reviews. | ✓ |
| Manual copy from Sheets | Ops types numbers into event.ts. | |
| Skip snapshot — keep live polling | No frozen stats. | |

**User's choice:** Script from reconciled Sheets data

### chargingStations value?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-calculate from raised total | Formula in code. | |
| Manual entry from Hurkit confirmation | Real deployed station count. | ✓ |
| Omit chargingStations | Not on results page. | |

**User's choice:** Manual entry from Hurkit confirmation

### Deploy order?

| Option | Description | Selected |
|--------|-------------|----------|
| Snapshot first, then flip status in same deploy | Numbers + closed state together. | ✓ |
| Close first, update stats later | Two deploys. | |

**User's choice:** Snapshot first, then flip status in same deploy

### Script location?

| Option | Description | Selected |
|--------|-------------|----------|
| backend/ npm script | Reads Sheets directly. | ✓ |
| Root script curling /api/progress | Curl after reconciliation verified. | |

**User's choice:** backend/ npm script

---

## Gallery & Results Content

### Gallery part of closure?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — gallery activation in closure | Set folder IDs; verify EventGallery. | |
| Follow-up deploy | Closure doesn't wait for photos. | |
| Skip gallery entirely for now | | ✓ |

**User's choice:** Skip gallery entirely for now

### Impact / thank-you copy at closure?

| Option | Description | Selected |
|--------|-------------|----------|
| Update copy in same closure commit | thankYouMessage, impactStatement with stats. | ✓ |
| Keep Phase 4 placeholder copy | Refine later. | |

**User's choice:** Update copy in same closure commit

---

## Claude's Discretion

- Exact closure datetime (team triggers when reconciliation complete)
- Error code naming and HTTP status for blocked endpoints
- Snapshot script output format
- Deploy workflow changes for env vars
- Whether GET /api/progress freezes post-closure

## Deferred Ideas

- Event photo gallery activation (follow-up deploy)
- Automatic date-based completed mode
- Redirect closed routes to landing
- Separate RUNBOOK.md file
- Phase 9 thank-you email
- Phase 10 Hurkit beneficiary announcement
