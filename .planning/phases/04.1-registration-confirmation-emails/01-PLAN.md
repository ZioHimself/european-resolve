---
phase: "04.1"
plan_id: "01"
title: "SMTP Deploy Config"
objective: "Add SMTP credentials to Cloud Run deployment so registration confirmation emails actually send in production"
wave: 1
depends_on: []
files_modified:
  - ".github/workflows/deploy-backend.yml"
autonomous: true
requirements_addressed: [ADMN-03]
---

# Plan 01: SMTP Deploy Config

## Objective

Wire SMTP credentials from GitHub Secrets into the Cloud Run deployment workflow. The email infrastructure (nodemailer transport, templates, locale files) was built in Phase 4 but is dead code in production because `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` are not passed as environment variables to Cloud Run. This plan fixes that gap.

## Tasks

<task id="01.1">
<title>Add SMTP env vars to Cloud Run deploy step</title>

<read_first>
- `.github/workflows/deploy-backend.yml` (current env_vars block at lines 62-66)
- `backend/src/config.ts` (SMTP config block at lines 27-35 — env var names to match)
- `backend/.env.example` (reference SMTP values)
</read_first>

<action>
In `.github/workflows/deploy-backend.yml`, add 5 SMTP environment variables to the `env_vars` block of the "Deploy to Cloud Run" step (lines 62-66). Use `secrets.*` (not `vars.*`) because `SMTP_PASS` is sensitive:

- `SMTP_HOST=${{ secrets.SMTP_HOST }}`
- `SMTP_PORT=${{ secrets.SMTP_PORT }}`
- `SMTP_USER=${{ secrets.SMTP_USER }}`
- `SMTP_PASS=${{ secrets.SMTP_PASS }}`
- `SMTP_FROM=${{ secrets.SMTP_FROM }}`

Append these after the existing `NODE_ENV=production` line in the `env_vars` multi-line string.
</action>

<acceptance_criteria>
- `.github/workflows/deploy-backend.yml` contains `SMTP_HOST=${{ secrets.SMTP_HOST }}` in the `env_vars` block
- `.github/workflows/deploy-backend.yml` contains `SMTP_PORT=${{ secrets.SMTP_PORT }}` in the `env_vars` block
- `.github/workflows/deploy-backend.yml` contains `SMTP_USER=${{ secrets.SMTP_USER }}` in the `env_vars` block
- `.github/workflows/deploy-backend.yml` contains `SMTP_PASS=${{ secrets.SMTP_PASS }}` in the `env_vars` block
- `.github/workflows/deploy-backend.yml` contains `SMTP_FROM=${{ secrets.SMTP_FROM }}` in the `env_vars` block
- YAML syntax is valid (no indentation errors)
</acceptance_criteria>
</task>

<task id="01.2">
<title>Document GitHub Secrets setup</title>

<read_first>
- `backend/.env.example` (SMTP reference values)
</read_first>

<action>
Add a comment block in `deploy-backend.yml` above the SMTP env vars documenting the 5 required GitHub Secrets and their expected values:

- `SMTP_HOST`: `smtp.mailbox.org`
- `SMTP_PORT`: `465`
- `SMTP_USER`: `info@european-resolve.org`
- `SMTP_PASS`: mailbox.org app password
- `SMTP_FROM`: `Run for Ukraine 2026 <info@european-resolve.org>`

This is a manual setup step — secrets must be added via GitHub repository Settings > Secrets and variables > Actions > Secrets.
</action>

<acceptance_criteria>
- `deploy-backend.yml` contains a comment referencing the 5 SMTP secrets required
- The comment references "Settings > Secrets and variables > Actions > Secrets"
</acceptance_criteria>
</task>

## Verification

```bash
# YAML syntax check
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-backend.yml'))"

# Verify SMTP vars present
grep -c "SMTP_" .github/workflows/deploy-backend.yml
# Expected: at least 5 matches (one per env var)
```

## must_haves

- SMTP credentials are passed to Cloud Run via GitHub Secrets
- Email infrastructure becomes functional in production (no more "SMTP not configured" warnings)
- Sensitive credentials use `secrets.*` not `vars.*`
