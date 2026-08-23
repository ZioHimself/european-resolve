# Phase 8: Post-event registration closure — activate completed mode, backend guard, final stats snapshot - Research

**Researched:** 2026-08-23
**Domain:** Event lifecycle closure (static export + Hono API guards + Sheets reconciliation snapshot)
**Confidence:** HIGH

## Summary

Phase 8 is primarily an **activation and hardening** phase, not a greenfield UI build. Phase 4 already implemented completed-mode frontend behavior behind `NEXT_PUBLIC_EVENT_STATUS=completed` (`useEventStatus`, frozen `ProgressSection`, closed banners, archive fundraiser pages). Phase 8 delivers three concrete gaps: (1) backend write guards keyed on `EVENT_STATUS=completed`, (2) an ops snapshot script that freezes reconciled Sheets totals into `src/data/event.ts`, and (3) deploy wiring so both env vars flip together in a single coordinated release.

The closure workflow is intentionally **manual and reconciliation-gated** (D-01, D-02, D-15): run WhyDonate audit/sync until clean, snapshot stats, update impact copy + `chargingStations`, commit `event.ts`, set `EVENT_STATUS` + `NEXT_PUBLIC_EVENT_STATUS` to `completed`, then deploy frontend (Cloudflare Pages rebuild) and backend (Cloud Run via GitHub Actions) together. Do not close with placeholder/zero stats.

**Critical implementation gap discovered:** `register/page.tsx` currently shows the closed banner for all visitors when `isCompleted`, which **blocks D-06** (pending registrants completing payment via `?token=` deep links). The planner must add a token/session exception so `RegisterClient` / `ConfirmationPanel` remain reachable while new registration UI stays hidden.

**Primary recommendation:** Add a shared `isEventCompleted()` helper in backend config, guard all write routes with early-return `403` + `REGISTRATION_CLOSED` (matching existing `ApiResponse` error-code pattern), build `snapshot-final-stats` ops script reusing `SheetsService.getProgress()`, fix register-page token exception, wire `EVENT_STATUS` into `deploy-backend.yml`, and extend CI to verify `NEXT_PUBLIC_EVENT_STATUS=completed` build.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Completed-mode UI (frozen stats, closed banners) | CDN / Static (build-time) | Browser (client hooks) | `NEXT_PUBLIC_EVENT_STATUS` is inlined at build; no server runtime on Cloudflare Pages [VERIFIED: codebase `useEventStatus.ts`] |
| Backend write guards | API / Backend | — | Registration/fundraiser/donor writes must be rejected server-side even if frontend is bypassed [VERIFIED: CONTEXT D-05–D-11] |
| Late `confirm-payment` for pending rows | API / Backend | Browser (register page token flow) | Payment confirmation is a Sheets write that must remain open post-closure [VERIFIED: CONTEXT D-06, `confirm-payment.ts`] |
| Final stats snapshot | API / Backend (ops script) | CDN / Static (`event.ts` commit) | Reconciled totals live in Sheets; static site reads frozen `finalStats` at build [VERIFIED: CONTEXT D-12–D-16] |
| Reconciliation verification | API / Backend (ops scripts) | — | Pre-closure gate uses existing WhyDonate audit/sync tooling [VERIFIED: `audit-whydonate-records.ts`, `sync-whydonate-tracking.ts`] |
| Env var deploy flip | CI/CD + host dashboards | — | Backend via GitHub Actions → Cloud Run; frontend via Cloudflare Pages dashboard env [CITED: `docs/adrs/004-cloudflare-pages-github-app.md`] |
| Upcoming badge clearance | CDN / Static (rebuild) | — | `isEventUpcoming` is date-based at build time; past-event rebuild clears badge [VERIFIED: `src/lib/events.ts`] |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Closure Timing & Deploy
- **D-01:** **Manual deploy** — the team decides when to trigger redeployment; no scheduled or date-derived auto-flip. Matches Phase 4 D-07 (`NEXT_PUBLIC_EVENT_STATUS=completed` requires rebuild + deploy).
- **D-02:** **Trigger when numbers are final** — closure happens after the team agrees WhyDonate donations are fully reconciled and traced to registrations. Exact datetime is an ops judgment call, not hardcoded.
- **D-03:** **Same deploy clears `/events` "Upcoming" badge** — the closure rebuild must happen after the event date so static HTML reflects past-event state (Phase 7 review: stale badge without redeploy).
- **D-04:** **No separate RUNBOOK.md** — closure steps are captured in CONTEXT.md and downstream plans only.

