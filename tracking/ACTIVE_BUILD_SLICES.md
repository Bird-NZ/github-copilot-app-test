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

### NZ Tax App / Tranche 2 / evidence confidence queue
- lane: active software build
- agent: ClawDev
- stage: complete
- goal: finish the evidence-confidence follow-on slices after IR3 field evidence mapping
- acceptance criteria:
  - [x] targeted frontend evidence-flow tests added and passing
  - [x] backend smoke validation passing in-thread
  - [x] frontend production build passing in-thread
  - [x] audit tab evidence trail readability improved and validated
  - [x] warning-level evidence overrides persisted per warning code
  - [x] donation receipts totals + calc wiring implemented and validated
  - [x] PIE income + tax credit refinement implemented and validated
  - [x] student loan treatment visibility implemented and validated
  - [x] tax already deducted refinement implemented and validated
  - [x] provisional tax threshold / residual-tax polish implemented and validated
  - [x] submission-ready export pack upgrade implemented and validated
- files touched:
  - `nz-tax-app/src/api/modules/calcEngine.js`
  - `nz-tax-app/src/api/modules/exportService.js`
  - `nz-tax-app/src/api/modules/ir3Service.js`
  - `nz-tax-app/src/api/modules/reviewService.js`
  - `nz-tax-app/src/api/server.js`
  - `nz-tax-app/src/api/tests/smoke.sh`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/api/workspaceFlows.ts`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/pages/WorkspaceDetail.tsx`
  - `nz-tax-app/BUILD_STATE.md`
  - `tracking/ACTIVE_BUILD_SLICES.md`
- tests run:
  - `cd nz-tax-app/src/api && bash tests/smoke.sh`
  - `cd nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
- verification plan:
  1. keep the queue marked complete unless a new slice is defined
  2. start the next tranche only after the next explicit queue decision
- review notes:
  - Slice 8 and Slice 9 both landed locally and validated cleanly
  - The currently defined overnight queue is exhausted
- commit: pending
- what's next:
  1. commit the completed queue checkpoint
  2. only open a new active slice when the next tranche is defined
- last updated: 2026-03-30

## Update rule
If Mat asks for a build update, check this file first before reconstructing state from memory/chat/git.
