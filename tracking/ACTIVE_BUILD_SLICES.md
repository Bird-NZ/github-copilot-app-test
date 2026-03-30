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

### NZ Tax App / Tranche 5 / reviewer action queue
- lane: active software build
- agent: ClawDev
- stage: complete
- goal: turn the post–Tranche 4 draft into a reviewer-actionable handoff pack with one ordered queue for the next human actions instead of scattered blocker/warning/evidence-gap panels
- acceptance criteria:
  - [x] `reviewerActionQueue` added to review payload
  - [x] queue combines submission blockers, traceability follow-up, warnings, and assumptions
  - [x] action items include severity, title, detail, request text/area, and target tab where applicable
  - [x] workspace dashboard surfaces the queue in reviewer-facing wording
  - [x] IR3 Summary surfaces the queue in reviewer-facing wording
  - [x] export CSV/PDF/JSON carries reviewer action queue summary data
  - [x] queue exposes category-level counts for filing readiness / traceability / warnings / assumptions
  - [x] backend smoke validation passing in-thread
  - [x] frontend production build passing in-thread
- files touched:
  - `nz-tax-app/docs/backlog/TRANCHE5_REVIEWER_ACTION_QUEUE.md`
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
  1. checkpoint commit for Tranche 5 Slice 1 + Slice 2
  2. continue to Slice 3 if queued-item evidence-sufficiency wording is concrete enough to implement cleanly
- review notes:
  - Slice 1 removed the need for a reviewer to merge filing blockers, traceability follow-up, warnings, and assumptions mentally across multiple sections
  - Slice 2 added category counts so the reviewer can see what class of work dominates the remaining queue
  - Next queued work is still inside the same reviewer-actionability direction, but Slice 3 should only proceed if the evidence-sufficiency wording stays specific and avoids duplicative/noisy queue items
- commit: pending
- what's next:
  1. commit Tranche 5 Slice 1 + Slice 2 checkpoint
  2. decide whether Slice 3 should start immediately or remain queued
- last updated: 2026-03-30

## Update rule
If Mat asks for a build update, check this file first before reconstructing state from memory/chat/git.
