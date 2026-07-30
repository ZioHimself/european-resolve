# Phase 4: Polish, Communications & Post-Event Readiness — Research

**Researched:** 2026-07-30
**Status:** Complete

## 1. String Extraction Inventory

### Components with Hardcoded English Strings

| Component | Location | String Count (approx) | Type |
|-----------|----------|----------------------|------|
| EventHero | `src/components/ui/EventHero.tsx` | 3 | Server |
| TrackCards | `src/components/ui/TrackCards.tsx` | 12 | Server |
| ProgressSection | `src/components/ui/ProgressSection.tsx` | 8 | Client |
| RegisterClient | `src/components/ui/RegisterClient.tsx` | 0 (delegates) | Client |
| TierGrid/TierCard | `src/components/ui/TierGrid.tsx`, `TierCard.tsx` | 5 | Client |
| RegistrationForm | `src/components/ui/RegistrationForm.tsx` | ~15 | Client |
| ConfirmationPanel | `src/components/ui/ConfirmationPanel.tsx` | ~8 | Client |
| FundraiseForm | `src/components/ui/FundraiseForm.tsx` | ~12 | Client |
| FundraiserConfirmation | `src/components/ui/FundraiserConfirmation.tsx` | ~5 | Client |
| FundraiserPage | `src/components/ui/FundraiserPage.tsx` | ~10 | Client |
| DonorWall | `src/components/ui/DonorWall.tsx` | ~3 | Client |
| DonorWallForm | `src/components/ui/DonorWallForm.tsx` | ~8 | Client |
| SocialShareButtons | `src/components/ui/SocialShareButtons.tsx` | ~3 | Client |
| Breadcrumbs | `src/components/ui/Breadcrumbs.tsx` | 0 (data-driven) | Server |
| CoOrganiserBar | `src/components/ui/CoOrganiserBar.tsx` | ~2 | Server |
| WhyDonateWidget | `src/components/ui/WhyDonateWidget.tsx` | ~2 | Client |

**Pages with inline strings:**
- `src/app/events/2026-run-for-ukraine/page.tsx` — ~5 strings
- `src/app/events/2026-run-for-ukraine/register/page.tsx` — ~4 strings
- `src/app/events/2026-run-for-ukraine/fundraise/page.tsx` — ~4 strings
- `src/app/events/2026-run-for-ukraine/fundraiser/page.tsx` — 0 (delegates to FundraiserPage)

**Total estimated extractable strings:** ~100-120

### Data Files with Content Strings
- `src/data/event.ts` — tier names, rewards, event details (~30 strings)

## 2. i18n Implementation Approach

### Recommended Pattern (matches project conventions)

```
src/locales/
├── en.ts          # Fully populated English strings
├── nl.ts          # Stub (same keys, empty values)
├── fr.ts          # Stub
├── de.ts          # Stub
├── uk.ts          # Stub
├── types.ts       # Shared type for locale shape
└── index.ts       # t() helper + locale selection
```

### t() Helper Design

Since the project uses static export (`output: "export"`), locale selection cannot use URL-based routing or server-side detection. The simplest approach:

1. Type-safe: `t()` returns string, accepts dot-notation keys
2. Fallback: If a key is missing in the active locale, fall back to English
3. Interpolation: Simple `{variable}` replacement syntax
4. No React Context needed (per D-04 decision)
5. Locale selection: Export a `setLocale()` function; actual switcher UI is Phase 5 scope

### Key Constraint: Static Export Compatibility
- Cannot use `next-intl` or `next-i18next` (require server runtime for locale detection)
- Must be a pure client-side solution with static strings at build time
- English is the only populated locale in Phase 4; switcher is Phase 5

## 3. Backend Error Code Migration

### Current Error Format
```typescript
{ field: "email", message: "Valid email address is required" }
```

### Target Error Format  
```typescript
{ field: "email", code: "VALIDATION_EMAIL_INVALID" }
```

