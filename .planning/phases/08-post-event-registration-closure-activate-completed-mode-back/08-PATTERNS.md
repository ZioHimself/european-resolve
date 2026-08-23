# Phase 8: Post-event registration closure — activate completed mode, backend guard, final stats snapshot - Pattern Map

**Mapped:** 2026-08-23
**Files analyzed:** 19
**Analogs found:** 17 / 19

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `backend/src/config.ts` | config | transform | `backend/src/config.ts` + `src/hooks/useEventStatus.ts` | exact |
| `backend/src/lib/eventClosure.ts` | utility | request-response | `backend/src/routes/fundraiser.ts` (403 + `ApiResponse`) | role-match |
| `backend/src/routes/register.ts` | route | request-response | `backend/src/routes/register.ts` | exact |
| `backend/src/routes/fundraiser.ts` | route | request-response | `backend/src/routes/fundraiser.ts` | exact |
| `backend/src/routes/donors.ts` | route | request-response | `backend/src/routes/donors.ts` | exact |
| `backend/src/routes/record-donation.ts` | route | request-response | `backend/src/routes/donors.ts` | exact |
| `backend/src/snapshot-final-stats.ts` | utility | batch, transform | `backend/src/audit-whydonate-records.ts` | exact |
| `backend/.env.example` | config | — | `backend/.env.example` | exact |
| `backend/package.json` | config | — | `backend/package.json` | exact |
| `src/app/events/2026-run-for-ukraine/register/page.tsx` | component | request-response | `src/__tests__/RegisterClient.test.tsx` (token URL) + `register/page.tsx` | exact |
| `src/data/event.ts` | model | transform | `src/data/event.ts` | exact |
| `.github/workflows/deploy-backend.yml` | config | — | `.github/workflows/deploy-backend.yml` | exact |
| `.github/workflows/ci.yml` | config | batch | `.github/workflows/ci.yml` + Phase 4 `04-PLAN.md` | exact |
| `backend/src/lib/eventClosure.test.ts` | test | — | `backend/src/lib/whydonateOrders.test.ts` | role-match |
| `backend/src/routes/*.closure.test.ts` | test | — | *(none — first Hono route tests)* | no analog |
| `src/__tests__/register-page-completed.test.tsx` | test | — | `src/__tests__/RegisterClient.test.tsx` | partial |
| `backend/src/snapshot-final-stats.test.ts` | test | — | `backend/src/lib/whydonateOrders.test.ts` | role-match |

**Explicitly unmodified (must stay open):** `backend/src/routes/confirm-payment.ts`, `backend/src/routes/lookup.ts`, `backend/src/routes/progress.ts` (GET).

## Pattern Assignments

### `backend/src/config.ts` (config, transform)

**Analog:** `backend/src/config.ts` + `src/hooks/useEventStatus.ts`

**Env var parsing pattern** (`config.ts` lines 1-3, 20-29):

```typescript
const nodeEnv = (
  process.env.NODE_ENV === "production" ? "production" : "development"
) as "development" | "production";

export const config = Object.freeze({
  port: Number(process.env.PORT) || 8080,
  spreadsheetId,
  // ...
  nodeEnv,
});
```

**Frontend mirror** (`useEventStatus.ts` lines 1-7):

```typescript
type EventStatus = "active" | "completed";

export function getEventStatus(): EventStatus {
  return process.env.NEXT_PUBLIC_EVENT_STATUS === "completed"
    ? "completed"
    : "active";
}
```

**Add `eventStatus` to frozen config** — same ternary, default `"active"` when unset (safe for local dev and pre-closure production):

```typescript
eventStatus: (process.env.EVENT_STATUS === "completed"
  ? "completed"
  : "active") as "active" | "completed",
```

No production throw for missing `EVENT_STATUS` (unlike `SPREADSHEET_ID`); closure is ops-triggered, not required at boot.

---

### `backend/src/lib/eventClosure.ts` (utility, request-response)

