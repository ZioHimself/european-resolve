---
phase: 4
plan_id: "03"
title: "Backend Error Codes — Machine-Readable Validation Responses"
wave: 1
depends_on: ["01"]
files_modified:
  - backend/src/types.ts
  - backend/src/routes/register.ts
  - backend/src/routes/fundraiser.ts
  - backend/src/routes/donors.ts
  - backend/src/middleware/error.ts
  - src/locales/en.ts
requirements_addressed: []
autonomous: true
---

# Plan 03: Backend Error Codes — Machine-Readable Validation Responses

## Objective

Migrate backend validation responses from human-readable English messages to machine-readable error codes. Frontend maps error codes to locale strings via `t()`. Backend stays language-agnostic. Backward-compatible: `message` field kept alongside new `code` field.

## Tasks

<task id="03.1">
<title>Update ValidationError type and define error code constants</title>
<read_first>
- backend/src/types.ts
- backend/src/routes/register.ts
- backend/src/routes/fundraiser.ts
- backend/src/routes/donors.ts
</read_first>
<action>
1. Update `ValidationError` type in `backend/src/types.ts` to add optional `code` field:
   ```
   type ValidationError = { field: string; message: string; code?: string }
   ```
2. Create error code constants (can be in types.ts or a new `backend/src/errors.ts`):
   - `VALIDATION_FULLNAME_REQUIRED`
   - `VALIDATION_EMAIL_INVALID`
   - `VALIDATION_TSHIRT_INVALID`
   - `VALIDATION_LANGUAGE_INVALID`
   - `VALIDATION_COUNTRY_REQUIRED`
   - `VALIDATION_TIER_INVALID`
   - `VALIDATION_GDPR_REQUIRED`
   - `VALIDATION_DISPLAYNAME_LENGTH` (2-50 chars)
   - `VALIDATION_MESSAGE_REQUIRED`
   - `VALIDATION_MESSAGE_LENGTH` (max 500)
   - `VALIDATION_GOAL_INVALID` (10-100000 integer)
   - `VALIDATION_PHOTO_TYPE` (not JPEG/PNG/WebP)
   - `VALIDATION_PHOTO_SIZE` (over 5MB)
   - `VALIDATION_STATUS_INVALID`
   - `VALIDATION_AUTH_REQUIRED` (edit token missing)
   - `VALIDATION_AUTH_INVALID` (wrong edit token)
   - `VALIDATION_DONOR_NAME_LENGTH` (2-50)
   - `VALIDATION_DONOR_MESSAGE_LENGTH` (5-200)
   - `VALIDATION_SLUG_REQUIRED`
   - `INTERNAL_ERROR`
</action>
<acceptance_criteria>
- `ValidationError` type has `code?: string` field
- Error code constants are defined and exported
- All codes follow `VALIDATION_{FIELD}_{REASON}` naming convention
- Backend TypeScript compiles (`cd backend && npx tsc --noEmit`)
</acceptance_criteria>
</task>

<task id="03.2">
<title>Add error codes to registration route</title>
<read_first>
- backend/src/types.ts
- backend/src/routes/register.ts
</read_first>
<action>
Update `validate()` function in `register.ts` to include `code` alongside existing `message`:
- `{ field: "fullName", message: "Full name is required", code: "VALIDATION_FULLNAME_REQUIRED" }`
- `{ field: "email", message: "Valid email address is required", code: "VALIDATION_EMAIL_INVALID" }`
- `{ field: "tshirtSize", message: "Valid t-shirt size is required", code: "VALIDATION_TSHIRT_INVALID" }`
- `{ field: "language", message: "Valid language is required", code: "VALIDATION_LANGUAGE_INVALID" }`
- `{ field: "country", message: "Country is required", code: "VALIDATION_COUNTRY_REQUIRED" }`
- `{ field: "tierId", message: "Valid tier is required", code: "VALIDATION_TIER_INVALID" }`
- `{ field: "gdprConsent", message: "GDPR consent is required to register", code: "VALIDATION_GDPR_REQUIRED" }`

Keep `message` unchanged for backward compatibility.
</action>
<acceptance_criteria>
- Every `errors.push()` in `register.ts` includes a `code` field
- All 7 validation errors have unique, meaningful codes
- `message` field values are unchanged (backward compatible)
- Backend compiles without errors
</acceptance_criteria>
</task>

<task id="03.3">
<title>Add error codes to fundraiser routes</title>
<read_first>
- backend/src/types.ts
- backend/src/routes/fundraiser.ts
</read_first>
<action>
Update validation errors in `fundraiser.ts` POST and PUT handlers:
- POST: displayName length, message required/length, goalEur invalid, photo type, photo size → add `code` field to each
- PUT: Same validations plus status invalid, auth required (403), auth invalid (403) → add `code` field
- GET 404: `{ field: "slug", message: "Fundraiser not found", code: "VALIDATION_SLUG_NOT_FOUND" }`
</action>
<acceptance_criteria>
- Every `errors.push()` and error response in `fundraiser.ts` includes a `code` field
- POST handler: 5 validation errors have codes
- PUT handler: 7 validation errors + 1 auth error have codes
- GET 404: error response has code
- Backend compiles without errors
</acceptance_criteria>
</task>

<task id="03.4">
<title>Add error codes to donors route and global error handler</title>
<read_first>
- backend/src/types.ts
- backend/src/routes/donors.ts
- backend/src/middleware/error.ts
</read_first>
<action>
1. **donors.ts**: Add `code` field to all validation errors (donorName length, message length, slug required/not found)
2. **error.ts**: Update global error handler to include `code: "INTERNAL_ERROR"` in the error response
</action>
<acceptance_criteria>
- All validation errors in `donors.ts` have `code` field
- Global error handler in `error.ts` includes `code: "INTERNAL_ERROR"`
- Backend compiles: `cd backend && npx tsc --noEmit`
</acceptance_criteria>
</task>

<task id="03.5">
<title>Add error code locale strings and update frontend error display</title>
<read_first>
- src/locales/en.ts
- src/locales/types.ts
- src/components/ui/RegistrationForm.tsx
- src/components/ui/FundraiseForm.tsx
- src/components/ui/DonorWallForm.tsx
</read_first>
<action>
1. Add `errors.*` keys to `src/locales/en.ts` mapping each backend error code to a user-friendly English message:
   - `"errors.VALIDATION_FULLNAME_REQUIRED": "Full name is required"`
   - `"errors.VALIDATION_EMAIL_INVALID": "Please enter a valid email address"`
   - (etc. for all ~20 codes)
2. Add same keys (with empty values) to all stub locale files
3. Update frontend error display logic in RegistrationForm, FundraiseForm, DonorWallForm:
   - When receiving API errors, check for `code` field first
   - If `code` exists: display `t("errors." + code)`
   - If no `code` (fallback): display `message` as before
</action>
<acceptance_criteria>
- `src/locales/en.ts` contains `errors.*` keys for all backend error codes
- Stub locale files have matching empty keys
- Frontend components prefer `code` → `t()` over raw `message`
- Fallback to `message` still works if `code` is absent
- `npm run build` succeeds
- TypeScript compiles for both frontend and backend
</acceptance_criteria>
</task>

## Verification

```bash
cd backend && npx tsc --noEmit && cd .. && npm run build
```

## must_haves

- Backend returns machine-readable error codes (D-06)
- Frontend maps error codes to locale strings via t() (D-06)
- Backward compatible — `message` field preserved (non-breaking)
- Backend stays language-agnostic (D-06)
