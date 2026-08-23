---
phase: 8
slug: post-event-registration-closure-activate-completed-mode-back
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-08-23
updated: 2026-08-23
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.5 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run <target-file>` |
| **Full suite command** | `npm test && cd backend && npx tsc --noEmit` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted `npx vitest run <file>`
- **After every plan wave:** Run `npm test` + `cd backend && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite + `NEXT_PUBLIC_EVENT_STATUS=completed npm run build`
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | API-02 | T-8-01 | POST /api/register returns 403 REGISTRATION_CLOSED when completed | unit | `npx vitest run backend/src/lib/eventClosure.test.ts` | ✅ | ✅ green |
| 08-01-02 | 01 | 1 | API-03 | T-8-01 | POST /api/fundraiser blocked when completed | unit | `npx vitest run backend/src/routes/fundraiser.closure.test.ts` | ✅ | ✅ green |
| 08-01-03 | 01 | 1 | API-07 | T-8-01 | POST /api/donors + record-donation blocked when completed | unit | `npx vitest run backend/src/routes/donors.closure.test.ts` | ✅ | ✅ green |
| 08-01-04 | 01 | 1 | REGA-06 | T-8-02 | confirm-payment allowed when completed | unit | `npx vitest run backend/src/routes/confirm-payment.closure.test.ts` | ✅ | ✅ green |
| 08-02-01 | 02 | 2 | D-06 | — | Register page shows flow when `?token=` + completed | component | `npx vitest run src/__tests__/register-page-completed.test.tsx` | ✅ | ✅ green |
| 08-03-01 | 03 | 3 | D-12 | — | Snapshot script outputs valid JSON | unit | `npx vitest run backend/src/snapshot-final-stats.test.ts` | ✅ | ✅ green |
| 08-04-01 | 04 | 4 | POST-02 | — | Completed build succeeds | smoke | `NEXT_PUBLIC_EVENT_STATUS=completed npm run build` | ✅ | ⬜ pending |
| 08-04-02 | 04 | 4 | D-19 | T-8-11 | chargingStations stat hidden when value is 0 | component | `npx vitest run src/__tests__/AccountabilityReport.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/src/lib/eventClosure.ts` + `eventClosure.test.ts` — shared guard helper (08-01)
- [x] Route-level closure tests (mock `config.eventStatus`) (08-01)
- [x] `src/__tests__/register-page-completed.test.tsx` — token exception (08-02)
- [x] `backend/src/snapshot-final-stats.ts` + npm script (08-03)
- [ ] CI completed-mode build step verified in 08-04 Task 1
- [ ] `src/__tests__/AccountabilityReport.test.tsx` — D-19 (08-04 Task 2)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cloudflare `NEXT_PUBLIC_EVENT_STATUS=completed` | D-01 | Env var set in dashboard, not repo | Set in Cloudflare Pages → rebuild; verify TrackCards hidden |
| GitHub `vars.EVENT_STATUS=completed` | D-10 | GitHub repo variable | Set variable; deploy backend; curl POST /api/register → 403 |
| Ops closure sequence | D-15 | Human judgment on reconciliation | Audit clean → snapshot → commit event.ts (donation stats + copy) → flip env vars → deploy |
| Hurkit chargingStations follow-up | D-14 | Hurkit confirms weeks later | Later deploy: set chargingStations > 0 in event.ts; stat appears via D-19 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