#### Backend Guard Scope
- **D-05:** **Block all new registrations** — `POST /api/register` and fundraiser creation routes return an error (e.g. `REGISTRATION_CLOSED`) when `EVENT_STATUS=completed`.
- **D-06:** **Allow `confirm-payment` for pending registrations** — people who registered before closure but have not paid can still complete payment via existing tokens/deep links; register page UI is closed but payment confirmation stays open.
- **D-07:** **Block new donor wall entries** — `POST /api/donors` rejects writes (frontend already hides `DonorWallForm` in completed mode per Phase 4 D-11).
- **D-08:** **Block fundraiser edits and publish** — existing fundraiser pages remain viewable as archives; write endpoints for edit/publish reject.
- **D-09:** **Keep closed-banner pages** — `/register` and `/fundraise` show Phase 4 closed banners with link to results; no redirect to landing page.
- **D-10:** **Backend env var** — `EVENT_STATUS=completed` on Cloud Run mirrors frontend `NEXT_PUBLIC_EVENT_STATUS=completed`. Guard checks env var, not calendar date.
- **D-11:** **Selective guards only** — backend is not shut down. Read endpoints (progress, gallery, fundraiser GET) and allowed writes (`confirm-payment`) stay available.

#### Final Stats Snapshot
- **D-12:** **Snapshot after full reconciliation** — `finalStats` in `event.ts` are populated only after WhyDonate donations are fully reconciled and traced to registrations in Sheets. Do not snapshot from pre-reconciliation `/api/progress`.
- **D-13:** **`backend/` npm script** — reads reconciled totals from Sheets and outputs/updates `eventDetails.postEvent.finalStats` (`raised`, `participants`, `donors`). Ops reviews output before commit.
- **D-14:** **`chargingStations` manual entry** — team enters the real number from Hurkit confirmation; not auto-calculated from raised total.
- **D-15:** **Stats first, status flip in same deploy** — reconcile → run snapshot script → update `event.ts` (stats + copy) → set both env vars to `completed` → single frontend + backend deploy. Do not close registrations with placeholder/zero stats.
- **D-16:** **Update impact copy in same commit** — `thankYouMessage`, `impactStatement`, and `chargingStations` updated alongside `finalStats` in the closure commit.

#### Gallery & Results Content
- **D-17:** **Skip gallery for Phase 8** — `galleryFolderId` / `EventGallery` activation is not part of the closure checklist. Results page works without the gallery section for now.
- **D-18:** **Placeholder gallery stays hidden or empty** — no blocker for closure deploy.

### Claude's Discretion
- Exact closure datetime (team triggers when ready)
- Error code naming for blocked endpoints (e.g. `REGISTRATION_CLOSED`, HTTP 403 vs 409)
- Snapshot script interface (stdout JSON vs direct file patch vs PR-ready diff)
- Whether `GET /api/progress` should also return frozen values post-closure or remain live for ops
- Cloudflare Pages env var configuration steps (dashboard vs wrangler — ops doc in plan, not RUNBOOK.md)
- GitHub Actions / deploy workflow changes to pass `EVENT_STATUS` and `NEXT_PUBLIC_EVENT_STATUS`

