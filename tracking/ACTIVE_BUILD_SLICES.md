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

### NZ Tax App / Tranche 2 / review summary + adjustments wiring
- agent: HAL / delegated coding path used earlier
- stage: implementing
- goal: add donation + PIE + student-loan adjustments wiring and surface review warnings in workspace summaries
- files touched:
  - `nz-tax-app/src/api/server.js`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/api/workspaces.ts`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/pages/WorkspaceDetail.tsx`
  - `nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend/src/pages/Workspaces.tsx`
- tests run: none proven yet in current thread
- commit: `5c89453` (`Add tranche 2 review summary and adjustments wiring`)
- what's next:
  1. run backend validation
  2. run frontend build
  3. inspect remaining adjustments UI capture gap
  4. continue next smallest Tranche 2 slice
- last updated: 2026-03-28

## Update rule
If Mat asks for a build update, check this file first before reconstructing state from memory/chat/git.
