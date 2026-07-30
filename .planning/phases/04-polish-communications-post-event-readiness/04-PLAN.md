---
phase: 4
plan_id: "04"
title: "Post-Event Mode — Results Page, Closed Banners & Gallery"
wave: 2
depends_on: ["01", "02"]
files_modified:
  - src/data/event.ts
  - src/hooks/useEventStatus.ts
  - src/app/events/2026-run-for-ukraine/page.tsx
  - src/app/events/2026-run-for-ukraine/page.module.css
  - src/components/ui/EventHero.tsx
  - src/components/ui/EventHero.module.css
  - src/components/ui/TrackCards.tsx
  - src/components/ui/ProgressSection.tsx
  - src/app/events/2026-run-for-ukraine/register/page.tsx
  - src/app/events/2026-run-for-ukraine/register/page.module.css
  - src/app/events/2026-run-for-ukraine/fundraise/page.tsx
  - src/app/events/2026-run-for-ukraine/fundraise/page.module.css
  - src/components/ui/FundraiserPage.tsx
  - src/components/ui/DonorWallForm.tsx
  - src/components/ui/EventGallery.tsx
  - src/components/ui/EventGallery.module.css
  - src/components/ui/AccountabilityReport.tsx
  - src/components/ui/AccountabilityReport.module.css
  - backend/src/routes/gallery.ts
  - backend/src/services/drive.ts
  - backend/src/index.ts
  - backend/src/config.ts
requirements_addressed: []
autonomous: true
---

# Plan 04: Post-Event Mode — Results Page, Closed Banners & Gallery

## Objective

Implement the post-event lifecycle state triggered by `NEXT_PUBLIC_EVENT_STATUS=completed`. The landing page transforms into a results/archive view with final totals, photo gallery, and accountability report. Registration and fundraise pages show "closed" banners. Fundraiser pages disable donations and donor wall submissions.

## Tasks

<task id="04.1">
<title>Create event status hook and extend event data</title>
<read_first>
- src/data/event.ts
- src/app/events/2026-run-for-ukraine/page.tsx
- src/components/ui/ProgressSection.tsx
</read_first>
<action>
1. Create `src/hooks/useEventStatus.ts`:
   - Export `getEventStatus(): "active" | "completed"` (reads `process.env.NEXT_PUBLIC_EVENT_STATUS`, defaults to `"active"`)
   - Export `useEventStatus()` hook (same logic, for client components)
   - Both return the same value; hook version for consistency in `'use client'` components

2. Extend `src/data/event.ts` with post-event content fields:
   - Add `postEvent` object to `eventDetails`: `{ thankYouMessage: string, impactStatement: string, galleryFolderId: string, finalStats: { raised: number, participants: number, donors: number, chargingStations: number } }`
   - Add type `PostEventData` to the exported types
   - Populate with placeholder values (actual values updated at event completion)
</action>
<acceptance_criteria>
- `src/hooks/useEventStatus.ts` exists and exports both `getEventStatus` and `useEventStatus`
- Default return value is `"active"` when env var is not set
- `src/data/event.ts` exports `postEvent` data within `eventDetails`
- TypeScript compiles without errors
</acceptance_criteria>
</task>

<task id="04.2">
<title>Transform landing page for completed mode</title>
<read_first>
- src/hooks/useEventStatus.ts
- src/data/event.ts
- src/app/events/2026-run-for-ukraine/page.tsx
- src/app/events/2026-run-for-ukraine/page.module.css
- src/components/ui/EventHero.tsx
- src/components/ui/EventHero.module.css
- src/components/ui/TrackCards.tsx
- src/locales/en.ts
</read_first>
<action>
1. **page.tsx (landing)**: Import `getEventStatus`. If `completed`:
   - Render results-mode layout: ResultsHero → FinalStats → EventGallery → AccountabilityReport
   - Hide TrackCards entirely
   - ProgressSection shows frozen stats (handled in task 04.4)

2. **EventHero.tsx**: Accept an `isCompleted` prop (or check status internally).
   In completed mode:
   - Change overline to "Event completed · 23 August 2026"
   - Show thank-you message from `eventDetails.postEvent.thankYouMessage`
   - Different styling (celebratory tone)

3. **TrackCards.tsx**: Conditionally render nothing when completed (parent controls this, or component checks `getEventStatus()`)

4. Add corresponding locale keys for completed mode strings in `en.ts`:
   - `"closed.eventCompleted"`, `"closed.thankYou"`, `"closed.viewResults"` etc.
