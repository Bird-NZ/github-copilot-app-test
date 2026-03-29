# NZ Tax App — Build State

## Current stage
- Tranche 2 / Slice 2G complete (evidence trail in audit tab readability)
- Tranche 2 / Slice 3 started (manual override for warning-level evidence)
- Queue currently blocked on a product-model decision for Slice 3 persistence semantics

## Current objective
Resolve the warning-override persistence model, then continue the ordered queue from manual warning-level evidence onward.

## Last completed milestone
- Audit events now surface readable labels/details for document evidence-link saves instead of raw action codes in the workspace audit tab
- Adjustment saves now summarise non-zero donation / PIE / student-loan values, making the audit trail more useful for evidence-review follow-up
- Existing audit filtering/search remains intact because the change stays inside label/detail enrichment
- Local validation passed:
  - frontend tests (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm test`) succeed
  - backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
  - frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

## Recently completed slices

### Slice 2F — targeted frontend tests for evidence flows
- Added a dedicated frontend evidence helper module so evidence-link selection/rendering logic is testable without page-level setup noise
- Added focused vitest coverage for auto/manual/none evidence-link selection, multi-link document overrides, payload generation, and evidence labels
- Kept existing Workspace Detail behaviour unchanged while making the evidence-flow contract explicit in tests
- Commit: `fb9073d` (`Add frontend evidence flow tests`)

### Slice 2E — field-level IR3 evidence mapping
- IR3 Summary cards now show supporting evidence chips when uploaded/review-linked documents map directly to that IR3 field
- Existing review evidence metadata is reused; no persistence or API shape migration was required
- PAYE summaries now map to `IR3 11A` as well as `11B` / `11C`

## Next tasks
1. Decide whether warning-level evidence should become manually overridable per warning, not just inferred
2. Evaluate whether the next precision step should be field-level IR3 evidence mapping for selected refs
3. Define the next explicit queued slice if the remaining backlog items are to continue automatically

## Known blockers
- No active technical blocker for Slice 2G
- Queue continuity is now limited by missing explicit next-slice definition after 2G unless one of the remaining backlog items is chosen as the next canonical slice

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && bash tests/smoke.sh`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm test`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
tend && npm test`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
