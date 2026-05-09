# ADR-004: Cloudflare Pages via GitHub App, GitHub Actions for Quality Gates

**Status:** Accepted
**Date:** 2026-05-09

## Problem

Need CI/CD for a static site. Deploy must be automatic on push. Quality gates (lint, typecheck, test) must run before code is considered healthy.

## Options Considered

1. **GitHub Actions only** — deploy via `wrangler` CLI, requires API tokens
2. **Cloudflare GitHub app only** — auto-deploy, but no quality gates
3. **Both: Cloudflare GitHub app + GitHub Actions** — parallel pipelines

## Decision

Split responsibilities: Cloudflare GitHub app handles build + deploy. GitHub Actions handles quality gates.

## Rationale

- Cloudflare GitHub app: zero-config deploy, free tier, no API tokens to manage
- GitHub Actions: fast feedback on lint/typecheck/test failures independent of deploy
- Two parallel pipelines on every push — deploy doesn't wait for tests, but test failures are visible in GitHub
- No secrets needed for Cloudflare — the GitHub app handles authentication

## Consequences

- Cloudflare may deploy a build that fails quality gates — the broken state is visible in GitHub but live briefly
- Acceptable tradeoff for a non-critical informational site with a small team
- If this becomes a problem, add a Cloudflare deploy hook gated on GitHub Actions success
