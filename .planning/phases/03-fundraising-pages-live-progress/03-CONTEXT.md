# Phase 3: Fundraising Pages & Live Progress - Context

**Gathered:** 2026-07-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can create personal fundraising pages (Track B) with a display name, photo, personal message, and fundraising goal. Pages are served as client-side React routes with a fixed layout — data fetched dynamically from the backend API by slug. Visitors can view any published fundraiser page, donate via the embedded WhyDonate widget, and leave a name + message on the donor wall after donating. The progress dashboard on the event landing page goes live with real data (confirmed payments summed from Google Sheets, participant count, goal percentage). Social sharing buttons on fundraiser pages generate correct share URLs. A draft/publish flow lets fundraisers preview before going public.

</domain>

<decisions>
## Implementation Decisions

### Fundraiser Page Delivery
- **D-01:** Fundraiser pages are client-side React routes with a fixed layout. The page structure is identical for all fundraisers — only the data values (name, photo, message, goal, stats) change. Data is fetched from the backend API by slug.
- **D-02:** No backend rendering or server-side pages needed. The static site (`output: "export"`) serves a single fundraiser page shell; React hydrates and fetches data client-side.

### Photo Upload & Storage
- **D-03:** Fundraiser profile photos are stored in a Google Drive folder. The existing service account (already authenticated for Google Sheets) uploads files to a shared Drive folder.
- **D-04:** Backend resizes photos to ~400×400 and converts to WebP before uploading to Drive. This ensures consistent file sizes and fast page loads.
- **D-05:** The Google Drive file ID is stored in the fundraiser's row in Google Sheets. The public serving URL is constructed from the file ID.

### Fundraiser Slug & Identity
- **D-06:** Slugs are auto-generated from the display name (e.g., "Maria K" → `maria-k`). Backend handles collisions by appending a number (e.g., `maria-k-2`).
- **D-07:** A unique edit token is generated at fundraiser creation time and returned to the creator. This token serves as the secret edit link — anyone with the token can edit the page. No user accounts needed.

### Draft/Publish Flow
- **D-08:** Fundraiser pages start as drafts. Draft pages are accessible via their direct URL but display a "draft" banner and do not appear in public listings.
- **D-09:** The fundraiser publishes their page via the edit link (using their edit token). Publishing is a simple toggle — no moderation queue.

### Donor Wall
- **D-10:** Donor wall entries are only available after a donation. After completing payment via the WhyDonate widget on a fundraiser page, an honour-system "I've donated" button appears. Clicking it reveals the wall form.
- **D-11:** Both name and message are required for a donor wall entry. No anonymous posting.
- **D-12:** Spam prevention is basic validation only — required fields, character limits, and API rate limiting. Sufficient for a small charity event.
- **D-13:** Donor wall entries are stored in a dedicated "Donor Wall" tab in Google Sheets, linked to the fundraiser slug.

### Progress Dashboard
- **D-14:** Progress data comes from Google Sheets — sum of confirmed (paid) registration amounts in EUR, participant count from registrations, goal from event config. Carries forward from Phase 02.1 decisions D-10/D-11.
- **D-15:** The existing `ProgressSection.tsx` placeholder is activated with live data from a `GET /api/progress` endpoint. Auto-refresh via polling.

### WhyDonate on Fundraiser Pages
- **D-16:** Fundraiser pages embed the WhyDonate widget for donations, same pattern as the registration confirmation panel. Carries forward from Phase 02.1 decision D-13.

### Google Sheets Schema Additions
- **D-17:** New "Fundraisers" tab for fundraiser page data (slug, display name, message, goal, photo file ID, edit token, status draft/published, created_at). Carries forward from Phase 2 decision D-08.
- **D-18:** New "Donor Wall" tab for wall entries (fundraiser slug, donor name, message, created_at).

### Claude's Discretion
- Client-side routing: query parameter approach (`/fundraiser?by=mariia-k`) — single static page, ID read via `useSearchParams().get('by')`
- Google Drive folder structure and sharing permissions setup
- Photo upload API request/response shape (multipart form or base64)
- Fundraiser form validation rules (name length, message length, goal range)
- Social sharing URL construction per platform (WhatsApp, LinkedIn, Facebook, X, Email, Copy link)
- Progress dashboard polling interval and caching strategy
- Edit page UX (inline editing vs separate edit form)
- Exact "draft" banner design and placement
- Donor wall display order (newest first vs oldest first)
- How the "I've donated" honour-system button integrates with the WhyDonate widget flow

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture
- `.planning/PROJECT.md` — project overview, constraints, donation model
- `.planning/REQUIREMENTS.md` — v1 requirements (Phase 3: FUND-01–05, PAGE-01–06, DASH-01–05, EVNT-02, API-03–09)
- `.planning/ROADMAP.md` — Phase 3 success criteria (9 items)

