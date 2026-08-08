---
phase: 07-add-august-23-run-for-ukraine-event-to-events-listing-surfac
plan: 01
type: execute
wave: 0
depends_on: []
files_modified:
  - vitest.config.ts
autonomous: true
requirements:
  - EVNT-04
must_haves:
  truths:
    - "npm test discovers and runs events-page.spec.tsx BDD suite (prerequisite for D-15, D-22 BDD gates)"
  artifacts:
    - path: vitest.config.ts
      provides: Vitest include pattern for *.spec.tsx
      contains: "src/**/*.spec.{ts,tsx}"
  key_links:
    - from: npm test
      to: src/__tests__/events-page.spec.tsx
      via: vitest include glob
      pattern: "events-page\\.spec"
---

<objective>
Fix Vitest configuration so `*.spec.tsx` BDD tests run under `npm test`.

Purpose: `events-page.spec.tsx` is excluded today — Phase 7 TDD work on EventCard link behavior and Upcoming badge (D-22–D-26) cannot gate CI without this Wave 0 fix.
Output: Updated `vitest.config.ts` with spec suffix in include array.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-CONTEXT.md
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-RESEARCH.md
@.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-VALIDATION.md
@.planning/codebase/TESTING.md
@vitest.config.ts

<interfaces>
Current vitest.config.ts test.include (line 10):
```typescript
include: ["src/**/*.test.{ts,tsx}", "backend/src/**/*.test.ts"],
```

Only `src/__tests__/events-page.spec.tsx` uses `.spec.tsx` suffix today. Extend include — do not rename the file.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add *.spec.tsx to Vitest include pattern</name>
  <files>vitest.config.ts</files>
  <read_first>
    - vitest.config.ts (current include array)
    - .planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-RESEARCH.md (Pitfall 1: BDD tests not running in CI)
    - .planning/codebase/TESTING.md (BDD test file naming)
  </read_first>
  <action>
    In vitest.config.ts, extend the test.include array to add `"src/**/*.spec.{ts,tsx}"` as a second frontend entry. Keep existing `"src/**/*.test.{ts,tsx}"` and `"backend/src/**/*.test.ts"` entries unchanged. Do not remove or rename any test files.
  </action>
  <acceptance_criteria>
    - vitest.config.ts include array contains exactly three patterns: test.ts(x), spec.ts(x), backend test.ts
    - No other vitest config keys modified
  </acceptance_criteria>
  <verify>
    <automated>grep -v '^#' vitest.config.ts | grep -c 'src/\*\*/\*.spec\.\{ts,tsx\}'</automated>
  </verify>
  <done>Spec suffix glob present in vitest.config.ts</done>
</task>

<task type="auto">
  <name>Task 2: Verify BDD suite is discoverable by npm test</name>
  <files>vitest.config.ts</files>
  <read_first>
    - src/__tests__/events-page.spec.tsx (confirms file exists and uses describeFeature)
    - vitest.config.ts (after Task 1 edit)
  </read_first>
  <action>
    Run Vitest against events-page.spec.tsx and confirm the file is discovered (tests may pass or fail — discovery is the gate). Then run full npm test and confirm test count increases versus pre-change baseline (existing BDD scenarios should execute).
  </action>
  <acceptance_criteria>
    - `npx vitest run src/__tests__/events-page.spec.tsx -x` reports test files found (not "No test files found")
    - `npm test` completes without config errors
    - events-page BDD scenarios appear in npm test output
  </acceptance_criteria>
  <verify>
    <automated>npx vitest run src/__tests__/events-page.spec.tsx -x</automated>
  </verify>
  <done>BDD spec file runs under Vitest; Wave 0 complete for Plan 02 TDD work</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| dev→test runner | Vitest config controls which files execute in CI |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-01 | Tampering | vitest.config.ts | accept | Config change is dev-controlled; no runtime user input |
| T-07-SC | Tampering | npm/pip/cargo installs | accept | No new packages in this plan |

</threat_model>

<verification>
- vitest.config.ts includes spec glob
- `npx vitest run src/__tests__/events-page.spec.tsx -x` discovers and runs scenarios
- `npm test` passes with expanded test count
</verification>

<success_criteria>
- Wave 0 gap closed: BDD layer executable via npm test
- Plan 02 can add failing link-behavior and Upcoming badge scenarios that CI will enforce
</success_criteria>

<output>
Create `.planning/phases/07-add-august-23-run-for-ukraine-event-to-events-listing-surfac/07-01-SUMMARY.md` when done
</output>
