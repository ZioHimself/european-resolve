# Phase 2: Backend API & Registration — Research

**Completed:** 2026-07-28
**Scope:** Hono backend on Cloud Run, Google Sheets integration, frontend form activation

---

## 1. Hono Framework on Cloud Run

### Setup Pattern

Hono v4.12+ on Node.js (Cloud Run):

```
backend/
├── src/
│   ├── index.ts          # Entry: serve() with PORT from env
│   ├── routes/
│   │   ├── register.ts   # POST /api/register
│   │   └── health.ts     # GET /health
│   ├── services/
│   │   └── sheets.ts     # Google Sheets client
│   ├── middleware/
│   │   └── error.ts      # Global error handler
│   ├── config.ts         # Typed env config
│   └── types.ts          # Shared types
├── package.json
├── tsconfig.json
├── Dockerfile
└── .dockerignore
```

### Key Dependencies

- `hono` — framework
- `@hono/node-server` — Node.js adapter (required for Cloud Run)
- `googleapis` — Google Sheets API client
- `typescript`, `tsx` — dev tooling

### Server Entry Point Pattern

```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()
// ... routes

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8080,
})
```

Cloud Run requires listening on the `PORT` env var (default 8080).

### Built-in Middleware Available

- `hono/cors` — CORS (origin as string, array, or callback function)
- `hono/logger` — request logging
- `hono/secure-headers` — security headers
- `hono/body-limit` — request size limiting

---

## 2. Google Sheets Integration

### Authentication on Cloud Run (No JSON Key File)

The CONTEXT.md decision (D-06) specifies Cloud Run service identity auth. On Cloud Run, the `googleapis` library uses Application Default Credentials (ADC) via the metadata server automatically. No key file needed.

**Setup:**
1. Cloud Run service has an attached service account (e.g., `run-for-ukraine@dev-serhiy.iam.gserviceaccount.com`)
2. That service account's email is added as an Editor on the Google Spreadsheet
3. Code uses `new google.auth.GoogleAuth({ scopes: [...] })` — ADC handles the rest

**Local development:** Use `gcloud auth application-default login` (as specified in D-06).

### Append Row Pattern

```typescript
import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: 'Registrations!A1',
  valueInputOption: 'RAW',
  requestBody: {
    values: [[participantId, fullName, email, phone, ...]]
  }
})
```

### Read for Idempotency Check (D-10)

Before appending, read the email column to check for duplicates:

```typescript
const result = await sheets.spreadsheets.values.get({
  spreadsheetId: SPREADSHEET_ID,
  range: 'Registrations!C:C', // email column
})
```

### Participant ID Derivation (D-11, D-12)

Format: `R4U-{n}` where n = row count + 1 (or dedicated counter cell). After append, the new row number determines the ID. Options:
- **Row-based:** Read current row count, calculate ID, append with ID. Race condition risk if concurrent.
- **Counter cell:** Dedicated cell (e.g., A1 = "NEXT_ID") incremented atomically. More reliable.
- **Append-then-read:** Append row without ID, then read updated range to determine row number, then update ID cell. Two API calls but safe.

**Recommended:** Read row count first, since traffic is low (charity run registration) and concurrent conflicts are unlikely. Format: `R4U-{rowCount - 1}` (header row excluded).

---

## 3. Deployment Architecture

### Dockerfile (Multi-stage, adapted from only-facts)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8080
USER node
CMD ["node", "dist/index.js"]
```

Note: Uses Node 22 (LTS in 2026, recommended for Hono). The only-facts pattern uses Node 20 but 22 is safer for Hono v4.12+.

### GitHub Actions CI/CD (adapted from only-facts)

Key differences from only-facts:
- **Cloud Run** deployment (not GKE) — use `google-github-actions/deploy-cloudrun@v2`
- **Path filter** — trigger only on `backend/` changes
- **Same GCP project** (`dev-serhiy`) — reuse WIF_PROVIDER and WIF_SERVICE_ACCOUNT vars
- **Artifact Registry** — push image, then deploy to Cloud Run

```yaml
deploy-backend:
  if: contains(github.event.commits.*.modified, 'backend/')
  permissions:
    contents: read
    id-token: write
  steps:
    - uses: google-github-actions/auth@v2
      with:
        workload_identity_provider: ${{ vars.WIF_PROVIDER }}
        service_account: ${{ vars.WIF_SERVICE_ACCOUNT }}
    - uses: google-github-actions/setup-gcloud@v2
    - run: gcloud auth configure-docker $REGION-docker.pkg.dev --quiet
    - run: docker build -t $IMAGE backend/
    - run: docker push $IMAGE
    - uses: google-github-actions/deploy-cloudrun@v2
      with:
        service: run-for-ukraine-api
        image: $IMAGE
        region: $REGION
```

### Environment Variables for Cloud Run

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port (Cloud Run sets this) | `8080` |
| `SPREADSHEET_ID` | Google Sheets document ID | `1abc...xyz` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `https://european-resolve.org,http://localhost:3000` |
| `MONOBANK_JAR_URL` | Redirect URL for Monobank jar | `https://send.monobank.ua/jar/...` |

---

## 4. CORS Configuration

Hono built-in CORS middleware supports exactly what's needed:

