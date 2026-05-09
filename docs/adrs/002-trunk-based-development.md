# ADR-002: Trunk-Based Development, No Agent Commits

**Status:** Accepted
**Date:** 2026-05-09

## Problem

Need a git workflow for a small team where AI agents assist with code but humans maintain full control over what enters the repository.

## Options Considered

1. **Feature branches + PRs** — standard, but overhead for a small team; no reviewers besides the committer
2. **Trunk-based with agent auto-commits** — fast, but loses human oversight of what's committed
3. **Trunk-based, human-only commits** — human reviews all changes in IDE before committing

## Decision

Trunk-based development. Push directly to `main`. AI agents write code but never commit, push, or create branches.

## Rationale

- Small team — PR review overhead has no benefit when there's no second reviewer
- Human reviews changes in IDE before committing — maintains full control
- CI/CD on push to `main` provides automated quality gates (lint, typecheck, test, build)
- Simpler mental model: one branch, one truth

## Consequences

- No rollback via PR revert — must use `git revert` or force push
- CI failures go to `main` — broken builds are visible immediately
- SDD framework configured with `auto_commit: false` and `repository.enabled: false`
