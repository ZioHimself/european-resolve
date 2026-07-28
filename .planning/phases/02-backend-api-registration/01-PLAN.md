---
plan_id: "01"
title: "Backend API: Hono Service with Google Sheets Registration"
phase: 2
wave: 1
depends_on: []
files_modified:
  - backend/package.json
  - backend/tsconfig.json
  - backend/src/index.ts
  - backend/src/config.ts
  - backend/src/types.ts
  - backend/src/routes/health.ts
  - backend/src/routes/register.ts
  - backend/src/services/sheets.ts
  - backend/src/middleware/error.ts
  - backend/Dockerfile
  - backend/.dockerignore
autonomous: true
requirements_addressed: [API-01, API-02, REGA-08]
---

# Plan 01: Backend API — Hono Service with Google Sheets Registration

<objective>
Create the backend API service using Hono on Node.js. Implements POST /api/register (validates, writes to Google Sheets, returns participant ID) and GET /health. Runs on Cloud Run with service account auth for Sheets.
</objective>

<must_haves>
- Hono server listening on PORT env var (default 8080)
- POST /api/register validates input, appends row to Google Sheets, returns participant ID in R4U-{n} format
- Idempotent by email: same email returns existing participant, no duplicate row
- GET /health returns 200 with { status: "ok" }
- Structured validation error response with per-field errors
- CORS configured via CORS_ORIGINS env var (comma-separated)
- Multi-stage Dockerfile for Cloud Run deployment
- TypeScript strict mode throughout

<truths>
- D-01: Backend in `backend/` subfolder
- D-02: Hono framework (not Express)
- D-05: Cloud Run deployment
- D-06: Cloud Run service identity for Sheets auth (ADC, no key file)
- D-08: Single "Registrations" tab
- D-09: Columns: participant_id, full_name, email, phone, tshirt_size, language, country, tier_id, amount_eur, gdpr_consent, comms_optin, registered_at
- D-10: Idempotent by email
- D-11: Format R4U-{n} (sequential integer, no zero-padding)
- D-21: CORS allows european-resolve.org and localhost
</truths>
</must_haves>

<tasks>

<task id="01.1">
<title>Initialize backend project</title>
<read_first>
- package.json (root project — understand monorepo-ish structure)
- /Users/serhiy/dev/github/ziohimself/only-facts/packages/engine/Dockerfile (Dockerfile pattern)
</read_first>
<action>
Create `backend/` directory with:

**backend/package.json:**
- name: `@european-resolve/api`
- type: `module`
- scripts: `dev` (tsx watch src/index.ts), `build` (tsc), `start` (node dist/index.js)
- dependencies: `hono`, `@hono/node-server`, `googleapis`
- devDependencies: `typescript`, `tsx`, `@types/node`

**backend/tsconfig.json:**
- target: ES2022, module: NodeNext, moduleResolution: NodeNext
- strict: true, outDir: dist, rootDir: src
- esModuleInterop: true, skipLibCheck: true

**backend/Dockerfile:** Multi-stage (builder + runner), Node 22-alpine, USER node, EXPOSE 8080, CMD node dist/index.js

**backend/.dockerignore:** node_modules, dist, .env, *.md
</action>
<acceptance_criteria>
- `backend/package.json` exists with `hono`, `@hono/node-server`, `googleapis` in dependencies
- `backend/tsconfig.json` has `"strict": true` and `"module": "NodeNext"`
- `backend/Dockerfile` uses multi-stage build with node:22-alpine
- Running `cd backend && npm install` succeeds
- Running `cd backend && npx tsc --noEmit` passes (once source files exist)
</acceptance_criteria>
</task>

<task id="01.2">
<title>Create config and types modules</title>
<read_first>
- /Users/serhiy/dev/github/ziohimself/only-facts/packages/engine/src/config/index.ts (typed config pattern)
- .planning/phases/02-backend-api-registration/02-CONTEXT.md (D-09 column list, D-11 ID format)
- src/data/event.ts (tier IDs: supporter, champion, patron)
</read_first>
<action>
**backend/src/config.ts:**
- Export frozen `config` object with typed fields:
  - `port`: number (from PORT env, default 8080)
  - `spreadsheetId`: string (from SPREADSHEET_ID env, required in production)
  - `corsOrigins`: string[] (from CORS_ORIGINS env, split by comma)
  - `monobankJarUrl`: string (from MONOBANK_JAR_URL env)
  - `nodeEnv`: 'development' | 'production' (from NODE_ENV)
- Validate: throw if `spreadsheetId` is empty in production

**backend/src/types.ts:**
- `TierId` = 'supporter' | 'champion' | 'patron'
- `TshirtSize` = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
- `Language` = 'English' | 'French' | 'Ukrainian'
- `RegisterRequest` — input shape with all form fields
- `RegisterResponse` — success response with participantId, tier info, monobankJarUrl
- `ValidationError` — `{ field: string; message: string }`
- `ApiResponse<T>` — `{ success: true; data: T } | { success: false; errors: ValidationError[] }`
</action>
<acceptance_criteria>
- `backend/src/config.ts` exports a frozen `config` object
- Config throws if SPREADSHEET_ID is empty when NODE_ENV=production
- `backend/src/types.ts` exports `RegisterRequest`, `RegisterResponse`, `ApiResponse`, `ValidationError`
- `TierId` union matches exactly the tier IDs in `src/data/event.ts`
- `npx tsc --noEmit` in backend/ passes
</acceptance_criteria>
</task>