### Deferred Ideas (OUT OF SCOPE)
- **Event photo gallery activation** — `EventGallery` + Drive folder setup; user chose skip for Phase 8. Can be a follow-up deploy.
- **Automatic date-based completed mode** — would replace env-var pattern from Phase 4; rejected.
- **Redirect `/register` and `/fundraise` to landing** — user chose keep closed-banner pages.
- **Separate RUNBOOK.md** — user chose CONTEXT.md + plans only.
- **Phase 9 thank-you email** — localized template send to all paid participants (depends on Phase 8).
- **Phase 10 Hurkit beneficiary announcement** — opt-in email + Sheets script (depends on Phase 9).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| POST-02 | Public event-results page (persists after event) | Phase 4 built results layout; Phase 8 activates via env flip + `finalStats` snapshot |
| EVNT-02 | Live progress stats | Completed mode freezes via `finalStats` in `event.ts`; `ProgressSection` stops polling [VERIFIED: `ProgressSection.tsx`] |
| DASH-01–04 | Progress dashboard metrics | Snapshot maps `raised`, `participants`, `donors` from `SheetsService.getProgress()` |
| DASH-05 | Stats refresh without reload | Disabled in completed mode (no polling); intentional freeze |
| API-02 | POST /api/register | Guard when `EVENT_STATUS=completed` |
| API-03 | POST /api/fundraiser | Guard create + `/register` combined route |
| API-07 | POST /api/donors | Guard when completed |
| REGA-06 | Payment confirmation flow | `confirm-payment` remains unguarded; register page needs token exception for D-06 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Static export only** — completed mode is build-time via `NEXT_PUBLIC_*`; no API routes or SSR on frontend.
- **No payment processing** — closure blocks new registrations/donations; WhyDonate handles payments; `confirm-payment` only updates Sheets.
- **Google Sheets** — reconciliation source of truth; snapshot reads from Sheets, not live WhyDonate API alone.
- **CSS Modules + tokens** — no new styling approach for closure work.
- **GDPR** — closure does not delete data; blocks new collection writes.
- **Ukrainian copy conventions** — impact/thank-you strings in `event.ts` are English today; localized variants deferred to Phase 5/9.
- **No em dash in user-facing copy** — applies if updating `thankYouMessage` / `impactStatement`.
- **Human commits only** — ops reviews snapshot output before commit (D-13).

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.2.6 | Static export frontend | Already deployed; completed mode is env-driven rebuild [VERIFIED: `package.json`] |
| Hono | ^4.12.0 | Backend API + route guards | Existing backend framework; supports path-scoped middleware [CITED: hono.dev middleware guide] |
| googleapis | ^174.0.0 | Sheets reads for snapshot | Already used by `SheetsService` [VERIFIED: `backend/package.json`] |
| Vitest | ^4.1.5 | Unit/integration tests | Covers `src/**` and `backend/src/**` [VERIFIED: `vitest.config.ts`] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | ^4.19.0 | Run ops scripts | Snapshot script follows existing `sync-whydonate-tracking` pattern [VERIFIED: `backend/package.json`] |
| @hono/node-server | ^2.0.12 | Cloud Run runtime | Unchanged |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Env var flip | Date-derived auto-close | Rejected in D-01/D-02; reconciliation timing is ops judgment |
| Central Hono middleware | Per-route early return | Middleware works but selective allowlist (`confirm-payment`) is clearer with a shared helper called at route top |
| Live `/api/progress` freeze | Static-only snapshot | Frontend already frozen; keeping API live aids post-closure ops comparison (recommended discretion) |

**Installation:** No new packages required for this phase.

## Package Legitimacy Audit

> No new external packages are introduced in this phase. Existing dependencies were verified in `backend/package.json` and root `package.json` during codebase inspection.

| Package | Disposition |
|---------|-------------|
| (none new) | N/A |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
[Ops: reconciliation complete]
        │
        ▼