</action>
<acceptance_criteria>
- When `NEXT_PUBLIC_EVENT_STATUS=completed`, landing page shows results layout (no track cards)
- EventHero displays "Event completed" overline and thank-you message in completed mode
- TrackCards are not rendered in completed mode
- When `NEXT_PUBLIC_EVENT_STATUS=active` (or unset), page renders exactly as before (no regression)
- `npm run build` succeeds in both modes
</acceptance_criteria>
</task>

<task id="04.3">
<title>Implement closed banners for register and fundraise pages</title>
<read_first>
- src/hooks/useEventStatus.ts
- src/app/events/2026-run-for-ukraine/register/page.tsx
- src/app/events/2026-run-for-ukraine/register/page.module.css
- src/app/events/2026-run-for-ukraine/fundraise/page.tsx
- src/app/events/2026-run-for-ukraine/fundraise/page.module.css
- src/locales/en.ts
</read_first>
<action>
1. **register/page.tsx**: Import `getEventStatus`. If `completed`:
   - Show a prominent "Registration is closed" banner (styled card with info icon)
   - Hide tier cards and registration form
   - Include link back to results page: "See the event results →" pointing to `/events/2026-run-for-ukraine`
   - Keep breadcrumbs visible

2. **fundraise/page.tsx**: Import `getEventStatus`. If `completed`:
   - Show a prominent "Fundraiser creation is closed" banner
   - Hide the FundraiseForm (3-step wizard component)
   - Include link back to results page
   - Keep breadcrumbs visible

3. Add CSS Module styles for the closed banners (amber/warning style from existing design tokens)

4. Add locale keys: `"closed.registrationClosed"`, `"closed.fundraiseClosed"`, `"closed.seeResults"`
</action>
<acceptance_criteria>
- Register page shows "Registration is closed" banner when `NEXT_PUBLIC_EVENT_STATUS=completed`
- Fundraise page shows "Fundraiser creation is closed" banner when completed
- Both banners include a link to the main event/results page
- Tier cards, registration form, and fundraise wizard are hidden when completed
- Breadcrumbs still render on both pages
- Pages render normally when status is `active`
- Closed banners use project design tokens (amber/warning palette)
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="04.4">
<title>Freeze progress stats and disable fundraiser interactions</title>
<read_first>
- src/hooks/useEventStatus.ts
- src/data/event.ts
- src/components/ui/ProgressSection.tsx
- src/components/ui/FundraiserPage.tsx
- src/components/ui/DonorWallForm.tsx
- src/locales/en.ts
</read_first>
<action>
1. **ProgressSection.tsx**: Check `useEventStatus()`. If `completed`:
   - Display frozen final values from `eventDetails.postEvent.finalStats` instead of polling API
   - Remove "Updated live" indicator, replace with "Final results"
   - Do NOT start the polling interval
   - Show the same stat cards layout but with static values

2. **FundraiserPage.tsx**: Check `useEventStatus()`. If `completed`:
   - Remove `<WhyDonateWidget>` — replace with a styled "Donations are closed" message
   - Keep fundraiser details (name, photo, message, goal) visible as permanent record
   - Keep `<DonorWall>` visible (existing entries shown) but without the form
   - Keep `<SocialShareButtons>` visible (sharing the archived page is fine)

