# ADR-003: Inter + Source Serif 4 as Starter Fonts

**Status:** Accepted (temporary)
**Date:** 2026-05-09

## Problem

Design system specifies Söhne (Klim) and Publico (Commercial Type) as primary typefaces. Licensing cost doesn't justify the spend before launch.

## Decision

Start with free alternatives: **Inter** (sans-serif) and **Source Serif 4** (serif). Self-hosted via `next/font/google`.

## Rationale

- Inter has near-equivalent metrics to Söhne — slightly narrower but well-hinted for screen
- Source Serif 4 matches Publico's editorial character — designed for screen and print
- `next/font` handles preloading and `font-display: swap` automatically
- Swap to commercial fonts later requires changing only font declarations in layout + tokens

## Consequences

- Slightly different visual feel than the design spec until commercial fonts are licensed
- Font swap is a single-file change (layout.tsx + tokens.css) — no component changes needed