```typescript
import { cors } from 'hono/cors'

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '').split(',')

app.use('/api/*', cors({
  origin: (origin) => ALLOWED_ORIGINS.includes(origin) ? origin : '',
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 600,
}))
```

This satisfies D-21 (CORS for `european-resolve.org` and `localhost`, configurable via env var).

---

## 5. Frontend Activation

### Current State (from Phase 1)

- `RegistrationForm.tsx` — server component (no `'use client'`), all fields have `aria-disabled="true"`, `readOnly`, `tabIndex={-1}`
- `TierCard.tsx` — buttons are `disabled`, `aria-disabled="true"`
- `TierGrid.tsx` — static render of tier cards
- Register page (`page.tsx`) — server component, renders `<TierGrid />` + `<RegistrationForm />`

### Required Changes

1. **Register page** — needs to become a client component (or introduce a client wrapper) to manage tier selection + form state
2. **TierCard** — needs onClick handler to select tier, needs selected state styling
3. **RegistrationForm** — complete rewrite as interactive client component:
   - Remove all disabled/readonly attributes
   - Remove preview banner
   - Add `'use client'` directive
   - Add form state (controlled inputs)
   - Add custom validation (D-18)
   - Add error display: summary at top + inline per field (D-19)
   - Add submission to backend API
   - Add confirmation panel (D-13, D-14)
   - Add Monobank CTA button (D-15, D-16)

### Architecture Decision: Page vs Component Client Boundary

The register page currently has server-component `metadata` export. Options:
- **Option A:** Keep page as server component for metadata. Create a `RegisterClient.tsx` client component that wraps TierGrid + RegistrationForm with shared state.
- **Option B:** Make the entire page a client component (loses static metadata).

**Recommended: Option A** — preserves SEO metadata as static, uses a client boundary wrapper for interactivity.

### Validation Strategy (D-18, D-19, D-20)

Custom validation without external libraries:
- Client-side: validate on submit (and optionally on blur for UX)
- Fields: name (required), email (required + format), phone (optional), tshirt (required), language (required), country (required), GDPR consent (required)
- Backend returns structured errors in same shape → frontend displays them identically
- Error shape: `{ field: string; message: string }[]`

### Confirmation Panel (D-13, D-14, D-15, D-16)

After successful registration:
- Replace form section with confirmation panel (same container)
- Shows: participant ID, name, tier, amount, tier rewards
- Monobank CTA button: opens jar URL in new tab (`target="_blank"`)
- Visa/Mastercard notice near CTA button AND near tier cards (two places per D-16)

---

## 6. API Contract

### POST /api/register

**Request:**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string (optional)",
  "tshirtSize": "XS|S|M|L|XL|XXL",
  "language": "English|French|Ukrainian",
  "country": "string",
  "tierId": "supporter|champion|patron",
  "gdprConsent": true,
  "commsOptin": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "participantId": "R4U-42",
    "fullName": "John Doe",
    "tierId": "champion",
    "tierName": "Champion",
    "amountEur": 75,
    "rewards": ["Race bib", "Finisher medal", ...],
    "monobankJarUrl": "https://send.monobank.ua/jar/..."
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Valid email address is required" },
    { "field": "gdprConsent", "message": "GDPR consent is required to register" }
  ]
}
```

**Idempotent Response (200, same email):**
Same shape as success response — returns existing participant data.

### GET /health

```json
{ "status": "ok" }
```

---

## 7. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Google Sheets rate limits (100 req/100s) | Low risk — registration traffic for a charity run is well under limits |
| Concurrent registration race condition (ID collision) | Low risk — sequential row-based ID. If it becomes an issue, use a counter cell or lock |
| Cloud Run cold starts | Accept ~1-2s cold start. Set min-instances=0 (cost). Can set min=1 for launch day |
| Form becomes large client component | Split: TierSelection + RegistrationForm + ConfirmationPanel as separate client components within wrapper |
| CORS misconfiguration blocking production | Test with exact production origin in staging. Use env var for flexibility |

---

## 8. Dependencies (backend/package.json)

### Production
- `hono` — ^4.12.0
- `@hono/node-server` — ^1.14.0
- `googleapis` — ^146.0.0

### Dev
- `typescript` — ^5.6.0
- `tsx` — ^4.19.0 (dev server: `tsx watch src/index.ts`)
- `@types/node` — ^22.0.0

### Build Script
- `"build": "tsc"` — compile to `dist/`
- `"dev": "tsx watch src/index.ts"` — local dev with hot reload
- `"start": "node dist/index.js"` — production entry

---

## 9. Validation Architecture

### Nyquist Validation Dimensions

| Dimension | Test Strategy |
|-----------|--------------|
| API contract | Integration test: POST valid/invalid payloads, assert response shape |
| Sheets persistence | Integration test (or mock): verify append is called with correct data |
| Idempotency | Test: same email twice returns same participant ID |
| CORS | curl/test: preflight from allowed/disallowed origins |
| Frontend form validation | Component test: submit with invalid data, assert error display |
| Frontend-backend integration | E2E concept: form submit → API → confirmation panel |
| Health check | Smoke test: GET /health returns 200 |
| Deployment | CI passes, Cloud Run responds to health check |

---

## RESEARCH COMPLETE
