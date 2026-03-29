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
- stage: implementing
- goal: finish the evidence-confidence follow-on slices after IR3 field evidence mapping
- acceptance criteria:
  - [x] targeted frontend evidence-flow tests added and passing
  - [x] backend smoke validation passing in-thread
  - [x] frontend production build passing in-thread
  - [x] audit tab evidence trail readability improved and validated
  - [x] warning-level evidence overrides persisted per warning code
  - [x] donation receipts totals + calc wiring implemented and validated
  - [ ] PIE income + tax credit refinement implemented and validated
- files touched:
  - `nz-tax-app/src/api/modules/documentStore.js`
  - `nz-tax-app/src/api/modules/mappingEngine.js`
  - `nz-tax-app/src/api/modules/reviewService.js`
  - `nz-tax-app/src/api/modules/auditStore.js`
  - `nz-tax-app/src/api/server.js`
  - `nz-tax-app/src/api/tests/smoke.sh`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/api/workspaceFlows.ts`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/pages/WorkspaceDetail.tsx`
- tests run:
  - `cd nz-tax-app/src/api && bash tests/smoke.sh`
  - `cd nz-tax-app/src/api && bash tests/failure.sh`
  - `cd nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
- verification plan:
  1. inspect current PIE income/tax-credit handling gaps
  2. implement the smallest refinement that improves calc/review trustworthiness
  3. validate and checkpoint Slice 5
- review notes:
  - Slice 3 is complete and committed as per-warning-code persistence
  - Slice 4 is complete locally and ready to checkpoint
  - the next ordered slice is PIE income + tax credit refinement
- commit: `07cf980` (`Add per-warning evidence overrides`)
- what's next:
  1. checkpoint Slice 4 commit cleanly
  2. inspect PIE treatment in calc/review/export copy
  3. continue the queue unless a real blocker appears
- last updated: 2026-03-30

## Update rule
If Mat asks for a build update, check this file first before reconstructing state from memory/chat/git.
