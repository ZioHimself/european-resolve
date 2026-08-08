---
phase: 7
slug: add-august-23-run-for-ukraine-event-to-events-listing-surfac
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-08
updated: 2026-08-08
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Updated for D-22–D-26 Upcoming badge replan.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.5 + @amiceli/vitest-cucumber ^6.5.0 |
| **Config file** | `vitest.config.ts` (Wave 0: add `src/**/*.spec.{ts,tsx}` to include) |
| **Quick run command** | `npx vitest run src/__tests__/events.test.ts src/__tests__/events-page.spec.tsx -x` |
| **Full suite command** | `npm test` |
| **Build gate** | `npm run build` |
| **Estimated runtime** | ~15 seconds (unit + BDD) |

---

## Sampling Rate

- **After every task:** Run quick run command (after Wave 0 Vitest fix)
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite + `npm run build` (with spreadsheet row present)
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Decision | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|----------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 0 | EVNT-04 | — | — | N/A | config | `grep -v '^#' vitest.config.ts \| grep -c 'spec'` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 0 | EVNT-04 | — | — | N/A | config | `npx vitest run src/__tests__/events-page.spec.tsx -x` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 1 | EVNT-04 | D-15/D-17, D-22–D-26 | T-07-03 | External links keep `rel="noopener noreferrer"` | unit+BDD RED | `npx vitest run src/__tests__/events.test.ts src/__tests__/events-page.spec.tsx -x; test $? -ne 0` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 1 | EVNT-04 | D-15–D-17, D-22–D-26 | T-07-03 | Internal same-tab; Upcoming badge beside type | unit+BDD GREEN | `npx vitest run src/__tests__/events.test.ts src/__tests__/events-page.spec.tsx -x` | ❌ W0 | ⬜ pending |
| 07-02-03 | 02 | 1 | EVNT-04 | D-01–D-10, D-22 | — | Run for Ukraine fixture + Upcoming | BDD REFACTOR | `npm test` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 2 | EVNT-04 | D-04–D-14, D-21 | — | Spreadsheet row + build emits card | integration | `curl … \| grep Run for Ukraine` | manual ops | ⬜ pending |
| 07-03-03 | 03 | 2 | EVNT-04 | D-22, D-23, D-16 | — | Build HTML has name, hub, Upcoming, no Facebook | integration | `npm run build && grep … out/events/index.html && npm test` | manual ops | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — add `src/**/*.spec.{ts,tsx}` to `include`
- [ ] `src/lib/events.ts` — `isInternalAnnouncementUrl` + `isEventUpcoming` helpers (RED before GREEN)
- [ ] `src/__tests__/events.test.ts` — unit tests for both helpers (today/future/past)
- [ ] `src/__tests__/features/events-page.feature` — link + Upcoming badge scenarios + Run for Ukraine fixture
- [ ] `src/__tests__/events-page.spec.tsx` — step implementations including vi.setSystemTime for date-sensitive Upcoming tests
- [ ] `src/components/ui/EventCard.module.css` — `.badges` row layout for type + Upcoming (D-24)

---

## Decision → Test Coverage

| Decision | Test | Plan |
|----------|------|------|
| D-15, D-17 | BDD internal same-tab | 02 Task 1–2 |
| D-16 | BDD external new-tab; build grep no Facebook | 02, 03 |
| D-22 | Unit isEventUpcoming today/future/past; BDD Upcoming show/hide | 02 |
| D-23 | BDD asserts exact "Upcoming" string | 02 |
| D-24 | BDD type + Upcoming both visible; CSS `.badges` | 02 |
| D-25 | Unit future=true; BDD future event scenario | 02 |
| D-26 | Unit past=false; BDD no Upcoming; no Past badge anywhere | 02 |
| D-04–D-14, D-21 | Spreadsheet ops + build grep | 03 |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Spreadsheet row present in Events DB | Success #1 | External Google Sheets | Add row per RESEARCH checklist; verify API returns row |
| Thumbnail downloads at build | Success #4 | Requires live Drive URL | `curl -I <thumbnail_url>` then `npm run build`; confirm `public/events/2026-08-23.jpg` |
| `/events` HTML contains Run for Ukraine + Upcoming | Success #2–3, D-22 | Static export against live spreadsheet | After build, inspect `out/events/index.html` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
