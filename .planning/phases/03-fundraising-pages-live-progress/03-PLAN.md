---
plan_id: "03"
title: "Frontend: Progress Dashboard Live Data & Social Sharing"
phase: 3
wave: 2
depends_on: ["01"]
files_modified:
  - src/components/ui/ProgressSection.tsx
  - src/components/ui/ProgressSection.module.css
  - src/components/ui/SocialShareButtons.tsx
  - src/components/ui/SocialShareButtons.module.css
  - src/components/ui/FundraiserPage.tsx
autonomous: true
requirements_addressed: [EVNT-02, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, PAGE-03, PAGE-04, FUND-05]
---

# Plan 03: Frontend — Progress Dashboard Live Data & Social Sharing

<objective>
Activate the ProgressSection placeholder with live data from the backend progress API (polling every 30 seconds). Create social sharing buttons for fundraiser pages. Both features connect to existing UI shells — ProgressSection already renders stat cards and a progress bar, and the fundraiser page layout has a placeholder for sharing.
</objective>

<must_haves>
- ProgressSection fetches from GET /api/progress on mount and polls every 30 seconds
- Stat cards show live values: Raised (€X), Goal (X%), Participants (N), Donors (N)
- Progress bar width reflects goalPercent from API
- Bar labels show "€X raised · Goal €Y" and "X%"
- Cause description with link to Hurkit and WhyDonate campaign visible on event page
- Social sharing buttons on fundraiser pages for WhatsApp, LinkedIn, Facebook, X, Email, Copy link
- Share URLs include the fundraiser's shareable URL and a pre-filled message
- Stats auto-refresh without page reload

<truths>
- D-14: Progress from Sheets — sum confirmed payments EUR, participant count, goal from config
- D-15: Existing ProgressSection activated with live data from GET /api/progress, polling
- D-16: WhyDonate widget on fundraiser pages (already embedded in Plan 02)
- DASH-04: Cause description with link to beneficiary and WhyDonate campaign
</truths>
</must_haves>

<tasks>

<task id="03.1">
<title>Activate ProgressSection with live data fetching</title>
<read_first>
- src/components/ui/ProgressSection.tsx (current static placeholder with hardcoded zeros)
- src/components/ui/ProgressSection.module.css (existing styles for stat cards and progress bar)
- src/data/event.ts (eventDetails.goalEur = 3000, beneficiary info)
</read_first>
<action>
Transform `ProgressSection.tsx` into a client component:

1. Add `'use client'` directive
2. Add state: `progress` (ProgressData | null), `loading` (boolean)
3. Define `ProgressData` type locally: `{ totalRaisedEur: number; goalEur: number; goalPercent: number; participantCount: number; donorCount: number }`
4. On mount (`useEffect`): fetch GET `${NEXT_PUBLIC_API_URL}/api/progress`
5. Set up polling interval: `setInterval(() => fetch(...)`, 30_000)
6. Clean up interval on unmount
7. Replace static "—" and "0" values with live data:
   - "Raised" → `€${progress.totalRaisedEur.toLocaleString('en-GB')}`
   - "Goal" → `${progress.goalPercent}%`
   - "Participants" → `${progress.participantCount}`
   - "Donors" → `${progress.donorCount}`
8. Update progress bar: `style={{ width: `${progress.goalPercent}%` }}`
9. Update `aria-valuenow` to `progress.goalPercent`
10. Update bar labels: `€${totalRaisedEur.toLocaleString('en-GB')} raised · Goal €${goalEur.toLocaleString('en-GB')}` and `${goalPercent}%`
11. While loading (first fetch): show skeleton/dash placeholders (current state)
12. On fetch error: gracefully keep last known values or show dashes

Keep the "Updated live" indicator. Optionally add a subtle pulse/fade animation when data refreshes.
</action>
<acceptance_criteria>
- `ProgressSection.tsx` starts with `'use client'`
- Component fetches from `${NEXT_PUBLIC_API_URL}/api/progress` on mount
- Polling interval is set to 30 seconds
- Interval is cleaned up on unmount (no memory leak)
- Stat cards display live values from API response
- Progress bar width matches `goalPercent` from API
- Bar labels show formatted currency and percentage
- Initial load shows placeholder dashes (graceful loading state)
- API fetch failure does not crash the component
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="03.2">
<title>Add cause description section to event page</title>
<read_first>
- src/app/events/2026-run-for-ukraine/page.tsx (event page structure)
- src/app/events/2026-run-for-ukraine/page.module.css (page styles)
- src/data/event.ts (eventDetails.beneficiary — name, mission, url)
</read_first>
<action>
Add a cause description section to the event page, positioned after ProgressSection and before TrackCards. This fulfills DASH-04:

