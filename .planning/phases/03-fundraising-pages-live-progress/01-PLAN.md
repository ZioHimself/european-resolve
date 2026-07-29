---
plan_id: "01"
title: "Backend: Fundraiser CRUD, Photo Upload, Progress & Donor Wall APIs"
phase: 3
wave: 1
depends_on: []
files_modified:
  - backend/src/types.ts
  - backend/src/config.ts
  - backend/src/index.ts
  - backend/src/services/sheets.ts
  - backend/src/services/drive.ts
  - backend/src/routes/fundraiser.ts
  - backend/src/routes/progress.ts
  - backend/src/routes/donors.ts
  - backend/package.json
autonomous: true
requirements_addressed: [API-03, API-04, API-05, API-06, API-07, API-08, API-09, FUND-01, FUND-02, FUND-03, FUND-04]
---

# Plan 01: Backend — Fundraiser CRUD, Photo Upload, Progress & Donor Wall APIs

<objective>
Extend the Hono backend with all Phase 3 API endpoints: fundraiser create/read/edit, photo upload to Google Drive, progress stats from Sheets, and donor wall CRUD. Adds "Fundraisers" and "Donor Wall" tabs to the Google Sheets schema. After this plan, the backend serves all data needs for fundraiser pages and the live progress dashboard.
</objective>

<must_haves>
- POST /api/fundraiser creates a fundraiser row in Sheets, generates slug + edit token, returns shareable URL
- GET /api/fundraiser/:slug reads fundraiser data from Sheets, returns name/photo/message/goal/status
- PUT /api/fundraiser/:slug updates fundraiser data (requires edit token in Authorization header)
- Photo upload via multipart form data, resized to 400x400 WebP, stored in Google Drive, file ID saved in Sheets
- GET /api/progress returns totalRaisedEur, goalEur, goalPercent, participantCount from confirmed payments in Sheets
- POST /api/donors adds a donor wall entry (name + message + fundraiser slug) to "Donor Wall" tab
- GET /api/donors/:slug reads donor wall entries for a fundraiser slug
- Slugs auto-generated from display name with collision handling (append -2, -3, etc.)
- Edit token is a crypto-random string returned at creation time (secret edit link)
- Draft/publish status stored in Sheets — draft pages accessible by URL but not listed publicly

<truths>
- D-01: Client-side React routes — backend provides data API only
- D-03: Photos stored in Google Drive folder via existing service account
- D-04: Backend resizes to ~400x400 WebP before upload
- D-05: Drive file ID stored in fundraiser row, public URL constructed from file ID
- D-06: Slugs auto-generated from display name, collisions handled by appending number
- D-07: Unique edit token generated at creation, returned to creator
- D-08: Pages start as drafts, accessible by URL but show draft banner
- D-09: Publish via edit link, simple toggle
- D-10: Donor wall entries available after donation (honour system)
- D-11: Name and message required for wall entries
- D-12: Basic validation — required fields, character limits, rate limiting
- D-13: Donor wall in dedicated "Donor Wall" tab linked by fundraiser slug
- D-14: Progress from Sheets — sum confirmed payments EUR, participant count, goal from config
- D-17: New "Fundraisers" tab: slug, display_name, message, goal_eur, photo_file_id, edit_token, status, created_at
- D-18: New "Donor Wall" tab: fundraiser_slug, donor_name, message, created_at
</truths>
</must_haves>

<tasks>

<task id="01.1">
<title>Add fundraiser and donor wall types</title>
<read_first>
- backend/src/types.ts (existing types: RegisterRequest, ApiResponse pattern)
- .planning/phases/03-fundraising-pages-live-progress/03-CONTEXT.md (D-17, D-18 schema)
</read_first>
<action>
Extend `backend/src/types.ts` with:

**FundraiserCreateRequest:** `displayName: string`, `message: string`, `goalEur: number`
(photo is sent separately as multipart — not in this type)

**FundraiserResponse:** `slug: string`, `displayName: string`, `message: string`, `goalEur: number`, `photoUrl: string | null`, `status: 'draft' | 'published'`, `createdAt: string`, `editToken?: string` (only returned on create/edit)

**FundraiserUpdateRequest:** `displayName?: string`, `message?: string`, `goalEur?: number`, `status?: 'draft' | 'published'`

**ProgressResponse:** `totalRaisedEur: number`, `goalEur: number`, `goalPercent: number`, `participantCount: number`, `donorCount: number`

