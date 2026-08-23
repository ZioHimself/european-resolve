# Phase 8: Post-event registration closure — activate completed mode, backend guard, final stats snapshot - Context

**Gathered:** 2026-08-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Operationally close Run for Ukraine 2026 after the event: freeze reconciled final numbers into the static site, flip frontend and backend into completed mode, and block new write traffic (registrations, fundraiser creation, donor wall, fundraiser edits) while keeping the API available for reads and late payment confirmation on existing pending registrations.

Phase 4 built the completed-mode UI (`NEXT_PUBLIC_EVENT_STATUS=completed`); Phase 8 activates it and adds the missing backend guards and stats snapshot workflow. Phase 9 (thank-you email) and Phase 10 (beneficiary announcements) are separate.

</domain>

<decisions>
## Implementation Decisions

### Closure Timing & Deploy
- **D-01:** **Manual deploy** — the team decides when to trigger redeployment; no scheduled or date-derived auto-flip. Matches Phase 4 D-07 (`NEXT_PUBLIC_EVENT_STATUS=completed` requires rebuild + deploy).
- **D-02:** **Trigger when numbers are final** — closure happens after the team agrees WhyDonate donations are fully reconciled and traced to registrations. Exact datetime is an ops judgment call, not hardcoded.
- **D-03:** **Same deploy clears `/events` "Upcoming" badge** — the closure rebuild must happen after the event date so static HTML reflects past-event state (Phase 7 review: stale badge without redeploy).
- **D-04:** **No separate RUNBOOK.md** — closure steps are captured in CONTEXT.md and downstream plans only.

### Backend Guard Scope
- **D-05:** **Block all new registrations** — `POST /api/register` and fundraiser creation routes return an error (e.g. `REGISTRATION_CLOSED`) when `EVENT_STATUS=completed`.
- **D-06:** **Allow `confirm-payment` for pending registrations** — people who registered before closure but have not paid can still complete payment via existing tokens/deep links; register page UI is closed but payment confirmation stays open.
- **D-07:** **Block new donor wall entries** — `POST /api/donors` rejects writes (frontend already hides `DonorWallForm` in completed mode per Phase 4 D-11).
- **D-08:** **Block fundraiser edits and publish** — existing fundraiser pages remain viewable as archives; write endpoints for edit/publish reject.
- **D-09:** **Keep closed-banner pages** — `/register` and `/fundraise` show Phase 4 closed banners with link to results; no redirect to landing page.
- **D-10:** **Backend env var** — `EVENT_STATUS=completed` on Cloud Run mirrors frontend `NEXT_PUBLIC_EVENT_STATUS=completed`. Guard checks env var, not calendar date.
- **D-11:** **Selective guards only** — backend is not shut down. Read endpoints (progress, gallery, fundraiser GET) and allowed writes (`confirm-payment`) stay available.

### Final Stats Snapshot
- **D-12:** **Snapshot after full reconciliation** — `finalStats` in `event.ts` are populated only after WhyDonate donations are fully reconciled and traced to registrations in Sheets. Do not snapshot from pre-reconciliation `/api/progress`.
- **D-13:** **`backend/` npm script** — reads reconciled totals from Sheets and outputs/updates `eventDetails.postEvent.finalStats` (`raised`, `participants`, `donors`). Ops reviews output before commit.
- **D-14:** **`chargingStations` manual entry** — team enters the real number from Hurkit confirmation; not auto-calculated from raised total.
- **D-15:** **Stats first, status flip in same deploy** — reconcile → run snapshot script → update `event.ts` (stats + copy) → set both env vars to `completed` → single frontend + backend deploy. Do not close registrations with placeholder/zero stats.
- **D-16:** **Update impact copy in same commit** — `thankYouMessage`, `impactStatement`, and `chargingStations` updated alongside `finalStats` in the closure commit.

### Gallery & Results Content
- **D-17:** **Skip gallery for Phase 8** — `galleryFolderId` / `EventGallery` activation is not part of the closure checklist. Results page works without the gallery section for now.
- **D-18:** **Placeholder gallery stays hidden or empty** — no blocker for closure deploy.

### Claude's Discretion
- Exact closure datetime (team triggers when ready)
- Error code naming for blocked endpoints (e.g. `REGISTRATION_CLOSED`, HTTP 403 vs 409)
- Snapshot script interface (stdout JSON vs direct file patch vs PR-ready diff)
- Whether `GET /api/progress` should also return frozen values post-closure or remain live for ops
- Cloudflare Pages env var configuration steps (dashboard vs wrangler — ops doc in plan, not RUNBOOK.md)
- GitHub Actions / deploy workflow changes to pass `EVENT_STATUS` and `NEXT_PUBLIC_EVENT_STATUS`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase & Requirements
- `.planning/ROADMAP.md` — Phase 8 goal (activate completed mode, backend guard, final stats snapshot); Phase 9/10 boundaries
- `.planning/REQUIREMENTS.md` — POST-01 (thank-you email, Phase 9); post-event survey/sharing deferred to v2

