---
phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
reviewed: 2026-08-08T21:25:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - vitest.config.ts
  - src/lib/events.ts
  - src/components/ui/EventCard.tsx
  - src/components/ui/EventCard.module.css
findings:
  critical: 0
  warning: 3
  info: 1
  total: 4
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-08-08T21:25:00Z
**Depth:** standard
**Files Reviewed:** 4 (production source only; test files read for behavioral context)
**Status:** issues_found

## Summary

Phase 7 production changes are small, focused, and align with locked decisions D-13–D-17 (internal vs external announcement links) and D-22–D-26 (auto-derived Upcoming badge). The TDD implementation in `events.ts` and `EventCard` is clean, helpers are unit-tested, and the Vitest include fix is correct. No security blockers were found in scope; spreadsheet-trust assumptions match the phase threat model.

Three warnings remain around URL classification edge cases and static-export date sensitivity for the Upcoming badge. None block shipping the Run for Ukraine row, but they affect long-term correctness after deploy or if spreadsheet URL formats drift from the `/events/...` convention.

## Warnings

### WR-01: Upcoming badge can desync between static HTML and client hydration

**File:** `src/components/ui/EventCard.tsx:43`
**Issue:** `isEventUpcoming(event.date)` evaluates at build time when static HTML is generated and again at client hydration using the viewer's current date. If a deploy is not rebuilt after an event's date passes, pre-rendered HTML can still contain "Upcoming" while the hydrated client tree omits it. No-JS crawlers and users keep the stale badge until the next build. JS-enabled users may hit a React hydration mismatch on the conditional badge span.
**Fix:** Render the Upcoming badge only after client mount, or pass a build-time `now` through props for SSR and accept redeploy cadence as ops policy:

```tsx
"use client";
import { useEffect, useState } from "react";

// Inside EventCard:
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

{mounted && isEventUpcoming(event.date) && (
  <span className={styles.badgeUpcoming}>Upcoming</span>
)}
```

Alternatively, document that a post-event redeploy is required to clear badges from static HTML.

### WR-02: Same-origin absolute URLs are treated as external

**File:** `src/lib/events.ts:93-95`
**Issue:** `isInternalAnnouncementUrl` only checks `url.startsWith("/")`. Phase context D-17 allows "relative paths or same-origin URLs", and research open question A2 flags that a spreadsheet value like `https://european-resolve.org/events/2026-run-for-ukraine/` would open in a new tab with `target="_blank"`, contradicting D-15 same-tab hub navigation intent.
**Fix:** Extend detection to cover same-origin absolute paths:

```typescript
export function isInternalAnnouncementUrl(url: string): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.origin === "https://european-resolve.org";
  } catch {
    return false;
  }
}
```

### WR-03: Protocol-relative URLs misclassified as internal

**File:** `src/lib/events.ts:93-95`
**Issue:** Any URL starting with `/` is treated as internal, including protocol-relative URLs such as `//facebook.com/events/123`. These would render without `target="_blank"` or `rel="noopener noreferrer"`, navigating off-site in the same tab. Unlikely from the team spreadsheet but incorrect for the helper's contract.
**Fix:** Exclude protocol-relative URLs:

```typescript
export function isInternalAnnouncementUrl(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}
```

## Info

### IN-01: Malformed event dates silently suppress Upcoming badge

**File:** `src/lib/events.ts:97-104`
**Issue:** If the API returns a non-ISO `date` string, `new Date(isoDate + "T00:00:00")` becomes `Invalid Date`, and `eventDay >= todayStart` evaluates to `false`. The badge is hidden with no signal that data is corrupt.
**Fix:** Optional guard for invalid dates (return false explicitly or filter bad rows in `parseEvents`):

```typescript
const eventDay = new Date(isoDate + "T00:00:00");
if (Number.isNaN(eventDay.getTime())) return false;
```

---

_Reviewed: 2026-08-08T21:25:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