┌───────────────────────┐     ┌─────────────────────────┐
│ audit-whydonate-      │     │ snapshot-final-stats    │
│ records / sync-wd     │────▶│ (SheetsService.         │
│ (pre-closure gate)    │     │  getProgress)           │
└───────────────────────┘     └───────────┬─────────────┘
                                          │ stdout JSON
                                          ▼
                              ┌─────────────────────────┐
                              │ Manual review + commit  │
                              │ src/data/event.ts       │
                              │ (finalStats + copy)     │
                              └───────────┬─────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              ▼                           ▼                           ▼
   NEXT_PUBLIC_EVENT_STATUS      EVENT_STATUS=completed        git push main
   =completed (Cloudflare)       (Cloud Run deploy)                   │
              │                           │                           │
              ▼                           ▼                           ▼
   Static HTML: results view      Write routes → 403            /events badge
   frozen ProgressSection         confirm-payment → OK          no longer "Upcoming"
   closed banners (except token)
```

### Recommended Project Structure

```
backend/src/
├── config.ts                    # add eventStatus: "active" | "completed"
├── lib/
│   └── eventClosure.ts          # isEventCompleted(), closedResponse()
├── routes/
│   ├── register.ts              # guard POST /
│   ├── fundraiser.ts            # guard POST /, POST /register, PUT /:slug
│   ├── donors.ts                # guard POST /
│   └── record-donation.ts       # guard POST /:slug (implicit donor wall write)
├── snapshot-final-stats.ts      # new ops script
src/
├── data/event.ts                # finalStats + post-event copy (committed at closure)
├── hooks/useEventStatus.ts      # unchanged
└── app/events/.../register/page.tsx  # token exception for D-06
```

### Pattern 1: Shared closure guard helper

**What:** Single source of truth for `EVENT_STATUS` checks and consistent error payloads.
**When to use:** Top of every blocked write handler, before validation/Sheets I/O.
**Example:**

```typescript
// backend/src/lib/eventClosure.ts
import type { Context } from "hono";
import { config } from "../config.js";
import type { ApiResponse } from "../types.js";

export function isEventCompleted(): boolean {
  return config.eventStatus === "completed";
}