3. **DonorWallForm.tsx**: Check `useEventStatus()`. If `completed`:
   - Return null (don't render the form or gate button)
   - Parent (FundraiserPage) also conditionally excludes it, but self-check is defense-in-depth

4. Add locale keys: `"closed.donationsClosed"`, `"closed.finalResults"`, `"progress.finalResults"`
</action>
<acceptance_criteria>
- ProgressSection shows frozen values from `eventDetails.postEvent.finalStats` when completed (no API calls)
- "Updated live" indicator replaced with "Final results" when completed
- FundraiserPage hides WhyDonateWidget and shows "Donations are closed" message when completed
- DonorWallForm is not rendered when completed
- Existing donor wall entries remain visible on fundraiser pages
- Fundraiser page still shows name, photo, message, goal as permanent record
- All components work normally when status is `active`
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="04.5">
<title>Backend gallery endpoint — List photos from Drive folder</title>
<read_first>
- backend/src/services/drive.ts
- backend/src/config.ts
- backend/src/index.ts
- backend/src/routes/progress.ts
</read_first>
<action>
1. **backend/src/config.ts**: Add `galleryFolderId: process.env.GALLERY_FOLDER_ID ?? ""`
   (separate from the fundraiser photos folder)

2. **backend/src/services/drive.ts**: Add method `listGalleryPhotos(folderId: string)`:
   - Uses `drive.files.list` with `q: "'${folderId}' in parents and mimeType contains 'image/'"` 
   - Returns array of `{ id: string, name: string, url: string }` 
   - URL format: `https://drive.google.com/uc?id=${fileId}&export=view`
   - Orders by name (for consistent gallery ordering)
   - Limits to 50 photos max

3. **backend/src/routes/gallery.ts**: Create new route file:
   - `GET /` → lists gallery photos from configured folder
   - Returns `{ success: true, data: { photos: [...] } }`
   - If gallery folder not configured, returns empty array (graceful degradation)
   - Cache-Control: `public, max-age=3600` (photos don't change often)

4. **backend/src/index.ts**: Mount `galleryRoute` at `/api/gallery`
</action>
<acceptance_criteria>
- `backend/src/routes/gallery.ts` exists with GET handler
- `DriveService` has `listGalleryPhotos()` method
- `config.ts` includes `galleryFolderId` from env var
- Gallery route mounted at `/api/gallery` in index.ts
- Returns empty photos array gracefully when folder ID is not configured
- Backend compiles: `cd backend && npx tsc --noEmit`
</acceptance_criteria>
</task>

<task id="04.6">
<title>Frontend gallery and accountability report components</title>
<read_first>
- src/hooks/useEventStatus.ts
- src/data/event.ts
- src/app/events/2026-run-for-ukraine/page.tsx
- src/styles/tokens.css
- src/components/ui/ProgressSection.tsx
- src/locales/en.ts
</read_first>
<action>
1. **src/components/ui/EventGallery.tsx** (`'use client'`):
   - Fetches from `${apiUrl}/api/gallery` on mount
   - Renders responsive CSS Grid (3 cols desktop, 2 tablet, 1 mobile)
   - Each photo: `<img src={photo.url} alt={photo.name} loading="lazy" />`
   - Shows nothing if no photos returned (graceful)
   - Heading: `t("closed.galleryHeading")` (e.g., "Event Photos")

2. **src/components/ui/EventGallery.module.css**:
   - Grid layout using CSS Modules
   - Responsive with container query or media queries
   - Images: `object-fit: cover`, rounded corners, subtle shadow

3. **src/components/ui/AccountabilityReport.tsx**:
   - Server component (reads from `eventDetails.postEvent`)
   - Sections: total raised, charging stations funded, how funds reached Hurkit
   - Uses `t()` for all headings and descriptive text
   - Simple card layout with key metrics highlighted

4. **src/components/ui/AccountabilityReport.module.css**:
   - Card-based layout, uses existing design tokens
   - Highlight numbers with `--color-amber-*` accent

5. Integrate both into landing page's completed-mode layout (from task 04.2)

6. Add locale keys: `"closed.galleryHeading"`, `"closed.accountabilityHeading"`, `"closed.totalRaised"`, `"closed.chargingStations"`, `"closed.impactStatement"`
</action>
<acceptance_criteria>
- `EventGallery.tsx` and `EventGallery.module.css` exist
- Gallery fetches from `/api/gallery` and renders photos in responsive grid
- Gallery renders nothing (not an error state) when no photos are available
- `AccountabilityReport.tsx` and `AccountabilityReport.module.css` exist
- Accountability report shows impact metrics from `eventDetails.postEvent`
- Both components are rendered on the landing page only in completed mode
- Images use `loading="lazy"` for performance
- CSS uses project design tokens (no arbitrary colors)
- `npm run build` succeeds
</acceptance_criteria>
</task>

## Verification

```bash
# Frontend builds in both modes
NEXT_PUBLIC_EVENT_STATUS=active npm run build
NEXT_PUBLIC_EVENT_STATUS=completed npm run build

# Backend compiles
cd backend && npx tsc --noEmit
```

## must_haves

- `NEXT_PUBLIC_EVENT_STATUS=completed` triggers post-event mode (D-07)
- Landing page transforms to results view with final totals, gallery, accountability report (D-08, D-09)
- Gallery fetches from Google Drive folder (D-10)
- Fundraiser pages accessible but donations/commenting disabled (D-11)
- Register page shows "closed" banner (D-12)
- Fundraise page shows "closed" banner (D-13)
- Progress section freezes at final values, no API polling (D-14)
- Events list unchanged (D-15)
