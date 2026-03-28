# NZ Tax App — Build State

## Current stage
- Tranche 2 / Slice 2C complete (one-to-many evidence links)
- Stage 7 / Test complete for this slice (backend smoke + frontend build passed)
- Stage 10 / Closeout complete for this slice (local completion documented)

## Current objective
Begin the next smallest shippable Tranche 2 slice after one-to-many evidence links.

## Last completed milestone
- Expanded document evidence overrides from one-to-one into one-to-many manual links
- Persisted normalized `evidenceLinks` arrays while keeping old single-link records readable
- Updated review generation so one document can now support multiple review areas in the IR3 Summary
- Reworked the Documents tab control into a multi-select override that still supports auto-link and exclude modes
- Local validation passed:
  - backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
  - frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

## Next tasks
1. Expand manual evidence controls from review areas into field-level or warning-level links
2. Add targeted frontend tests for evidence-link rendering and override persistence
3. Decide whether evidence links should capture user notes or confidence rationale per link

## Known blockers
- No active blocker for Slice 2C closeout

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Definition of done for current slice
This slice is done when all of the following are true:
1. A single document can be manually linked to multiple review areas
2. Existing single-link evidence data remains readable without migration work
3. Documents and IR3 Summary both surface the resulting multiple evidence links
4. Backend smoke test and frontend build pass locally
5. Completion is documented and committed

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && bash tests/smoke.sh`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