**DonorWallEntry:** `fundraiserSlug: string`, `donorName: string`, `message: string`, `createdAt: string`

**DonorWallRequest:** `fundraiserSlug: string`, `donorName: string`, `message: string`
</action>
<acceptance_criteria>
- `backend/src/types.ts` exports `FundraiserCreateRequest`, `FundraiserResponse`, `FundraiserUpdateRequest`, `ProgressResponse`, `DonorWallEntry`, `DonorWallRequest`
- All types use consistent naming (camelCase fields)
- `FundraiserResponse.status` is a union `'draft' | 'published'`
- `npx tsc --noEmit` passes in backend/
</acceptance_criteria>
</task>

<task id="01.2">
<title>Add Google Drive config and dependency</title>
<read_first>
- backend/src/config.ts (existing config pattern: Object.freeze, env vars)
- backend/package.json (existing dependencies)
</read_first>
<action>
**backend/src/config.ts:** Add `googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? ""` to the frozen config. Add production validation: throw if `googleDriveFolderId` is empty in production.

**backend/package.json:** Add `sharp` to dependencies (for image resizing to 400x400 WebP).

**backend/.env.example:** Add `GOOGLE_DRIVE_FOLDER_ID=` entry.
</action>
<acceptance_criteria>
- `config.googleDriveFolderId` reads from `GOOGLE_DRIVE_FOLDER_ID` env var
- Production mode throws if `googleDriveFolderId` is empty
- `sharp` is listed in `backend/package.json` dependencies
- `backend/.env.example` contains `GOOGLE_DRIVE_FOLDER_ID=`
</acceptance_criteria>
</task>

<task id="01.3">
<title>Create Google Drive service for photo upload</title>
<read_first>
- backend/src/services/sheets.ts (GoogleAuth pattern, scopes, constructor)
- backend/src/config.ts (googleDriveFolderId)
</read_first>
<action>
Create `backend/src/services/drive.ts`:

Export class `DriveService` with:
- `constructor()` — creates GoogleAuth with drive.file scope, creates drive client (v3)
- `async uploadPhoto(buffer: Buffer, filename: string): Promise<string>` — resizes image to 400x400 using sharp, converts to WebP, uploads to Google Drive folder (`config.googleDriveFolderId`), sets file permission to "anyone can view", returns the file ID
- `getPhotoUrl(fileId: string): string` — returns `https://drive.google.com/uc?id=${fileId}&export=view` (public direct link)

GoogleAuth scopes: `https://www.googleapis.com/auth/drive.file` (allows creating files in folders shared with the service account).
</action>
<acceptance_criteria>
- `backend/src/services/drive.ts` exports `DriveService` class
- `uploadPhoto` uses sharp to resize to 400x400 and convert to WebP format
- `uploadPhoto` uploads to the folder specified by `config.googleDriveFolderId`
- `uploadPhoto` sets file permission to `{ role: 'reader', type: 'anyone' }`
- `getPhotoUrl` returns a direct viewable URL using the file ID
- Auth uses `new google.auth.GoogleAuth({ scopes })` (ADC, no keyFile)
- `npx tsc --noEmit` passes
</acceptance_criteria>
</task>

<task id="01.4">
<title>Extend SheetsService with fundraiser and donor wall methods</title>
<read_first>
- backend/src/services/sheets.ts (existing SheetsService: findByEmail, appendRegistration, confirmPayment patterns)
- backend/src/types.ts (new fundraiser and donor wall types)
- .planning/phases/03-fundraising-pages-live-progress/03-CONTEXT.md (D-06 slug generation, D-17 Fundraisers tab, D-18 Donor Wall tab)
</read_first>
<action>
Extend `SheetsService` in `backend/src/services/sheets.ts` with new constants and methods:

**Constants:** `FUNDRAISER_SHEET = "Fundraisers"`, `DONOR_WALL_SHEET = "Donor Wall"`

**Fundraiser methods:**
- `generateSlug(displayName: string): Promise<string>` — converts name to lowercase, replaces spaces/special chars with hyphens, checks for collisions in Fundraisers tab, appends -2/-3 etc. if needed
- `createFundraiser(data: FundraiserCreateRequest, photoFileId: string | null): Promise<{ slug: string; editToken: string }>` — generates slug and edit token (randomBytes(8).toString('hex')), appends row to Fundraisers tab with columns: slug, display_name, message, goal_eur, photo_file_id, edit_token, status='draft', created_at
- `getFundraiser(slug: string): Promise<FundraiserRow | null>` — reads Fundraisers tab, finds row by slug column
- `updateFundraiser(slug: string, editToken: string, updates: Partial<FundraiserUpdateRequest>, photoFileId?: string): Promise<boolean>` — validates edit token, updates matching row fields
- `listPublishedFundraisers(): Promise<FundraiserRow[]>` — returns all rows with status='published'