<task id="01.3">
<title>Implement Google Sheets service</title>
<read_first>
- backend/src/config.ts (spreadsheetId)
- backend/src/types.ts (RegisterRequest, TierId)
- .planning/phases/02-backend-api-registration/02-CONTEXT.md (D-09 columns, D-10 idempotency, D-12 ID derivation)
- .planning/phases/02-backend-api-registration/02-RESEARCH.md (Sheets API patterns)
</read_first>
<action>
**backend/src/services/sheets.ts:**

Export class `SheetsService` with methods:
- `constructor()` — creates GoogleAuth with spreadsheets scope, creates sheets client
- `findByEmail(email: string): Promise<ExistingRegistration | null>` — reads Registrations tab, finds row by email column, returns existing data or null
- `appendRegistration(data: RegisterRequest): Promise<{ participantId: string }>` — reads current row count, calculates R4U-{n} ID, appends row with all D-09 columns, returns participant ID
- `getRowCount(): Promise<number>` — reads range to determine next ID

Column order matching D-09: participant_id, full_name, email, phone, tshirt_size, language, country, tier_id, amount_eur, gdpr_consent, comms_optin, registered_at

Use `valueInputOption: 'RAW'` for append. Timestamp format: ISO 8601.
</action>
<acceptance_criteria>
- `backend/src/services/sheets.ts` exports `SheetsService` class
- `findByEmail` reads column C (email) and returns matching row data or null
- `appendRegistration` calculates participant ID as `R4U-{rowCount}` and appends all 12 columns
- Auth uses `new google.auth.GoogleAuth({ scopes })` (ADC, no keyFile)
- `npx tsc --noEmit` passes
</acceptance_criteria>
</task>

<task id="01.4">
<title>Implement registration route with validation</title>
<read_first>
- backend/src/types.ts (RegisterRequest, ApiResponse, ValidationError)
- backend/src/services/sheets.ts (SheetsService interface)
- backend/src/config.ts (monobankJarUrl)
- src/data/event.ts (tier prices and rewards for response)
- .planning/phases/02-backend-api-registration/02-CONTEXT.md (D-10 idempotency, D-14 confirmation data)
</read_first>
<action>
**backend/src/routes/register.ts:**

Export a Hono sub-app with POST `/` route:

1. Parse JSON body
2. Validate fields:
   - `fullName`: required, non-empty
   - `email`: required, valid email format (regex)
   - `phone`: optional string
   - `tshirtSize`: required, must be one of TshirtSize union values
   - `language`: required, must be one of Language union values
   - `country`: required, non-empty
   - `tierId`: required, must be one of TierId union values
   - `gdprConsent`: required, must be `true`
   - `commsOptin`: boolean (defaults to false)
3. If validation fails: return 400 with `{ success: false, errors: [...] }`
4. Check idempotency: call `sheetsService.findByEmail(email)`
   - If found: return 200 with existing registration data
5. Append to Sheets: call `sheetsService.appendRegistration(data)`
6. Return 200 with participant ID, tier name, amount, rewards, monobankJarUrl

Tier data (name, price, rewards) is a static lookup map within the route file (duplicated from frontend data — backend must not import from frontend src/).
</action>
<acceptance_criteria>
- POST route validates all required fields and returns 400 with per-field errors for invalid input
- Missing `gdprConsent: true` returns validation error
- Invalid `tierId` returns validation error
- Valid request calls SheetsService and returns 200 with participantId, tierName, amountEur, rewards, monobankJarUrl
- Duplicate email returns 200 with existing participant data (not 409 or error)
- Email validation uses regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `npx tsc --noEmit` passes
</acceptance_criteria>
</task>

<task id="01.5">
<title>Create health route and wire up main server</title>
<read_first>
- backend/src/routes/register.ts (register route sub-app)
- backend/src/config.ts (port, corsOrigins)
- /Users/serhiy/dev/github/ziohimself/only-facts/packages/engine/src/routes/health.ts (health pattern)
</read_first>
<action>
**backend/src/routes/health.ts:**
- Export Hono sub-app with GET `/` returning `{ status: "ok" }`

**backend/src/middleware/error.ts:**
- Export `errorHandler` — Hono `onError` handler that catches exceptions and returns `{ success: false, errors: [{ field: "_global", message: "..." }] }`
- In production: generic error message. In development: include error details.

**backend/src/index.ts:**
- Create Hono app
- Apply CORS middleware with `config.corsOrigins` (dynamic origin callback)
- Mount health route at `/health`
- Mount register route at `/api/register`
- Set `onError` to errorHandler
- Call `serve({ fetch: app.fetch, port: config.port })`
- Log startup message
</action>
<acceptance_criteria>
- `backend/src/index.ts` imports and mounts all routes
- CORS uses dynamic origin callback checking against `config.corsOrigins`
- GET /health returns `{ "status": "ok" }` with 200
- Global error handler catches unhandled errors and returns structured JSON (not stack traces in production)
- Server starts on `config.port` (env PORT or 8080)
- `cd backend && npx tsc --noEmit` exits 0
- `cd backend && npm run build` produces `dist/index.js`
</acceptance_criteria>
</task>

</tasks>

<verification>
- `cd backend && npm install` succeeds
- `cd backend && npx tsc --noEmit` exits 0
- `cd backend && npm run build` produces `backend/dist/index.js`
- `docker build -t test-api backend/` builds successfully
- Starting the server locally (`cd backend && npm run dev`) and hitting `GET http://localhost:8080/health` returns `{ "status": "ok" }`
- POST to `/api/register` with missing fields returns 400 with validation errors
- POST with valid data (requires Sheets access) returns 200 with participant ID
</verification>
