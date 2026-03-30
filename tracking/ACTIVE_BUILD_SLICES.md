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

### NZ Tax App / Tranche 4 / reviewer traceability handoff
- lane: active software build
- agent: ClawDev
- stage: complete
- goal: turn the post–Tranche 3 draft into a reviewer-traceable handoff pack with visible evidence coverage and clearer source precision on important IR3 fields
- acceptance criteria:
  - [x] structured key-field traceability summary added to review payload
  - [x] traceability includes field ref, label, value, source/note, evidence count, and trace status
  - [x] workspace IR3 Summary surfaces reviewer traceability coverage
  - [x] export CSV/PDF carries traceability summary for handoff
  - [x] backend smoke validation passing in-thread
  - [x] frontend production build passing in-thread
- files touched:
  - `nz-tax-app/docs/backlog/TRANCHE4_REVIEWER_TRACEABILITY_HANDOFF.md`
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
  1. checkpoint Slice 1
  2. continue into Slice 2 traceability gap surfacing
  3. stop only if a real product/runtime blocker appears
- review notes:
  - Tranche 4 was selected because reviewer trust/traceability is the tightest next leverage after live filing readiness
  - Slice 1 is complete and validated; Slice 2 is queued next
- commit: pending
- what's next:
  1. checkpoint commit for Slice 1
  2. continue into Slice 2 traceability gap surfacing
- last updated: 2026-03-30

## Update rule
If Mat asks for a build update, check this file first before reconstructing state from memory/chat/git.