### Prior Phase Context (decisions carried forward)
- `.planning/phases/04-polish-communications-post-event-readiness/04-CONTEXT.md` — post-event UI (D-07–D-14): env var trigger, closed banners, frozen progress from `finalStats`, fundraiser page archive behavior, gallery from Drive (deferred this phase)
- `.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md` — `isEventUpcoming` badge (D-22–D-26); stale badge without redeploy (07-REVIEW.md)
- `.planning/phases/06-whydonate-widget-auto-detection-remove-manual-confirmation-b/06-CONTEXT.md` — `confirm-payment` flow for pending registrations

### Frontend (completed mode — already built, to be activated)
- `src/hooks/useEventStatus.ts` — reads `NEXT_PUBLIC_EVENT_STATUS`
- `src/data/event.ts` — `postEvent.finalStats`, `thankYouMessage`, `impactStatement`, `galleryFolderId`
- `src/components/ui/ProgressSection.tsx` — uses `finalStats` when completed, polls API when active
- `src/app/events/2026-run-for-ukraine/page.tsx` — results layout vs TrackCards
- `src/app/events/2026-run-for-ukraine/register/page.tsx` — closed banner
- `src/app/events/2026-run-for-ukraine/fundraise/page.tsx` — closed banner
- `src/components/ui/FundraiserPage.tsx` — disables donations/editing in completed mode
- `src/components/ui/DonorWallForm.tsx` — hidden in completed mode
- `src/components/ui/EventCard.tsx` — Upcoming badge via `isEventUpcoming`

### Backend (guards to add)
- `backend/src/routes/register.ts` — registration endpoint (no closure guard today)
- `backend/src/routes/fundraiser.ts` — fundraiser create, register, edit, publish
- `backend/src/routes/donors.ts` — donor wall submissions
- `backend/src/config.ts` — add `eventStatus` from `EVENT_STATUS` env var
- `backend/src/routes/progress.ts` — live totals source for reconciliation verification
- `backend/.env.example` — document new `EVENT_STATUS` var

### Reconciliation Tooling (existing / in progress)
- `backend/src/sync-whydonate-tracking.ts` — WhyDonate order sync
- `backend/src/audit-whydonate-records.ts` — reconciliation audit
- `backend/src/lib/whydonateReconcile.ts` — reconciliation logic
- `backend/src/lib/whydonateSync.ts` — sync helpers
- `backend/src/services/sheets.ts` — `getProgress()` aggregates

### Deploy
- `.github/workflows/deploy-backend.yml` — Cloud Run env vars (add `EVENT_STATUS`)
- `.github/workflows/ci.yml` — frontend build (pass `NEXT_PUBLIC_EVENT_STATUS` for completed-mode build verification)
- Cloudflare Pages — `NEXT_PUBLIC_EVENT_STATUS` (production dashboard; not in repo today)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useEventStatus()` / `getEventStatus()`: Frontend completed-mode switch already wired across all event pages
- `ProgressSection`: Reads `eventDetails.postEvent.finalStats` when completed — snapshot target
- `AccountabilityReport`: Reads `impactStatement` and `finalStats.chargingStations` from `event.ts`
- Phase 4 closed-banner UI and locale keys (`closed.*`) already exist in all locale files

### Established Patterns
- Env var pattern: `NEXT_PUBLIC_*` for frontend (Phase 4 D-07); backend uses plain env vars in `config.ts`
- Static export: completed mode is build-time — must rebuild to flip status
- Error codes: backend returns machine-readable codes (Phase 4 D-06) — closure guards should follow same pattern
- Ops scripts in `backend/src/` with npm script aliases (WhyDonate sync/audit precedent)

### Integration Points
- **Cloudflare Pages**: set `NEXT_PUBLIC_EVENT_STATUS=completed` + rebuild
- **Cloud Run**: set `EVENT_STATUS=completed` in deploy workflow vars
- **`event.ts`**: commit updated `finalStats` + copy before deploy
- **Sheets**: reconciliation source of truth for snapshot script
- **`/events` timeline**: Upcoming badge auto-clears on rebuild when date is past

### Gaps (Phase 8 deliverables)
- No `EVENT_STATUS` in backend config or deploy workflow today
- No backend guards on write endpoints
- `finalStats` all zero; `galleryFolderId` empty
- No snapshot script from reconciled Sheets → `event.ts`

</code_context>

<specifics>
## Specific Ideas

- Closure is a team decision after full WhyDonate ↔ registration reconciliation — not a fixed clock time
- Same deploy should show final reconciled numbers AND closed registrations together — no "closed with €0" interim state
- Fundraiser pages are permanent participant records; donations and edits stop, viewing continues
- Gallery deferred — results page launches with stats + accountability copy only

</specifics>

<deferred>
## Deferred Ideas

- **Event photo gallery activation** — `EventGallery` + Drive folder setup; user chose skip for Phase 8. Can be a follow-up deploy.
- **Automatic date-based completed mode** — would replace env-var pattern from Phase 4; rejected.
- **Redirect `/register` and `/fundraise` to landing** — user chose keep closed-banner pages.
- **Separate RUNBOOK.md** — user chose CONTEXT.md + plans only.
- **Phase 9 thank-you email** — localized template send to all paid participants (depends on Phase 8).
- **Phase 10 Hurkit beneficiary announcement** — opt-in email + Sheets script (depends on Phase 9).

</deferred>

---

*Phase: 08-post-event-registration-closure-activate-completed-mode-back*
*Context gathered: 2026-08-23*
