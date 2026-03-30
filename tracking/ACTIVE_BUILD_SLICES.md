# Active Build Slices

Purpose: make current software-work status queryable quickly without reconstructing it from chat.

Update this file when a meaningful build slice starts, changes stage, completes, or blocks.

## Status legend
- delegated
- implementing
- testing
- complete
- blocked

## Current slices

### NZ Tax App / Tranche 3 / filing readiness queue
- lane: active software build
- agent: ClawDev
- stage: implementing
- goal: turn the post–Tranche 2 draft into an explicit filing-readiness workflow with visible blockers, next actions, and reviewer-friendly handoff state
- acceptance criteria:
  - [x] submission-readiness model added to review payload
  - [x] workspace surfaces submission-readiness state clearly
  - [x] export path carries submission blocker data
  - [x] blocker-to-surface routing added
  - [x] backend smoke validation passing in-thread
  - [x] frontend production build passing in-thread
  - [x] applicable-document precision tightened across all review states
  - [ ] reviewer-friendly filing summary completed in export pack
- files touched:
  - `nz-tax-app/docs/backlog/TRANCHE3_FILING_READINESS.md`
  - `nz-tax-app/src/api/modules/reviewService.js`
  - `nz-tax-app/src/api/modules/exportService.js`
  - `nz-tax-app/src/api/tests/smoke.sh`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/api/workspaceFlows.ts`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/pages/WorkspaceDetail.tsx`
  - `nz-tax-app/BUILD_STATE.md`
  - `nz-tax-app/PROGRESS_LEDGER.md`
  - `tracking/ACTIVE_BUILD_SLICES.md`
- tests run:
  - `cd nz-tax-app/src/api && bash tests/smoke.sh`
  - `cd nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
- verification plan:
  1. checkpoint Slices 1-2
  2. continue into Slice 3 applicable-document precision
  3. stop only if a real product/runtime blocker appears
- review notes:
  - Tranche 3 was selected because review/submission confidence is the tightest next leverage after Tranche 2
  - Slices 1 and 2 are complete and validated; queue remains active
- commit: pending
- what's next:
  1. checkpoint commit for Slice 2
  2. start Slice 3 applicable-document precision
- last updated: 2026-03-30

## Update rule
If Mat asks for a build update, check this file first before reconstructing state from memory/chat/git.
