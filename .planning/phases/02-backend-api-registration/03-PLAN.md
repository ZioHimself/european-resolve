---
plan_id: "03"
title: "CI/CD: GitHub Actions Deploy to Cloud Run"
phase: 2
wave: 2
depends_on: ["01"]
files_modified:
  - .github/workflows/deploy-backend.yml
  - backend/.env.example
autonomous: false
requirements_addressed: [API-01]
---

# Plan 03: CI/CD — GitHub Actions Deploy to Cloud Run

<objective>
Create GitHub Actions workflow that builds the backend Docker image, pushes to Artifact Registry, and deploys to Cloud Run on push to main (scoped to backend/ changes). Uses existing Workload Identity Federation setup from the dev-serhiy GCP project.
</objective>

<must_haves>
- GitHub Actions workflow triggers on push to main when backend/ files change
- Authenticates to GCP via Workload Identity Federation (no JSON keys)
- Builds and pushes Docker image to Artifact Registry
- Deploys to Cloud Run service
- Cloud Run service responds to health checks after deploy
- Separate from existing CI workflow (quality checks remain independent)

<truths>
- D-03: Deployment patterns from only-facts, adapted for Cloud Run
- D-04: Same GCP project (dev-serhiy), reuses WIF setup
- D-05: Cloud Run (not GKE)
- D-07: GitHub Actions in this repo, deploy on push to main, scoped to backend/ changes
</truths>
</must_haves>

<tasks>

<task id="03.1">
<title>Create deploy-backend workflow</title>
<read_first>
- .github/workflows/ci.yml (existing quality workflow)
- /Users/serhiy/dev/github/ziohimself/only-facts/.github/workflows/ci.yml (WIF auth pattern, Artifact Registry push pattern)
- .planning/phases/02-backend-api-registration/02-CONTEXT.md (D-04 GCP project, D-07 trigger scope)
</read_first>
<action>
Create `.github/workflows/deploy-backend.yml`:

**Trigger:** push to main, with path filter `backend/**`

**Jobs:**

1. `test-backend` — runs on ubuntu-latest:
   - Checkout
   - Setup Node 22
   - `cd backend && npm ci`
   - `cd backend && npx tsc --noEmit`

2. `deploy` — needs test-backend, runs on ubuntu-latest:
   - permissions: contents read, id-token write
   - Checkout
   - Authenticate to GCP: `google-github-actions/auth@v2` with `workload_identity_provider: ${{ vars.WIF_PROVIDER }}`, `service_account: ${{ vars.WIF_SERVICE_ACCOUNT }}`
   - Setup Cloud SDK: `google-github-actions/setup-gcloud@v2`
   - Configure Docker for Artifact Registry: `gcloud auth configure-docker ${{ vars.GCP_REGION }}-docker.pkg.dev --quiet`
   - Build image: `docker build -t ${{ vars.GCP_REGION }}-docker.pkg.dev/${{ vars.GCP_PROJECT }}/european-resolve/api:${{ github.sha }} backend/`
   - Push image
   - Deploy to Cloud Run: `google-github-actions/deploy-cloudrun@v2` with service `run-for-ukraine-api`, region from vars, image reference

**Repository variables needed** (document in backend/.env.example):
- `WIF_PROVIDER` — Workload Identity Federation provider (reused from only-facts)
- `WIF_SERVICE_ACCOUNT` — GCP service account for deployments
- `GCP_PROJECT` — `dev-serhiy`
- `GCP_REGION` — e.g., `europe-west1`
</action>
<acceptance_criteria>
- `.github/workflows/deploy-backend.yml` exists
- Workflow triggers on push to main with `paths: ['backend/**']`
- Uses `google-github-actions/auth@v2` with WIF (no JSON key)
- Uses `google-github-actions/deploy-cloudrun@v2` for deployment
- `test-backend` job runs typecheck before deploy
- Deploy job has `permissions: { contents: read, id-token: write }`
- Workflow does NOT affect existing `.github/workflows/ci.yml`
</acceptance_criteria>
</task>

<task id="03.2">
<title>Document environment setup</title>
<read_first>
- backend/src/config.ts (required env vars)
- .planning/phases/02-backend-api-registration/02-RESEARCH.md (env var table)
</read_first>
<action>
Create `backend/.env.example` documenting all runtime environment variables:

```
# Cloud Run sets this automatically
PORT=8080

# Google Sheets
SPREADSHEET_ID=your-spreadsheet-id-here

# CORS (comma-separated origins)
CORS_ORIGINS=https://european-resolve.org,http://localhost:3000

# Monobank jar URL for redirect
MONOBANK_JAR_URL=https://send.monobank.ua/jar/YOUR_JAR_ID

# Node environment
NODE_ENV=development
```

Add comment block at top explaining:
- Cloud Run service account needs Editor access on the spreadsheet
- Local dev uses `gcloud auth application-default login`
- CORS_ORIGINS must include the exact frontend origin (with protocol)
</action>
<acceptance_criteria>
- `backend/.env.example` lists all env vars from config.ts
- Comments explain service account setup and local dev auth
- File does NOT contain actual secret values
- `SPREADSHEET_ID`, `CORS_ORIGINS`, `MONOBANK_JAR_URL` are documented
</acceptance_criteria>
</task>

</tasks>

<verification>
- `.github/workflows/deploy-backend.yml` passes YAML lint
- Workflow references correct GitHub Actions (auth@v2, setup-gcloud@v2, deploy-cloudrun@v2)
- Path filter ensures workflow only runs on backend/ changes
- `backend/.env.example` documents all required variables
- Existing `.github/workflows/ci.yml` is unchanged
</verification>