**Progress methods:**
- `getProgress(): Promise<{ totalRaisedEur: number; participantCount: number; donorCount: number }>` — reads Registrations tab, sums column O (paid_amount) where column N (payment_status) = 'paid', counts total rows for participants, counts unique donors from Donor Wall tab

**Donor wall methods:**
- `addDonorWallEntry(slug: string, name: string, message: string): Promise<void>` — appends row to Donor Wall tab with columns: fundraiser_slug, donor_name, message, created_at
- `getDonorWallEntries(slug: string): Promise<DonorWallEntry[]>` — reads Donor Wall tab, filters by fundraiser_slug column, returns entries sorted by created_at descending
</action>
<acceptance_criteria>
- `generateSlug('Maria K')` returns `'maria-k'`; if `maria-k` exists, returns `'maria-k-2'`
- `createFundraiser` appends 8-column row to Fundraisers tab and returns slug + edit token
- `getFundraiser` finds row by slug column (column A) and returns typed object or null
- `updateFundraiser` rejects if edit token doesn't match; updates only provided fields
- `getProgress` sums paid amounts from Registrations tab column O where column N = 'paid'
- `addDonorWallEntry` appends 4-column row to Donor Wall tab
- `getDonorWallEntries` returns entries filtered by slug, newest first
- `npx tsc --noEmit` passes
</acceptance_criteria>
</task>

<task id="01.5">
<title>Create fundraiser route with create, read, and update endpoints</title>
<read_first>
- backend/src/routes/register.ts (existing route pattern: Hono sub-app, validation function, ApiResponse usage)
- backend/src/services/sheets.ts (fundraiser methods)
- backend/src/services/drive.ts (photo upload)
- backend/src/types.ts (FundraiserCreateRequest, FundraiserResponse, FundraiserUpdateRequest)
</read_first>
<action>
Create `backend/src/routes/fundraiser.ts`:

Export a Hono sub-app with three routes:

**POST `/` (create fundraiser):**
1. Parse multipart form data (display name, message, goal, optional photo file)
2. Validate: displayName required (2-50 chars), message required (max 500 chars), goalEur required (positive integer, min 10, max 100000)
3. If photo: validate file type (jpeg/png/webp), max 5MB, upload via DriveService
4. Create fundraiser via SheetsService, get slug + edit token
5. Return 201 with FundraiserResponse including editToken and shareable URL

**GET `/:slug` (read fundraiser):**
1. Read slug from URL param
2. Call SheetsService.getFundraiser(slug)
3. If not found: return 404
4. Return FundraiserResponse (without editToken)
5. Construct photoUrl from file ID via DriveService.getPhotoUrl if photo_file_id exists

**PUT `/:slug` (update fundraiser):**
1. Read slug from URL param and edit token from Authorization header (Bearer token)
2. Parse multipart form data (optional: displayName, message, goalEur, status, photo)
3. If photo: upload via DriveService
4. Call SheetsService.updateFundraiser with token validation
5. If token invalid: return 403
6. Return updated FundraiserResponse
</action>
<acceptance_criteria>
- POST `/` with valid data returns 201 with slug, editToken, and all fundraiser fields
- POST `/` with missing displayName returns 400 with validation error
- POST `/` with photo > 5MB returns 400 with file size error
- GET `/:slug` with existing slug returns 200 with fundraiser data (no editToken)
- GET `/:slug` with nonexistent slug returns 404
- PUT `/:slug` with valid edit token returns 200 with updated data
- PUT `/:slug` with invalid/missing token returns 403
- PUT `/:slug` with `{ status: 'published' }` changes fundraiser status to published
- `npx tsc --noEmit` passes
</acceptance_criteria>
</task>

<task id="01.6">
<title>Create progress route</title>
<read_first>
- backend/src/routes/health.ts (simple GET route pattern)
- backend/src/services/sheets.ts (getProgress method)
- backend/src/types.ts (ProgressResponse)
- src/data/event.ts (goalEur: 3000)
</read_first>
<action>
Create `backend/src/routes/progress.ts`:

Export a Hono sub-app with one route:

**GET `/` (progress stats):**
1. Call SheetsService.getProgress()
2. Calculate goalPercent: Math.min(100, Math.round((totalRaisedEur / goalEur) * 100))
3. goalEur is hardcoded to match `eventDetails.goalEur` (3000) or read from env var `GOAL_EUR`
4. Return ProgressResponse with totalRaisedEur, goalEur, goalPercent, participantCount, donorCount

Add `goalEur` to config.ts: `goalEur: Number(process.env.GOAL_EUR) || 3000`

Response should include cache headers: `Cache-Control: public, max-age=30` (30-second freshness for polling)
</action>
<acceptance_criteria>
- GET `/` returns 200 with `{ success: true, data: { totalRaisedEur, goalEur, goalPercent, participantCount, donorCount } }`
- `goalPercent` is capped at 100 and rounded to nearest integer
- Response includes `Cache-Control: public, max-age=30` header
- `config.goalEur` reads from `GOAL_EUR` env var with default 3000
- `npx tsc --noEmit` passes
</acceptance_criteria>
</task>

<task id="01.7">
<title>Create donor wall route</title>
<read_first>
- backend/src/routes/register.ts (validation pattern)
- backend/src/services/sheets.ts (addDonorWallEntry, getDonorWallEntries)
- backend/src/types.ts (DonorWallEntry, DonorWallRequest)
</read_first>
<action>
Create `backend/src/routes/donors.ts`:

Export a Hono sub-app with two routes:

**POST `/` (add donor wall entry):**
1. Parse JSON body
2. Validate: fundraiserSlug required, donorName required (2-50 chars), message required (5-200 chars)
3. Verify fundraiser exists via SheetsService.getFundraiser(slug) — return 404 if not found
4. Call SheetsService.addDonorWallEntry
5. Return 201 with the created entry

**GET `/:slug` (read donor wall for fundraiser):**
1. Read slug from URL param
2. Call SheetsService.getDonorWallEntries(slug)
3. Return array of DonorWallEntry objects
</action>
<acceptance_criteria>
- POST `/` with valid data returns 201 with created donor wall entry
- POST `/` with missing donorName returns 400 with validation error
- POST `/` with nonexistent fundraiserSlug returns 404
- GET `/:slug` returns array of donor wall entries for the given slug, newest first
- GET `/:slug` for a slug with no entries returns empty array (not 404)
- `npx tsc --noEmit` passes
</acceptance_criteria>
</task>

<task id="01.8">
<title>Mount new routes in Hono app</title>
<read_first>
- backend/src/index.ts (existing route mounting pattern: app.route())
- backend/src/routes/fundraiser.ts
- backend/src/routes/progress.ts
- backend/src/routes/donors.ts
</read_first>
<action>
Update `backend/src/index.ts`:
- Import `fundraiserRoute` from `./routes/fundraiser.js`
- Import `progressRoute` from `./routes/progress.js`
- Import `donorsRoute` from `./routes/donors.js`
- Mount: `app.route("/api/fundraiser", fundraiserRoute)`
- Mount: `app.route("/api/progress", progressRoute)`
- Mount: `app.route("/api/donors", donorsRoute)`
- Add GET to CORS allowMethods (already present, verify)
- Add PUT to CORS allowMethods
- Add Authorization to CORS allowHeaders (for edit token)
</action>
<acceptance_criteria>
- `backend/src/index.ts` imports and mounts all three new route modules
- CORS allowMethods includes `PUT`
- CORS allowHeaders includes `Authorization`
- All routes are under `/api/` prefix (covered by existing CORS middleware)
- `cd backend && npx tsc --noEmit` exits 0
- `cd backend && npm run build` produces dist/ without errors
</acceptance_criteria>
</task>

</tasks>

<verification>
- `cd backend && npm install` succeeds
- `cd backend && npx tsc --noEmit` exits 0
- `cd backend && npm run build` produces `backend/dist/index.js`
- Starting the server locally and hitting `GET /api/progress` returns progress JSON with totalRaisedEur, goalEur, goalPercent, participantCount, donorCount
- POST to `/api/fundraiser` with form data creates a fundraiser and returns slug + editToken
- GET `/api/fundraiser/{slug}` returns fundraiser data without editToken
- PUT `/api/fundraiser/{slug}` with correct Bearer token updates fundraiser fields
- PUT `/api/fundraiser/{slug}` with wrong token returns 403
- POST to `/api/donors` with valid data returns 201
- GET `/api/donors/{slug}` returns array of wall entries
</verification>