**Analog:** `backend/src/routes/fundraiser.ts` (403 auth errors) + `backend/src/types.ts` (`ApiResponse`)

**Machine-readable error + 403 pattern** (`fundraiser.ts` lines 124-128):

```typescript
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return c.json(
    { success: false, errors: [{ field: "authorization", message: "Edit token required", code: "VALIDATION_AUTH_REQUIRED" }] } satisfies ApiResponse<never>,
    403,
  );
}
```

**Global error shape** (`middleware/error.ts` lines 12-17):

```typescript
return c.json(
  {
    success: false,
    errors: [{ field: "_global", message, code: "INTERNAL_ERROR" }],
  },
  500,
);
```

**Core pattern to implement:**

```typescript
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

Call at the **top** of each blocked write handler, before parsing body or touching Sheets.

---

### `backend/src/routes/register.ts` (route, request-response)

**Analog:** `backend/src/routes/register.ts`

**Imports pattern** (lines 1-17):

```typescript
import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { sendConfirmationEmail } from "../services/email.js";
import { config } from "../config.js";
import type {
  RegisterRequest,
  RegisterResponse,
  ValidationError,
  ApiResponse,
  // ...
} from "../types.js";
```

**Handler entry + validation** (lines 94-114):

```typescript
registerRoute.post("/", async (c) => {
  const body = (await c.req.json()) as Record<string, unknown>;

  regFlowLog.register("request received", { /* ... */ });

  const errors = validate(body);
  if (errors.length > 0) {
    return c.json({ success: false, errors } satisfies ApiResponse<never>, 400);
  }
  // ...
});
```

**Guard insertion point** — immediately after `registerRoute.post("/", async (c) => {`, before `c.req.json()`:

```typescript
if (isEventCompleted()) return registrationClosedResponse(c);
```

**Route mount order** (`index.ts` lines 29-31) — `confirm-payment` and `by-token` are separate mounts; guarding only `registerRoute.post("/")` cannot block late payment:

```typescript
app.route("/api/register/confirm-payment", confirmPaymentRoute);
app.route("/api/register/by-token", lookupRoute);
app.route("/api/register", registerRoute);
```

---

### `backend/src/routes/fundraiser.ts` (route, request-response)

**Analog:** `backend/src/routes/fundraiser.ts`

**Guard these handlers only:**
- `fundraiserRoute.post("/")` (line 31) — create fundraiser
- `fundraiserRoute.put("/:slug")` (line 120) — edit/publish
- `fundraiserRoute.post("/register")` (line 208) — combined fundraiser + registration

**Leave unguarded:** `fundraiserRoute.get("/:slug")` (line 92) — archive read.

**POST create pattern** (lines 31-65):

```typescript
fundraiserRoute.post("/", async (c) => {
  const formData = await c.req.formData();
  // ... validation ...
  if (errors.length > 0) {
    return c.json({ success: false, errors } satisfies ApiResponse<never>, 400);
  }
  // Sheets write
});
```

**PUT publish guard** (lines 157-158) — block `status: "published"` transitions when completed:

```typescript
if (status !== null && status !== "draft" && status !== "published") {
  errors.push({ field: "status", message: "Status must be 'draft' or 'published'", code: "VALIDATION_STATUS_INVALID" });
}
```

Add closure guard at top of each write handler; same `registrationClosedResponse(c)` for all three.

---

### `backend/src/routes/donors.ts` (route, request-response)

**Analog:** `backend/src/routes/donors.ts`

**POST handler** (lines 9-41):

```typescript
donorsRoute.post("/", async (c) => {
  const body = (await c.req.json()) as Record<string, unknown>;

  const errors: ValidationError[] = [];
  // field validation ...
  if (errors.length > 0) {
    return c.json({ success: false, errors } satisfies ApiResponse<never>, 400);
  }
  // Sheets write via addDonorWallEntry
});
```

**GET stays open** (lines 72-79) — no guard on `donorsRoute.get("/:slug")`.

---

### `backend/src/routes/record-donation.ts` (route, request-response)

**Analog:** `backend/src/routes/record-donation.ts` + `backend/src/routes/donors.ts`

**POST handler** (lines 9-51):

```typescript
recordDonationRoute.post("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const body = (await c.req.json()) as Record<string, unknown>;
  // ...
  await sheetsService.addDonorWallEntry(slug, donorName, message, amount || undefined);
});
```

Same closure guard as `donors.ts` — widget redirect path must not bypass donor wall block (RESEARCH Pitfall 5).

---

### `backend/src/snapshot-final-stats.ts` (utility, batch + transform)

**Analog:** `backend/src/audit-whydonate-records.ts`

**Ops script header + main** (`audit-whydonate-records.ts` lines 1-34):

```typescript
/**
 * Per-record WhyDonate audit: each WD payment → sheet location + amount check.
 *
 * Usage:
 *   npm run audit-whydonate-records
 *   npm run audit-whydonate-records -- --full
 */

import { SheetsService } from "./services/sheets.js";

async function main(): Promise<void> {
  const full = process.argv.includes("--full");
  // ...
  const sheets = new SheetsService();
  const registrations = await sheets.listRegistrationRows();
  // ...
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Progress aggregation** (`progress.ts` lines 10-26 + `sheets.ts` lines 711-732):

```typescript
const { totalRaisedEur, participantCount, donorCount } =
  await sheetsService.getProgress();
```

```typescript
async getProgress(): Promise<{
  totalRaisedEur: number;
  participantCount: number;
  donorCount: number;
}> {
  // participantCount = regRows.length - 1 (all rows, not paid-only)
  // totalRaisedEur sums row[14] where row[13] === "paid"
}
```

**npm script alias** (`package.json` lines 13-14):

```json
"sync-whydonate-tracking": "node --env-file=.env --import tsx src/sync-whydonate-tracking.ts",
"audit-whydonate-records": "node --env-file=.env --import tsx src/audit-whydonate-records.ts",
```

Add `"snapshot-final-stats": "node --env-file=.env --import tsx src/snapshot-final-stats.ts"`.

**Stdout-first output** — default prints JSON; optional `--charging-stations N` for D-14 manual value; optional `--apply` patches `finalStats` numbers only (copy stays manual per D-16).

---

### `backend/.env.example` (config)

**Analog:** `backend/.env.example`

**Comment + var block pattern** (lines 36-48):

```bash
# Fundraising goal in EUR (default 3000)
GOAL_EUR=3000

# Node environment
NODE_ENV=development
```

Add after `GOAL_EUR` or before `NODE_ENV`:

```bash
# Event lifecycle: "active" (default) or "completed" (blocks new registrations/writes)
EVENT_STATUS=active
```

Document GitHub `vars.EVENT_STATUS` in the existing "GitHub Actions repository variables" comment block (lines 50-56).

---

### `backend/package.json` (config)

**Analog:** `backend/package.json` scripts block (lines 6-16) — see snapshot script pattern above.

---

### `src/app/events/2026-run-for-ukraine/register/page.tsx` (component, request-response)

**Analog:** `register/page.tsx` + `fundraise/page.tsx` (closed banner) + `RegisterClient.test.tsx` (token deep link)

**Current completed gate** (lines 19-55) — blocks entire page including token flow (D-06 violation):

```tsx
export default function RegisterPage() {
  useLocale();
  const isCompleted = useEventStatus() === "completed";
  const [step, setStep] = useState<RegisterStep>("pick-tier");

  return (
    // ...
    {isCompleted ? (
      <div className={styles.closedBanner}>
        <h1 className={styles.closedHeading}>
          {t("closed.registrationClosed")}
        </h1>
        {/* ... */}
      </div>
    ) : (
      <>
        <RegisterClient onStepChange={setStep} />
      </>
    )}
  );
}
```

**Closed banner markup** (`fundraise/page.tsx` lines 29-45) — reuse same structure/locale keys pattern.

**Token exception** — import `useSearchParams` from `next/navigation`:

```tsx
const searchParams = useSearchParams();
const hasToken = Boolean(searchParams.get("token"));
const showClosedBanner = isCompleted && !hasToken;
```

Replace `isCompleted ?` with `showClosedBanner ?`. Fundraise page stays fully closed (no token exception).

**RegisterClient token behavior** (`RegisterClient.test.tsx` lines 71-79):

```typescript
window.history.replaceState({}, "", "?token=NEW_TOKEN");
render(<RegisterClient />);
await waitFor(() => {
  expect(screen.getByTestId("conf-token")).toHaveTextContent("NEW_TOKEN");
});
```

---

### `src/data/event.ts` (model, transform)

**Analog:** `src/data/event.ts`

**Type + data shape** (lines 20-27, 99-111):

```typescript
finalStats: {
  raised: number;
  participants: number;
  donors: number;
  chargingStations: number;
};

postEvent: {
  thankYouMessage: "...",
  impactStatement: "...",
  galleryFolderId: "",
  finalStats: {
    raised: 0,
    participants: 0,
    donors: 0,
    chargingStations: 0,
  },
},
```

**Closure commit** (D-15, D-16): update `finalStats` from snapshot script + manually set `chargingStations`, `thankYouMessage`, `impactStatement` in same commit. No em dash in user-facing copy (CONVENTIONS.md).

**Consumer** (`ProgressSection.tsx` lines 18-33) — already reads frozen stats when completed; no code change needed once values are committed.

---

### `.github/workflows/deploy-backend.yml` (config)

**Analog:** `.github/workflows/deploy-backend.yml`

**env_vars block** (lines 71-85):

```yaml
env_vars: |
  SPREADSHEET_ID=${{ vars.SPREADSHEET_ID }}
  CORS_ORIGINS=${{ vars.CORS_ORIGINS }}
  WHYDONATE_WIDGET_URL=${{ vars.WHYDONATE_WIDGET_URL }}
  GOOGLE_DRIVE_FOLDER_ID=${{ vars.GOOGLE_DRIVE_FOLDER_ID }}
  GALLERY_FOLDER_ID=${{ vars.GALLERY_FOLDER_ID }}
  NODE_ENV=production
```

Add with safe default for pre-closure deploys:

```yaml
EVENT_STATUS=${{ vars.EVENT_STATUS || 'active' }}
```

Set `vars.EVENT_STATUS=completed` in GitHub repository variables at closure time only.

---

### `.github/workflows/ci.yml` (config, batch)

**Analog:** `.github/workflows/ci.yml` + Phase 4 `04-PLAN.md` verification command

**Current quality job** (lines 18-22):

```yaml
- run: npm ci
- run: npm run lint
- run: npm run typecheck
- run: npm test
- run: npm run build
```

**Add completed-mode smoke build** (from `04-PLAN.md`):

```yaml
- run: NEXT_PUBLIC_EVENT_STATUS=completed npm run build
```

Keep existing default build step for active-mode regression. Optionally add `cd backend && npx tsc --noEmit` if not already covered by root CI.

---

### `backend/src/lib/eventClosure.test.ts` (test)

**Analog:** `backend/src/lib/whydonateOrders.test.ts`

**Test structure** (lines 1-28):

```typescript
import { describe, expect, it } from "vitest";
import { scoreNameMatch } from "./whydonateOrders.js";

describe("scoreNameMatch", () => {
  it("matches word-level donor names", () => {
    expect(scoreNameMatch("Arthur Bobyshev", "Arthur")).toEqual({
      score: 2,
      reason: "word-match",
    });
  });
});
```

Test `isEventCompleted()` with `vi.mock("../config.js")` or env stub; test `registrationClosedResponse` returns 403 + `REGISTRATION_CLOSED` code.

---

### `src/__tests__/register-page-completed.test.tsx` (test)

**Analog:** `src/__tests__/RegisterClient.test.tsx`

**Setup pattern** (lines 1-64):

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";

vi.mock("@/components/ui/ConfirmationPanel", () => ({ /* ... */ }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});
```

Mock `useEventStatus` → `"completed"`; mock `useSearchParams` with/without `token`; assert closed banner vs `RegisterClient` visibility.

---

### `backend/src/snapshot-final-stats.test.ts` (test)

**Analog:** `backend/src/lib/whydonateOrders.test.ts`

Mock `SheetsService.getProgress()`; assert stdout JSON shape `{ raised, participants, donors }`. No live Sheets in unit tests.

---

## Shared Patterns

### ApiResponse error codes

**Source:** `backend/src/types.ts` (lines 68-76) + route handlers
**Apply to:** `eventClosure.ts`, all guarded routes

```typescript
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };
```

Use `satisfies ApiResponse<never>` on all error JSON responses. Closure code: `REGISTRATION_CLOSED`, field: `_global`, HTTP **403**.

### Env var lifecycle (frontend ↔ backend)

**Source:** `src/hooks/useEventStatus.ts` + `backend/src/config.ts`
**Apply to:** config, deploy workflows, Cloudflare dashboard (manual)

| Surface | Var | Values |
|---------|-----|--------|
| Frontend (build-time) | `NEXT_PUBLIC_EVENT_STATUS` | `completed` \| unset/`active` |
| Backend (runtime) | `EVENT_STATUS` | `completed` \| unset/`active` |

Both must flip in the same closure deploy window (D-15).

### Ops script conventions

**Source:** `audit-whydonate-records.ts`, `sync-whydonate-tracking.ts`, `package.json`
**Apply to:** `snapshot-final-stats.ts`

- File header JSDoc with `Usage:` and npm script name
- `node --env-file=.env --import tsx src/<script>.ts`
- `main().catch((err) => { console.error(err); process.exit(1); })`
- Reuse `SheetsService`, not ad-hoc range parsing

### Selective write guards (allowlist)

**Source:** `backend/src/index.ts` (route mounts)
**Apply to:** all new guards

| Endpoint | Guard when completed? |
|----------|----------------------|
| `POST /api/register` | Yes |
| `POST /api/register/confirm-payment` | **No** (D-06) |
| `GET /api/register/by-token/:token` | **No** (token deep links) |
| `POST /api/fundraiser`, `PUT /api/fundraiser/:slug`, `POST /api/fundraiser/register` | Yes |
| `GET /api/fundraiser/:slug` | No |
| `POST /api/donors` | Yes |
| `POST /api/donation/:slug` | Yes |
| `GET /api/progress` | No (ops discretion: stay live) |

### Frontend completed mode (already built — activate only)

**Source:** `src/hooks/useEventStatus.ts`, `ProgressSection.tsx`, closed banners
**Apply to:** env flip + `event.ts` snapshot; minimal page fix for register token

No new UI components for Phase 8. `fundraise/page.tsx` closed banner is the markup template for register closed state.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `backend/src/routes/*.closure.test.ts` | test | request-response | No existing Hono route/integration tests in repo; first route-level closure tests should mock `config.eventStatus` and invoke route handlers directly or via `app.request()` |
| `backend/src/routes/confirm-payment.closure.test.ts` | test | request-response | Same as above; assert handler proceeds when `eventStatus === "completed"` |

**Planner guidance for route tests:** Use Vitest `vi.mock("../config.js", () => ({ config: { eventStatus: "completed" } }))` and Hono's `app.request()` if mounting a minimal app, or export handlers for unit testing. No `@hono/testing` dependency today.

## Metadata

**Analog search scope:** `backend/src/` (routes, lib, config, ops scripts), `src/` (hooks, data, app pages, tests), `.github/workflows/`, Phase 4 planning artifacts
**Files scanned:** ~35
**Pattern extraction date:** 2026-08-23