### Prior Phase Context (decisions carried forward)
- `.planning/phases/02-backend-api-registration/02-CONTEXT.md` — Backend structure (Hono, Cloud Run, Sheets schema), participant ID format, D-08 (Sheets tabs in Phase 3)
- `.planning/phases/02.1-replace-monobank-jar-with-whydonate/02.1-CONTEXT.md` — WhyDonate integration model, payment confirmation flow, D-10/D-11 (Sheets as progress source, EUR), D-13 (WhyDonate on fundraiser pages), D-14 (manual campaign management)

### WhyDonate Integration
- WhyDonate helpdesk: `https://helpdesk.whydonate.com/en/article/how-to-add-a-donate-button-html-script-from-the-campaign-page-lfd7k3/`
- WhyDonate donate button: `https://whydonate.com/donate-button-website/`

### Existing Frontend Code (to be activated/extended)
- `src/components/ui/FundraiseForm.tsx` — Current preview form (disabled fields, "coming soon" banner — activate like Phase 2 registration)
- `src/components/ui/ProgressSection.tsx` — Placeholder with static zeros (connect to live API)
- `src/components/ui/ConfirmationPanel.tsx` — WhyDonate widget embedding pattern (reuse for fundraiser page donations)
- `src/components/ui/WhyDonateWidget.tsx` — Existing WhyDonate widget component

### Existing Backend Code (to be extended)
- `backend/src/index.ts` — Hono app with route mounting pattern
- `backend/src/services/sheets.ts` — Google Sheets service (auth pattern, read/write, row structure)
- `backend/src/config.ts` — Typed config from env vars (add Google Drive folder ID)
- `backend/src/types.ts` — API types (add fundraiser + donor wall types)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FundraiseForm.tsx`: Preview form with fields (display name, message, goal) + photo upload placeholder + shareable link preview + save draft / publish buttons. Needs activation (remove readOnly/disabled, add `'use client'`, wire to API)
- `ProgressSection.tsx`: Stat cards (Raised, Goal, Participants, Donors) + progress bar. Needs client-side data fetching from `/api/progress`
- `WhyDonateWidget.tsx`: Existing widget component with shortcode prop — reuse on fundraiser pages
- `ConfirmationPanel.tsx`: Shows honour-system "I've completed my donation" button pattern — reference for donor wall reveal flow
- `ShareableLinkPreview.tsx`: Existing preview component in fundraise form — update with real generated slug

### Established Patterns
- CSS Modules with camelCase class names — all new components follow this
- `'use client'` for interactive components (forms, widgets, data fetching)
- Backend uses Hono framework with typed routes, Google Sheets service
- Service account auth for Google APIs (Sheets — extend to Drive)
- `ApiResponse<T>` envelope for all API responses
- Payment token pattern for secure actions (reuse for edit tokens)

### Integration Points
- New backend endpoints: `POST /api/fundraiser` (create), `GET /api/fundraiser/:slug` (read), `PUT /api/fundraiser/:slug` (edit with token), `GET /api/progress` (dashboard stats), `POST /api/donors` (add wall entry), `GET /api/donors/:slug` (read wall)
- New frontend route: `/events/2026-run-for-ukraine/fundraiser/[slug]` (client-side, fetches data)
- Activate `FundraiseForm.tsx` (same activation pattern as Phase 2 registration form)
- Activate `ProgressSection.tsx` (add polling, connect to API)
- New env vars: `GOOGLE_DRIVE_FOLDER_ID` (for photo uploads)
- Google Sheets: add "Fundraisers" and "Donor Wall" tabs

</code_context>

<specifics>
## Specific Ideas

- Fundraiser photo upload follows the same UX as the existing preview form's photo placeholder — user clicks the photo area to upload
- The "I've donated" button on fundraiser pages should appear below the WhyDonate widget, similar to how "I've completed my donation" works on the registration confirmation panel
- Donor wall entries are tied to the fundraiser page slug, not to a specific donation amount (honour system)
- Draft fundraiser pages show a visual banner like the Phase 1 preview banners ("This page is a draft — only you can see it")

</specifics>

<deferred>
## Deferred Ideas

- **Zapier integration for donation verification** — Could add server-side verification of WhyDonate donations via Zapier triggers. Not needed for v1 honour-system approach.
- **WhyDonate progress widget** — WhyDonate's own campaign widget can show progress. Custom Sheets-based dashboard is simpler and more controllable.
- **Recurring donations** — WhyDonate supports recurring donations. Out of scope for the charity run event.
- **Per-fundraiser donation totals** — WhyDonate shared jar provides only aggregate balance. Per-fundraiser attribution would require individual campaigns or Zapier integration.

</deferred>

---

*Phase: 3-Fundraising Pages & Live Progress*
*Context gathered: 2026-07-29*
