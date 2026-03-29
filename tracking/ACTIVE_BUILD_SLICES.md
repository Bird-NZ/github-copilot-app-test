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
  - [ ] audit tab evidence trail readability improved and validated
  - [ ] next post-audit slice selected or exact blocker recorded
- files touched:
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/package.json`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/package-lock.json`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/vite.config.ts`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/pages/WorkspaceDetail.tsx`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/pages/workspaceEvidence.ts`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/pages/workspaceEvidence.test.ts`
  - `nz-tax-app/src/api/modules/auditStore.js`
- tests run:
  - `cd nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm test`
  - `cd nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
  - `cd nz-tax-app/src/api && bash tests/smoke.sh`
- verification plan:
  1. checkpoint Slice 2F commit cleanly
  2. checkpoint audit-trail slice cleanly
  3. determine next queue slice from remaining Tranche 2 backlog or record blocker
- review notes:
  - Slice 2F is complete and committed
  - audit trail readability slice is complete and validated locally
- commit: in progress
- what's next:
  1. commit audit trail slice
  2. determine next smallest Tranche 2 slice
  3. record exact blocker if no next slice is explicitly defined
- last updated: 2026-03-30

## Update rule
If Mat asks for a build update, check this file first before reconstructing state from memory/chat/git.