export function registrationClosedResponse(c: Context) {
  return c.json(
    {
      success: false,
      errors: [
        {
          field: "_global",
          message: "Registration is closed",
          code: "REGISTRATION_CLOSED",
        },
      ],
    } satisfies ApiResponse<never>,
    403,
  );
}
```

Use at route entry:

```typescript
registerRoute.post("/", async (c) => {
  if (isEventCompleted()) return registrationClosedResponse(c);
  // ... existing handler
});
```

**Rationale:** Matches Phase 4 machine-readable error codes (`VALIDATION_*`, `VALIDATION_AUTH_REQUIRED`). HTTP **403** (not 409) — closure is authorization/state policy, not a resource conflict [ASSUMED: discretion choice; aligns with existing 403 on invalid edit token].

### Pattern 2: Hono path-scoped middleware (alternative)

**What:** `app.use('/api/register', closureGuard)` excluding confirm-payment mount order.
**When to use:** Only if guard logic stays uniform; current `index.ts` mounts `confirm-payment` on a separate sub-path, so **per-route helper is safer** than a blanket `/api/register/*` middleware that could accidentally block `confirm-payment` [VERIFIED: `backend/src/index.ts` route order].

```typescript
// Source: https://hono.dev/docs/guides/middleware
app.use('/posts/*', cors())
```

### Pattern 3: Ops snapshot script (stdout-first)

**What:** CLI script prints reconciled totals; optional `--apply` patches `event.ts` after human review.
**When to use:** Pre-deploy, after `audit-whydonate-records` is clean.
**Example:**

```typescript
// backend/src/snapshot-final-stats.ts (sketch)
import { SheetsService } from "./services/sheets.js";

const sheets = new SheetsService();
const { totalRaisedEur, participantCount, donorCount } = await sheets.getProgress();

const snapshot = {
  raised: totalRaisedEur,
  participants: participantCount,
  donors: donorCount,
  // chargingStations: from --charging-stations CLI arg only (D-14)
};

console.log(JSON.stringify(snapshot, null, 2));
```

Follow `sync-whydonate-tracking.ts` conventions: `node --env-file=.env --import tsx`, npm script alias, exit non-zero on Sheets errors [VERIFIED: `backend/package.json` scripts].

### Pattern 4: Register page token exception (D-06 fix)

**What:** When `isCompleted`, show closed banner **unless** `?token=` is present (or session has pending registration).
**When to use:** `register/page.tsx` only; fundraise page stays fully closed.

```tsx
// Sketch — register/page.tsx
const searchParams = useSearchParams();
const hasToken = Boolean(searchParams.get("token"));
const showClosedBanner = isCompleted && !hasToken;

return showClosedBanner ? <ClosedBanner /> : <RegisterClient ... />;
```

`RegisterClient` already fetches by URL token and renders `ConfirmationPanel` for payment [VERIFIED: `RegisterClient.tsx`]. Without this exception, D-06 is violated.

### Anti-Patterns to Avoid

- **Frontend-only closure:** API routes currently have no guards [VERIFIED: `register.ts`, `fundraiser.ts`, `donors.ts`]. Direct POSTs would still write to Sheets.
- **Snapshot before reconciliation:** `getProgress()` reflects Sheets state; if WD IDs are untraced, numbers may drift post-closure.
- **Closing before stats commit:** Violates D-15; users would see €0 frozen totals.
- **Blocking `GET /api/register/by-token`:** Needed for token deep links in completed mode.
- **Blocking `POST /api/donation/:slug`:** Creates donor wall entries via fundraiser widget redirect; must be guarded with `POST /api/donors` (D-07 scope extension).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sheets aggregation for snapshot | Custom range parsing in script | `SheetsService.getProgress()` | Same logic as `/api/progress`; avoids drift between snapshot and live API [VERIFIED: `progress.ts`, `sheets.ts:711`] |
| Completed-mode detection (frontend) | New state store | `useEventStatus()` / `getEventStatus()` | Phase 4 already wired across pages |
| WD reconciliation | New matcher | `audit-whydonate-records`, `sync-whydonate-tracking` | Existing tooling is the pre-closure gate [VERIFIED: CONTEXT canonical refs] |
| Deploy env injection | Custom deploy scripts | `deploy-backend.yml` env_vars + Cloudflare dashboard | Matches ADR-004 split pipeline [CITED: ADR-004] |

**Key insight:** Phase 8 is wiring and guards around existing Phase 4 UI and Phase 6/6.1 payment flows — minimize new abstractions.

## Common Pitfalls

### Pitfall 1: Register page blocks late payment (D-06 violation)

**What goes wrong:** Completed mode shows closed banner; users with `?token=` cannot reach `ConfirmationPanel`.
**Why it happens:** `register/page.tsx` gates entire page on `isCompleted` without token check [VERIFIED: lines 38–55].
**How to avoid:** Token/session exception pattern above; add Vitest coverage.
**Warning signs:** Manual test of `/register?token=...` after completed build returns banner only.

### Pitfall 2: Backend/frontend status mismatch

**What goes wrong:** Frontend shows closed UI but API still accepts writes (or vice versa).
**Why it happens:** `EVENT_STATUS` only on Cloud Run; `NEXT_PUBLIC_EVENT_STATUS` only on Cloudflare — separate config surfaces [VERIFIED: deploy workflows].
**How to avoid:** Single closure commit sets both; deploy both in same ops window (D-15).
**Warning signs:** curl POST /api/register succeeds after frontend shows closed.

### Pitfall 3: Stale "Upcoming" badge on /events

**What goes wrong:** Event date passed but badge still shows until rebuild.
**Why it happens:** `isEventUpcoming` evaluated at build time [VERIFIED: `EventCard.tsx`, `events.ts`].
**How to avoid:** Closure deploy after event date (D-03).
**Warning signs:** Static HTML still contains upcoming badge class after 24 Aug 2026.

### Pitfall 4: Snapshot participant count semantics

**What goes wrong:** Ops expects "paid participants" but `getProgress()` counts **all registration rows** (including pending).
**Why it happens:** `participantCount = regRows.length - 1` regardless of payment status [VERIFIED: `sheets.ts:726`].
**How to avoid:** Document in plan; if ops wants paid-only, add explicit `paidParticipantCount` to script (would diverge from historical `/api/progress` — confirm with team before changing).
**Warning signs:** Snapshot participants > paid rows in audit report.

### Pitfall 5: Forgetting `record-donation` route

**What goes wrong:** Fundraiser widget redirect still appends donor wall entries post-closure.
**Why it happens:** `POST /api/donation/:slug` writes via `addDonorWallEntry` [VERIFIED: `record-donation.ts`].
**How to avoid:** Apply same guard as `POST /api/donors`.
**Warning signs:** New donor wall rows after closure deploy.

### Pitfall 6: Cloudflare deploy without env var

**What goes wrong:** Push to main rebuilds site but stays in `active` mode.
**Why it happens:** `NEXT_PUBLIC_EVENT_STATUS` not in repo; Cloudflare dashboard config required [VERIFIED: CONTEXT, ADR-004].
**How to avoid:** Plan includes explicit Cloudflare env update step before/at closure push.
**Warning signs:** Production site still shows TrackCards after closure commit.

## Code Examples

### Config: eventStatus from env

```typescript
// backend/src/config.ts (addition)
eventStatus: (process.env.EVENT_STATUS === "completed"
  ? "completed"
  : "active") as "active" | "completed",
```

Default `active` when unset — safe for local dev and pre-closure production [VERIFIED: mirrors `useEventStatus.ts` pattern].

### Guarded register route

```typescript
registerRoute.post("/", async (c) => {
  if (isEventCompleted()) return registrationClosedResponse(c);
  const body = (await c.req.json()) as Record<string, unknown>;
  // ... existing validation + appendRegistration
});
```

### ProgressSection freeze (already implemented)

```typescript
// src/components/ui/ProgressSection.tsx — no change needed for freeze
const isCompleted = status === "completed";
useEffect(() => {
  if (isCompleted) return; // skips polling
  // fetch /api/progress every 30s
}, [isCompleted]);
```

### CI completed-mode build verification

```bash
# From Phase 4 plan — add to ci.yml or closure verification step
NEXT_PUBLIC_EVENT_STATUS=completed npm run build
cd backend && npx tsc --noEmit
```

[CITED: `.planning/phases/04-polish-communications-post-event-readiness/04-PLAN.md`]

### Deploy: Cloud Run env var

```yaml
# .github/workflows/deploy-backend.yml — add to env_vars block
EVENT_STATUS=${{ vars.EVENT_STATUS }}
```

Set `vars.EVENT_STATUS=completed` in GitHub repository variables at closure time [VERIFIED: existing pattern for `SPREADSHEET_ID`, etc.].

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Date-based auto-close (pitfall doc) | Env var manual flip | Phase 4 D-07 | Closure is ops-controlled, not cron |
| Live progress polling forever | Frozen `finalStats` when completed | Phase 4 D-14 | Phase 8 populates real values |
| No backend closure guards | `EVENT_STATUS` selective guards | Phase 8 (this) | API enforces write policy |

**Deprecated/outdated:**
- PITFALLS.md §11 suggesting `410 Gone` — use `403` + `REGISTRATION_CLOSED` to match established error-code pattern [ASSUMED: discretion].

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | HTTP 403 + `REGISTRATION_CLOSED` is the right closure response | Pattern 1 | Frontend may need new locale mapping if code differs |
| A2 | `GET /api/progress` should remain live post-closure | Discretion | Ops lose live Sheets view; frozen public display unaffected |
| A3 | `participantCount` in snapshot = all registration rows (not paid-only) | Pitfall 4 | Public stats misrepresent paid headcount |
| A4 | `POST /api/donation/:slug` must be guarded | Pitfall 5 | Donor wall accepts writes after closure |
| A5 | Cloudflare env is set manually in dashboard (not in repo) | Deploy | Closure deploy forgets frontend flip |

## Open Questions

1. **Paid-only vs all-registration participant count for snapshot?**
   - What we know: `getProgress().participantCount` counts all rows [VERIFIED: `sheets.ts`].
   - What's unclear: Whether ops wants "registered" or "paid" for public final stats.
   - Recommendation: Default to `getProgress()` for consistency with pre-closure live dashboard; flag in plan for ops confirmation.

2. **Snapshot script `--apply` vs stdout-only?**
   - What we know: D-13 requires ops review before commit.
   - Recommendation: Default stdout JSON; optional `--apply` patches `finalStats` numbers only; copy/`chargingStations` always manual in same commit (D-14, D-16).

3. **GitHub `vars.EVENT_STATUS` default before closure?**
   - Recommendation: Omit or set `active` in workflow default `${{ vars.EVENT_STATUS || 'active' }}` so normal deploys unchanged until closure.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Scripts, CI, backend | ✓ | v22.19.0 | — |
| npm | Package scripts | ✓ | 10.9.3 | — |
| Google Sheets API | Snapshot + guards (runtime) | ✓ (via ADC/OAuth in prod) | googleapis ^174 | Block closure if unreachable |
| gcloud | Cloud Run deploy | ✓ | SDK 548.0.0 | GitHub Actions WIF deploy |
| gh | Optional secret/var updates | ✓ | 2.93.0 | Manual dashboard |
| ctx7 | Doc lookup | ✗ | — | Used WebFetch for Hono docs |
| Cloudflare dashboard | `NEXT_PUBLIC_EVENT_STATUS` | ✓ (manual) | — | No wrangler in repo [CITED: ADR-004] |

**Missing dependencies with no fallback:**
- Production `SPREADSHEET_ID` + Sheets credentials (already required for API; snapshot needs same)

**Missing dependencies with fallback:**
- ctx7 CLI — WebFetch used for Hono middleware documentation

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.5 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` + `cd backend && npx tsc --noEmit` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| API-02 | POST /api/register returns 403 when completed | unit | `npx vitest run backend/src/lib/eventClosure.test.ts -x` | ❌ Wave 0 |
| API-03 | POST /api/fundraiser blocked when completed | unit | `npx vitest run backend/src/routes/fundraiser.closure.test.ts -x` | ❌ Wave 0 |
| API-07 | POST /api/donors blocked when completed | unit | `npx vitest run backend/src/routes/donors.closure.test.ts -x` | ❌ Wave 0 |
| REGA-06 | confirm-payment allowed when completed | unit | `npx vitest run backend/src/routes/confirm-payment.closure.test.ts -x` | ❌ Wave 0 |
| D-06 | Register page shows flow when `?token=` + completed | component | `npx vitest run src/__tests__/register-page-completed.test.tsx -x` | ❌ Wave 0 |
| POST-02 | Completed build succeeds | smoke | `NEXT_PUBLIC_EVENT_STATUS=completed npm run build` | ❌ Wave 0 (CI step) |
| D-12 | Snapshot script outputs valid JSON | unit | `npx vitest run backend/src/snapshot-final-stats.test.ts -x` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test` (targeted file if added)
- **Per wave merge:** `npm test` + `cd backend && npx tsc --noEmit`
- **Phase gate:** `NEXT_PUBLIC_EVENT_STATUS=completed npm run build` + full test suite before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `backend/src/lib/eventClosure.ts` + tests — shared guard helper
- [ ] Route-level closure tests (mock `config.eventStatus`)
- [ ] `src/__tests__/register-page-completed.test.tsx` — token exception
- [ ] CI: add completed-mode build step to `.github/workflows/ci.yml`
- [ ] `backend/src/snapshot-final-stats.ts` + npm script

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | No user accounts |
| V3 Session Management | no | Token-based payment links only |
| V4 Access Control | **yes** | `EVENT_STATUS` write guards on registration/fundraiser/donor endpoints |
| V5 Input Validation | yes | Existing validation runs after closure guard (unchanged) |
| V6 Cryptography | no | No new crypto |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Direct API POST bypassing closed UI | Tampering | Backend `REGISTRATION_CLOSED` guard on all write routes (D-05, D-11) |
| Late payment token abuse | Elevation | Allow only `confirm-payment` on existing pending rows; no new registrations |
| Stale public stats misleading donors | Spoofing (misrepresentation) | Snapshot only after reconciliation audit clean (D-12) |

## Sources

### Primary (HIGH confidence)

- Codebase inspection — `useEventStatus.ts`, `event.ts`, `ProgressSection.tsx`, `register/page.tsx`, `backend/src/routes/*`, `backend/src/config.ts`, `deploy-backend.yml`, `ci.yml`
- `.planning/phases/08-post-event-registration-closure-activate-completed-mode-back/08-CONTEXT.md` — locked decisions D-01–D-18
- [Hono middleware guide](https://hono.dev/docs/guides/middleware) — middleware execution and path scoping

### Secondary (MEDIUM confidence)

- `docs/adrs/004-cloudflare-pages-github-app.md` — Cloudflare + GitHub Actions deploy split
- `.planning/phases/04-polish-communications-post-event-readiness/04-PLAN.md` — completed-mode build verification commands
- `.planning/research/PITFALLS.md` §11 — post-event closure risk (superseded by env-var approach)

### Tertiary (LOW confidence)

- HTTP 403 vs 409 for closure responses — discretion; aligned with existing 403 auth pattern [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; patterns match existing codebase
- Architecture: HIGH — Phase 4 UI complete; gaps clearly identified in CONTEXT + code audit
- Pitfalls: HIGH — D-06 register page gap verified in source; record-donation guard inferred from D-07

**Research date:** 2026-08-23
**Valid until:** 2026-09-23 (stable domain; env-var pattern established in Phase 4)

## RESEARCH COMPLETE

**Phase:** 8 - Post-event registration closure — activate completed mode, backend guard, final stats snapshot
**Confidence:** HIGH

### Key Findings

- Phase 4 completed-mode UI is built; Phase 8 activates it via env vars + `finalStats` snapshot, not new UI work.
- Backend has **zero closure guards today**; must add `EVENT_STATUS` to `config.ts` and guard all write routes while leaving `confirm-payment` open.
- **`register/page.tsx` blocks D-06** — needs `?token=` exception so pending registrants can still pay after closure.
- Snapshot script should reuse `SheetsService.getProgress()` and follow existing ops-script patterns (`audit-whydonate-records`, `sync-whydonate-tracking`).
- Deploy is split: `EVENT_STATUS` via GitHub Actions → Cloud Run; `NEXT_PUBLIC_EVENT_STATUS` via Cloudflare Pages dashboard (ADR-004).

### File Created

`.planning/phases/08-post-event-registration-closure-activate-completed-mode-back/08-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | No new packages; existing Next.js + Hono + Sheets stack |
| Architecture | HIGH | Code audit confirms gaps and Phase 4 reuse |
| Pitfalls | HIGH | D-06 gap verified in source; deploy split documented in ADR |

### Open Questions

- Snapshot `participants` metric: all registrations vs paid-only (defaults to current `getProgress()` behavior).
- Whether `GET /api/progress` stays live post-closure (recommended yes for ops).

### Ready for Planning

Research complete. Planner can now create PLAN.md files.
