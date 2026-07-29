---
plan_id: "02"
title: "Frontend: Fundraise Form Activation & Fundraiser Page"
phase: 3
wave: 2
depends_on: ["01"]
files_modified:
  - src/components/ui/FundraiseForm.tsx
  - src/components/ui/FundraiseForm.module.css
  - src/components/ui/ShareableLinkPreview.tsx
  - src/components/ui/ShareableLinkPreview.module.css
  - src/components/ui/FundraiserPage.tsx
  - src/components/ui/FundraiserPage.module.css
  - src/components/ui/FundraiserConfirmation.tsx
  - src/components/ui/FundraiserConfirmation.module.css
  - src/app/events/2026-run-for-ukraine/fundraise/page.tsx
  - src/app/events/2026-run-for-ukraine/fundraiser/page.tsx
autonomous: true
requirements_addressed: [FUND-01, FUND-02, FUND-03, FUND-04, FUND-05, PAGE-01, PAGE-02, PAGE-03]
---

# Plan 02: Frontend — Fundraise Form Activation & Fundraiser Page

<objective>
Activate the existing FundraiseForm preview so users can create fundraiser pages via the backend API, receive a shareable URL with edit token, and upload a profile photo. Create the dynamic fundraiser page route that loads fundraiser data client-side by slug, displays the fundraiser's name/photo/message/goal, and embeds the WhyDonate donation widget.
</objective>

<must_haves>
- FundraiseForm is interactive: display name, personal message, goal, photo upload — all fields functional
- Form submits to POST /api/fundraiser (multipart), receives page ID (slug) + editToken
- After creation, user sees a confirmation panel with shareable URL and edit link
- ShareableLinkPreview shows real generated URL with working copy-to-clipboard
- Photo upload: click-to-upload area, file picker, preview of selected image
- Fundraiser page route at /events/2026-run-for-ukraine/fundraiser?by={id}
- Fundraiser page fetches data from GET /api/fundraiser/:slug and renders name, photo, message, goal (backend uses "slug" internally; the user-facing query param is `?by=`)
- WhyDonate widget embedded on fundraiser page for donations
- Draft fundraiser pages show a "This page is a draft" banner
- Fundraiser page displays collective jar total (clearly labelled as collective, not personal)
- Draft/publish toggle accessible via edit link (edit token in URL)

<truths>
- D-01: Client-side React routes with fixed layout, data fetched by slug
- D-02: No backend rendering — static site serves shell, React hydrates client-side
- D-03: Photos stored in Google Drive via service account
- D-04: Backend resizes to 400x400 WebP
- D-06: Slugs auto-generated from display name
- D-07: Edit token returned at creation — secret edit link
- D-08: Draft pages accessible by URL, show draft banner
- D-09: Publish via edit link, simple toggle
- D-16: WhyDonate widget on fundraiser pages for donations
</truths>
</must_haves>

<tasks>

<task id="02.1">
<title>Activate FundraiseForm — remove preview, add client state</title>
<read_first>
- src/components/ui/FundraiseForm.tsx (current preview form with disabled fields)
- src/components/ui/FundraiseForm.module.css (existing styles)
- src/components/ui/RegisterClient.tsx (reference: form activation pattern from Phase 2)
- src/components/ui/ConfirmationPanel.tsx (reference: post-submission confirmation pattern)
</read_first>
<action>
Transform `FundraiseForm.tsx` into an interactive client component:

1. Add `'use client'` directive
2. Remove preview banner ("Registration opens soon...")
3. Remove all `readOnly`, `aria-disabled="true"`, `tabIndex={-1}` attributes from inputs
4. Add React state for form fields: `displayName`, `message`, `goalEur`, `photoFile` (File | null)
5. Add `photoPreview` state (data URL string for image preview)
6. Convert photo upload area to a clickable file input (hidden input + styled label) that accepts image/* (max 5MB)
7. On photo selection: validate file size, create object URL for preview, store File object
8. Add form validation: displayName (2-50 chars), message (max 500 chars), goalEur (min 10, positive integer)
9. Add inline validation error display under each field (same pattern as RegisterClient)
10. Enable "Save draft" button → submits form with `status: 'draft'` (default)
11. Enable "Publish page" button → submits form with `status: 'published'`
12. On submit: create FormData, POST to `${NEXT_PUBLIC_API_URL}/api/fundraiser`, handle response
13. Add `submitting` state for loading indicator on buttons
14. On success: transition to FundraiserConfirmation component (shows slug, edit link, shareable URL)
15. On error: display API validation errors inline
</action>
<acceptance_criteria>
- `FundraiseForm.tsx` starts with `'use client'`
- No `readOnly`, `aria-disabled`, or `disabled` attributes on form fields
- Photo area is clickable and opens file picker; selected image shows as preview
- Files > 5MB are rejected with a user-visible error
- "Save draft" and "Publish page" buttons trigger form submission to API
- Validation errors appear inline under each invalid field
- Buttons show loading state during submission
- Successful submission renders the FundraiserConfirmation component
- CSS Module classes continue to use camelCase
</acceptance_criteria>
</task>

<task id="02.2">
<title>Create FundraiserConfirmation panel</title>
<read_first>
- src/components/ui/ConfirmationPanel.tsx (reference: post-registration confirmation pattern)
- src/components/ui/ConfirmationPanel.module.css (styling reference)
- src/components/ui/ShareableLinkPreview.tsx (existing shareable link component)
</read_first>
<action>
Create `src/components/ui/FundraiserConfirmation.tsx` and `FundraiserConfirmation.module.css`:

A `'use client'` component shown after successful fundraiser creation. Props: `slug: string`, `editToken: string`, `displayName: string`.

Displays:
1. Success icon and heading "Your fundraising page is ready!"
2. Shareable URL: `european-resolve.org/events/2026-run-for-ukraine/fundraiser?by={slug}` with copy button
3. Edit link: `...fundraiser?by={slug}&edit={editToken}` with copy button and note "Save this link — it's your secret edit link"
4. "View your page" link to the fundraiser page
5. Social sharing CTAs (share this page — placeholder, activated in Plan 03)

Copy button: on click, copies URL to clipboard using `navigator.clipboard.writeText`, shows brief "Copied!" feedback.
</action>
<acceptance_criteria>
- Component renders shareable URL containing the fundraiser slug
- Component renders edit link containing slug and edit token
- Copy buttons copy to clipboard and show "Copied!" feedback
- "View your page" link navigates to `/events/2026-run-for-ukraine/fundraiser?by={slug}`
- CSS Module file uses camelCase class names
- Component has `'use client'` directive
</acceptance_criteria>
</task>

<task id="02.3">
<title>Update ShareableLinkPreview for live slug</title>
<read_first>
- src/components/ui/ShareableLinkPreview.tsx (current static placeholder)
- src/components/ui/ShareableLinkPreview.module.css (existing styles)
</read_first>
<action>
Update `ShareableLinkPreview.tsx` to accept an optional `slug` prop:

- If `slug` is provided: display the real URL `european-resolve.org/events/2026-run-for-ukraine/fundraiser?by={slug}` and enable the copy button
- If no slug (form not yet submitted): display placeholder `european-resolve.org/r4u/your-name-here` with disabled copy button (current behavior)
- Add `'use client'` directive for clipboard interaction
- Copy button: `navigator.clipboard.writeText(fullUrl)` with "Copied!" feedback
</action>
<acceptance_criteria>
- With `slug` prop: shows real URL and copy button is enabled
- Without `slug` prop: shows placeholder URL with disabled copy button
- Copy button uses `navigator.clipboard.writeText`
- `'use client'` directive present
</acceptance_criteria>
</task>

<task id="02.4">
<title>Create fundraiser page route and FundraiserPage component</title>
<read_first>
- src/app/events/2026-run-for-ukraine/fundraise/page.tsx (existing fundraise page structure)
- src/app/events/2026-run-for-ukraine/page.tsx (event page layout reference)
- src/components/ui/ConfirmationPanel.tsx (reference: client data fetching pattern)
- src/components/ui/WhyDonateWidget.tsx (WhyDonate widget component)
- src/app/events/2026-run-for-ukraine/layout.tsx (event layout wrapper)
</read_first>
<action>
**Create route:** `src/app/events/2026-run-for-ukraine/fundraiser/page.tsx`

A standard static page (no dynamic segments, no `generateStaticParams` needed). Static export produces a single `fundraiser/index.html`. The fundraiser ID is read from the `?by=` query parameter client-side.

Page component:
1. Renders `FundraiserPage` client component

**Create component:** `src/components/ui/FundraiserPage.tsx` and `FundraiserPage.module.css`

A `'use client'` component that:
1. Reads fundraiser ID from `useSearchParams().get('by')`
2. If no `by` query param: show "Fundraiser not found" message with link back to fundraise page
3. Fetches GET `/api/fundraiser/{slug}` on mount using `useEffect`
4. Loading state: skeleton or spinner
5. If API returns 404: show "Fundraiser not found"
6. If API returns data, renders:
   - Breadcrumbs: Events > Run for Ukraine 2026 > {displayName}'s page
   - Draft banner if status === 'draft': "This page is a draft — only the creator can see it"
   - Photo (from photoUrl or placeholder avatar)
   - Display name as h1
   - Personal message
   - Personal goal with collective progress note: "Personal goal: €{goalEur} · Collective total: €{collectiveTotal}"
   - WhyDonate widget for donations (using WhyDonateWidget component)
   - Donor wall placeholder (activated in Plan 04)
   - Social sharing buttons placeholder (activated in Plan 03)
7. If URL also has `edit` query param (`?by=maria-k&edit={token}`): show edit controls (publish toggle, edit form link)
</action>
<acceptance_criteria>
- Route file exists at `src/app/events/2026-run-for-ukraine/fundraiser/page.tsx`
- No `generateStaticParams` needed (static page, ID from `?by=` query param)
- `FundraiserPage` reads ID via `useSearchParams().get('by')` and fetches from `${NEXT_PUBLIC_API_URL}/api/fundraiser/${id}`
- Loading state shows while fetching
- Missing `by` query param shows "Fundraiser not found" message
- 404 API response shows "Fundraiser not found" message
- Published fundraiser shows name, photo, message, goal, and WhyDonate widget
- Draft fundraiser shows "This page is a draft" banner
- `?by=x&edit={token}` query params reveal publish toggle button
- Publish toggle calls PUT `/api/fundraiser/{slug}` with `{ status: 'published' }` and Authorization header
- `npm run build` succeeds (static export generates fundraiser/index.html)
</acceptance_criteria>
</task>

<task id="02.5">
<title>Update fundraise page to use activated form</title>
<read_first>
- src/app/events/2026-run-for-ukraine/fundraise/page.tsx (current page with FundraiseForm)
- src/app/events/2026-run-for-ukraine/fundraise/page.module.css (page styles)
</read_first>
<action>
Update `src/app/events/2026-run-for-ukraine/fundraise/page.tsx`:

The page already imports and renders `FundraiseForm`. Since FundraiseForm is now a client component with `'use client'`, the page can remain a server component that renders the form. No structural changes needed — verify the import works with the activated form.

Ensure the metadata remains appropriate for SEO. Update description if needed to reflect that the form is now active (not a preview).
</action>
<acceptance_criteria>
- Page renders the activated FundraiseForm (no preview banner visible)
- Page metadata is appropriate for the live form
- `npm run build` succeeds with this page included in static export
- No server-client boundary issues (FundraiseForm has `'use client'`, page can be server component)
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` succeeds with static export (no server dependency errors)
- `/events/2026-run-for-ukraine/fundraise` renders the active form with all fields enabled
- Filling out the form and submitting creates a fundraiser via the API
- After creation, the shareable URL and edit link are displayed with working copy buttons
- Navigating to `/events/2026-run-for-ukraine/fundraiser?by={id}` loads and displays the fundraiser data
- Draft fundraiser pages show the draft banner
- Edit link with `&edit={token}` shows the publish toggle
- WhyDonate widget renders on the fundraiser page
- Photo upload shows preview in the form
</verification>
