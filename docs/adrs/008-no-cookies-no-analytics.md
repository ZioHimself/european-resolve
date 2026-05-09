# ADR-008: No Cookies, No Analytics at Launch

**Status:** Accepted
**Date:** 2026-05-09

## Problem

GDPR requires cookie consent for non-essential tracking. The organisation's data privacy policy states: "Not currently implemented. If added: cookie consent required for non-essential tracking."

## Decision

Launch with no cookies, no analytics, no tracking. Footer states: "We don't use cookies or collect personal data."

## Rationale

- Eliminates GDPR consent banner complexity at launch
- Consistent with data minimization principle: "Only collect what we need"
- A static site with no backend processes zero personal data by default
- Analytics can be added later with a proper consent mechanism if needed

## Consequences

- No visitor metrics — acceptable for an initial launch focused on establishing presence
- If analytics are added later, requires implementing a GDPR-compliant consent mechanism first
- The "no cookies" footer notice must be updated if this changes