### Affected Routes
| Route | File | Error Count |
|-------|------|-------------|
| POST /api/register | `backend/src/routes/register.ts` | 7 validation errors |
| POST /api/fundraiser | `backend/src/routes/fundraiser.ts` | 6 validation errors |
| PUT /api/fundraiser/:slug | `backend/src/routes/fundraiser.ts` | 7 validation errors |
| POST /api/donors | `backend/src/routes/donors.ts` | 3 validation errors |
| Global error handler | `backend/src/middleware/error.ts` | 1 generic error |

### Migration Strategy
- Add `code` field alongside existing `message` field (backward compatible)
- Frontend reads `code` and maps to locale string via `t()`
- `message` field kept for debugging/fallback (non-breaking change)
- Error code naming: `VALIDATION_{FIELD}_{REASON}` (e.g., `VALIDATION_EMAIL_REQUIRED`, `VALIDATION_PHOTO_TOO_LARGE`)

## 4. Post-Event Mode Architecture

### Trigger Mechanism
- Env var: `NEXT_PUBLIC_EVENT_STATUS` with values `active` | `completed`
- Requires rebuild + deploy to switch (acceptable per D-07)
- Detected at build time for static pages, at runtime for client components

### Affected Components & Behavior Changes

| Component | Active Mode | Completed Mode |
|-----------|------------|----------------|
| EventHero | Normal hero | Results hero with final totals + thank-you |
| TrackCards | Shows track CTAs | Hidden entirely |
| ProgressSection | Polls `/api/progress` every 30s | Shows frozen final values, no polling |
| Register page | Shows tier cards + form | "Registration is closed" banner + link to results |
| Fundraise page | Shows creation form | "Fundraiser creation is closed" banner + link to results |
| FundraiserPage | Full functionality | WhyDonate widget removed, DonorWallForm hidden |
| DonorWallForm | Visible, functional | Hidden |

### Implementation Pattern: `useEventStatus()` Hook
```typescript
// src/hooks/useEventStatus.ts
export function useEventStatus(): "active" | "completed" {
  return (process.env.NEXT_PUBLIC_EVENT_STATUS ?? "active") as "active" | "completed";
}
```

For server components, a simple constant:
```typescript
const EVENT_STATUS = process.env.NEXT_PUBLIC_EVENT_STATUS ?? "active";
```

### Post-Event Results Page Content
- Final totals (raised, goal%, participants, donors) — from `src/data/event.ts` extension
- Thank-you message — static content in data file
- Event photo gallery — fetched from Google Drive gallery folder
- Accountability report — inline section with impact metrics

## 5. Gallery Implementation

### Google Drive Folder Listing
The existing `DriveService` uses `googleapis` with `drive.file` scope. For gallery listing:
- Needs broader scope: `drive.readonly` (to list files in a folder not created by the service account)
- OR: Share the gallery folder with the service account email
- Recommended: Share the gallery folder with the service account (no scope change needed, just `drive.file` still works for files shared with the account)

### Backend Endpoint
```
GET /api/gallery → { success: true, data: { photos: [{ id, name, url }] } }
```

### Frontend Gallery Component
- CSS Grid layout, responsive (3 cols desktop, 2 tablet, 1 mobile)
- Lazy loading with `loading="lazy"` on `<img>` tags
- Lightbox interaction deferred (v2) — simple grid is sufficient

## 6. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| String extraction misses some hardcoded text | Low | Manual review pass; TypeScript type errors if keys missing |
| Post-event mode breaks active-mode functionality | Medium | Conditional logic tested both ways; env var defaults to `active` |
| Gallery Drive permissions insufficient | Low | Test with shared folder in dev; fallback to empty gallery |
| Backend error code migration breaks existing frontend | Medium | Keep `message` field alongside `code`; frontend first checks `code` |
| i18n type safety gaps | Low | Strict TypeScript locale type ensures all keys present |

## 7. Dependency Analysis

### Phase 4 depends on (all complete):
- Phase 1: Static pages exist (components to modify)
- Phase 2: Backend API exists (error codes to add)
- Phase 3: Fundraiser pages, donor wall, progress section, Drive service exist

### Phase 5 depends on Phase 4:
- i18n structure must be in place before translations can be added
- `t()` helper and all locale stubs must exist

## RESEARCH COMPLETE
