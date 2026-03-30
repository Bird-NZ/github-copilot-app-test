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

### NZ Tax App / Tranche 7 / handoff pack quality
- lane: active software build
- agent: ClawDev
- stage: complete
- goal: make reviewer→operator handoff explicit and low-friction by packaging closure state into a direct handoff checklist and aligned export/operator wording
- acceptance criteria:
  - [x] Tranche 7 queue doc created with ordered slices and acceptance logic
  - [x] reviewer queue payload includes handoff-pack status/summary/next-step/checklist fields
  - [x] checklist explicitly reports filing blockers, traceability gaps, high-risk warnings, and queue-workdown status
  - [x] workspace reviewer queue surfaces handoff-pack checklist and guidance
  - [x] backend smoke validation covers new handoff-pack payload fields
  - [x] export CSV/PDF handoff-pack summary fields align with workspace handoff-pack wording
- files touched:
  - `nz-tax-app/docs/backlog/TRANCHE7_HANDOFF_PACK_QUALITY.md`
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
- verification result:
  - reviewer surfaces now show a dedicated handoff-pack summary, next step, and checklist status lines
  - reviewer queue payload now emits handoff-pack readiness semantics for downstream export/operator alignment
- review notes:
  - Slice 1 intentionally focused on clarity/packaging leverage without widening tax-policy scope
  - Slice 2 carried the same semantics into export surfaces so operator packs read the same as workspace status
- commit: pending
- what's next:
  1. checkpoint commit for Tranche 7 Slice 1 + Slice 2
  2. start Tranche 7 Slice 3 (explicit reviewer final sign-off semantics)
- last updated: 2026-03-30

### NZ Tax App / Tranche 6 / reviewer closure flow
- lane: active software build
- agent: ClawDev
- stage: complete
- goal: turn the reviewer action queue from a static list into an operational closure workflow that tracks what has been worked off, what remains open, and what handoff context was recorded
- acceptance criteria:
  - [x] Tranche 6 queue doc created with ordered slices and acceptance logic
  - [x] reviewer actions can be marked resolved and reopened
  - [x] review payload distinguishes open vs resolved reviewer actions and exposes resolved counts
  - [x] workspace reviewer queue surfaces resolution controls and keeps resolved items out of the main open queue
  - [x] export CSV/PDF/JSON includes reviewer-action resolution summary
  - [x] resolved reviewer actions can carry an optional reviewer closure note
  - [x] resolved-item notes surface in app and export views
  - [x] audit trail captures reviewer action closure updates
  - [x] handoff-ready completion summary polish
  - [x] issue-resolution pack polish
  - [x] backend smoke validation passing in-thread
  - [x] frontend production build passing in-thread
- files touched:
  - `nz-tax-app/docs/backlog/TRANCHE6_REVIEWER_CLOSURE_FLOW.md`
  - `nz-tax-app/src/api/modules/workspaceStore.js`
  - `nz-tax-app/src/api/modules/reviewService.js`
  - `nz-tax-app/src/api/modules/exportService.js`
  - `nz-tax-app/src/api/modules/auditStore.js`
  - `nz-tax-app/src/api/server.js`
  - `nz-tax-app/src/api/tests/smoke.sh`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/api/workspaceFlows.ts`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/pages/WorkspaceDetail.tsx`
  - `nz-tax-app/BUILD_STATE.md`
  - `nz-tax-app/PROGRESS_LEDGER.md`
  - `tracking/ACTIVE_BUILD_SLICES.md`
- tests run:
  - `cd nz-tax-app/src/api && bash tests/smoke.sh`
  - `cd nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
- verification result:
  - reviewer queue now exposes explicit handoff status, closure summary, handoff blockers, shortlist, recently resolved items, and a remaining-issues pack
  - workspace and export surfaces separate unresolved handoff work from resolved history cleanly
- review notes:
  - Slice 3 made the app/export wording say whether the draft is handoff-blocked, still in review polish, or ready to hand off
  - Slice 4 grouped unresolved work into a concise pack so handoff consumers can skim what remains without rereading resolved history
- commit: pending
- what's next:
  1. checkpoint commit completed Tranche 6 queue
  2. define the next tranche only after confirming the next highest-leverage reviewer/filer workflow gap
- last updated: 2026-03-30

## Update rule
If Mat asks for a build update, check this file first before reconstructing state from memory/chat/git.
