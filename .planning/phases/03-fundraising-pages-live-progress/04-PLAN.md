---
plan_id: "04"
title: "Frontend: Donor Wall"
phase: 3
wave: 2
depends_on: ["01", "02"]
files_modified:
  - src/components/ui/DonorWall.tsx
  - src/components/ui/DonorWall.module.css
  - src/components/ui/DonorWallForm.tsx
  - src/components/ui/DonorWallForm.module.css
  - src/components/ui/FundraiserPage.tsx
autonomous: true
requirements_addressed: [PAGE-05, PAGE-06]
---

# Plan 04: Frontend — Donor Wall

<objective>
Add the donor wall feature to fundraiser pages. Visitors can see a list of supporters who left names and messages, and can add their own entry via an honour-system flow: after using the WhyDonate widget, an "I've donated" button reveals the wall entry form. Donor wall entries are stored in Google Sheets via the backend API.
</objective>

<must_haves>
- Donor wall displays on fundraiser pages showing supporter names and messages
- "I've donated" honour-system button reveals the wall entry form
- Wall form requires both name (2-50 chars) and message (5-200 chars)
- Submitting the form calls POST /api/donors and adds the entry to the wall
- Newly added entry appears in the wall immediately after submission
- Wall entries load from GET /api/donors/:slug on page mount

<truths>
- D-10: Donor wall entries available after donation — honour-system "I've donated" button appears after WhyDonate widget
- D-11: Both name and message required
- D-12: Basic validation — required fields, character limits
- D-13: Entries stored in "Donor Wall" tab in Sheets, linked by fundraiser slug
</truths>
</must_haves>

<tasks>

<task id="04.1">
<title>Create DonorWall display component</title>
<read_first>
- src/components/ui/FundraiserPage.tsx (fundraiser page where wall is rendered)
- src/components/ui/FundraiserPage.module.css (page styles for context)
</read_first>
<action>
Create `src/components/ui/DonorWall.tsx` and `DonorWall.module.css`:

A `'use client'` component. Props: `slug: string` (fundraiser slug).

1. On mount: fetch GET `${NEXT_PUBLIC_API_URL}/api/donors/${slug}`
2. State: `entries` (array of `{ donorName: string; message: string; createdAt: string }`), `loading` boolean
3. If no entries: show "No supporters yet — be the first!" message
4. If entries exist: render a list with each entry showing:
   - Donor name (bold)
   - Message text
   - Relative time (e.g., "2 hours ago") computed from `createdAt`
5. Display order: newest first (API returns this order)
6. Expose `addEntry(entry)` via a ref callback or state lifting so the form can optimistically add entries

Style: card-like entries stacked vertically, subtle borders, consistent with existing design tokens. Section heading: "Supporters" with entry count badge.
</action>
<acceptance_criteria>
- Component fetches donor wall entries from API on mount
- Empty state shows "No supporters yet" message
- Entries display donor name, message, and relative time
- Entries are ordered newest first
- Section has "Supporters" heading with count badge (e.g., "Supporters (3)")
- CSS uses camelCase class names and existing design tokens
- `'use client'` directive present
</acceptance_criteria>
</task>

<task id="04.2">
<title>Create DonorWallForm with honour-system reveal</title>
<read_first>
- src/components/ui/ConfirmationPanel.tsx (reference: "I've completed my donation" button pattern)
- src/components/ui/DonorWall.tsx (parent component context)
- src/components/ui/RegisterClient.tsx (reference: form validation and submission pattern)
</read_first>
<action>
Create `src/components/ui/DonorWallForm.tsx` and `DonorWallForm.module.css`:

A `'use client'` component. Props: `slug: string`, `onEntryAdded: (entry: DonorWallEntry) => void`.

Two-phase UX:

**Phase 1 — Honour-system gate:**
- Render a button: "I've donated — leave a message of support"
- Styled subtly below the WhyDonate widget area
- On click: transition to Phase 2

**Phase 2 — Wall entry form:**
- Fields: "Your name" input (2-50 chars), "Your message" textarea (5-200 chars)
- Character counter on message field showing remaining chars
- Inline validation errors under each field
- Submit button: "Post to wall"
- On submit: validate fields, POST to `${NEXT_PUBLIC_API_URL}/api/donors` with `{ fundraiserSlug: slug, donorName, message }`
- Loading state on submit button
- On success: call `onEntryAdded` with the new entry (optimistic add to wall), show brief "Thank you!" message, hide form
- On error: display API errors inline
</action>
<acceptance_criteria>
- Initial state shows only the "I've donated" gate button
- Clicking gate button reveals the name + message form
- Name field validates 2-50 characters
- Message field validates 5-200 characters with visible character counter
- Submit posts to `/api/donors` with correct payload
- Successful submission calls `onEntryAdded` callback
- After submission, form shows "Thank you!" and hides
- Validation errors display inline under each field
- CSS uses camelCase class names
</acceptance_criteria>
</task>

<task id="04.3">
<title>Integrate donor wall into FundraiserPage</title>
<read_first>
- src/components/ui/FundraiserPage.tsx (fundraiser page component)
- src/components/ui/DonorWall.tsx (wall display component)
- src/components/ui/DonorWallForm.tsx (wall entry form)
</read_first>
<action>
Update `FundraiserPage.tsx` to render the donor wall section:

1. Import `DonorWall` and `DonorWallForm`
2. Add state for `wallEntries` that DonorWall populates and DonorWallForm can add to
3. Place the donor wall section after the social sharing buttons:
   - `DonorWall` component displaying entries
   - `DonorWallForm` component below the wall with the honour-system gate
4. When `DonorWallForm` calls `onEntryAdded`: prepend new entry to the wall entries list (optimistic update — no refetch needed)
5. Only show donor wall section for published fundraiser pages (hide on drafts)
6. Pass `slug` prop to both DonorWall and DonorWallForm
</action>
<acceptance_criteria>
- FundraiserPage renders DonorWall and DonorWallForm after social sharing section
- New wall entry submission adds entry to the displayed list immediately
- Donor wall section hidden on draft fundraiser pages
- `slug` is passed correctly to both components
- `npm run build` succeeds with static export
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` succeeds with static export
- Fundraiser page shows "Supporters" section with wall entries from API
- "No supporters yet" message shows when wall is empty
- "I've donated" button reveals the entry form
- Filling and submitting the form adds an entry to the wall immediately
- Validation errors show for empty name or too-short message
- Character counter updates as user types in message field
- Donor wall is hidden on draft fundraiser pages
- Wall entries show newest first with relative timestamps
</verification>