1. Add a paragraph or small section that describes where donations go
2. Include link to Hurkit (eventDetails.beneficiary.url) and WhyDonate campaign page
3. Text like: "All donations go directly to {beneficiary.name} — {beneficiary.mission}. Donate via our WhyDonate campaign."
4. Style with existing design tokens, keep it concise and informative
5. WhyDonate campaign link from env var `NEXT_PUBLIC_WHYDONATE_CAMPAIGN_URL` or hardcoded campaign URL

Add styles to `page.module.css` for the cause section.
</action>
<acceptance_criteria>
- Event page shows cause description between progress and track cards
- Hurkit link opens `eventDetails.beneficiary.url` in new tab
- WhyDonate campaign link is present
- Text is concise and uses existing typography tokens
- `npm run build` succeeds
</acceptance_criteria>
</task>

<task id="03.3">
<title>Create SocialShareButtons component</title>
<read_first>
- src/components/ui/FundraiserPage.tsx (fundraiser page where buttons will be placed)
- src/components/ui/FundraiserPage.module.css (fundraiser page styles)
</read_first>
<action>
Create `src/components/ui/SocialShareButtons.tsx` and `SocialShareButtons.module.css`:

A `'use client'` component. Props: `url: string` (the full fundraiser page URL), `title: string` (the fundraiser display name), `message?: string` (optional custom share message).

Default share message: "Support {title}'s fundraiser for Run for Ukraine 2026! Every euro funds charging stations for Ukraine's defenders."

Generate share URLs for each platform:
- **WhatsApp:** `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`
- **LinkedIn:** `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
- **Facebook:** `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
- **X (Twitter):** `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`
- **Email:** `mailto:?subject=${encodeURIComponent(title + ' — Run for Ukraine 2026')}&body=${encodeURIComponent(message + '\n\n' + url)}`
- **Copy link:** button that copies `url` to clipboard with "Copied!" feedback

Render as a row of icon buttons with accessible labels. Use inline SVG icons (compact, no external dependency). Each opens in a new window/tab (target="_blank" with rel="noopener").

Style: horizontal row, equal spacing, subtle hover effects using existing design tokens.
</action>
<acceptance_criteria>
- Component renders 6 share options: WhatsApp, LinkedIn, Facebook, X, Email, Copy link
- Each platform button generates the correct share URL with encoded fundraiser URL and message
- Copy link button copies to clipboard and shows "Copied!" feedback
- External links open in new tab with `rel="noopener"`
- All buttons have `aria-label` for accessibility
- CSS Module uses camelCase class names
- `'use client'` directive present
</acceptance_criteria>
</task>

<task id="03.4">
<title>Integrate social sharing into FundraiserPage</title>
<read_first>
- src/components/ui/FundraiserPage.tsx (fundraiser page component from Plan 02)
- src/components/ui/SocialShareButtons.tsx (newly created component)
</read_first>
<action>
Update `FundraiserPage.tsx` to render `SocialShareButtons` below the WhyDonate widget section:

1. Import `SocialShareButtons`
2. After the WhyDonate widget and before the donor wall placeholder, render:
   ```
   <SocialShareButtons
     url={`https://european-resolve.org/events/2026-run-for-ukraine/fundraiser?by=${slug}`}
     title={fundraiser.displayName}
   />
   ```
3. Wrap in a section with heading "Share this page"
4. Only show when fundraiser data is loaded (not during loading/error states)

Also add a social sharing section to `FundraiserConfirmation.tsx` (from Plan 02) so creators can immediately share after creation.
</action>
<acceptance_criteria>
- FundraiserPage renders SocialShareButtons with correct URL and title
- Share buttons only appear after data loads (not during loading state)
- "Share this page" heading is visible above the buttons
- FundraiserConfirmation also includes share buttons for the newly created page
- `npm run build` succeeds
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` succeeds with static export
- Event page at `/events/2026-run-for-ukraine/` shows live progress stats (requires running backend)
- Stats update automatically every 30 seconds without page reload
- Progress bar width matches the percentage from API
- Cause description section shows Hurkit link and WhyDonate campaign link
- Fundraiser page shows social sharing buttons with correct share URLs
- WhatsApp share opens with pre-filled message containing the fundraiser URL
- Copy link button copies the correct URL and shows feedback
- Email share opens mail client with pre-filled subject and body
</verification>
