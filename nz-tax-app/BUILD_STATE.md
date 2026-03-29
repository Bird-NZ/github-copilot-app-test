# NZ Tax App — Build State

## Current stage
- Tranche 2 / Slice 2D complete (warning-level evidence attachment)
- Stage 7 / Test complete for this slice (backend smoke + frontend build passed)
- Stage 10 / Closeout complete for this slice (local completion documented)

## Current objective
Begin the next smallest shippable Tranche 2 slice after warning-level evidence attachment.

## Last completed milestone
- Extended review warnings with warning-level evidence attachments sourced from existing uploaded documents/evidence links
- Kept document persistence unchanged while making the review payload more precise and backward-compatible
- Updated workspace warning cards to show supporting evidence chips directly inside warning surfaces
- Local validation passed:
  - backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
  - frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

## Next tasks
1. Decide whether warning-level evidence should become manually overridable per warning, not just inferred
2. Add targeted frontend tests for warning evidence rendering and evidence-link persistence
3. Evaluate whether the next precision step should be field-level IR3 evidence mapping for selected refs

## Known blockers
- No active blocker for Slice 2D closeout

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Definition of done for current slice
This slice is done when all of the following are true:
1. Review warnings can carry warning-level evidence attachments derived from current documents/evidence links
2. Existing document evidence-link storage remains unchanged and readable without migration work
3. Warning surfaces in the workspace show any attached supporting evidence
4. Backend smoke test and frontend build pass locally
5. Completion is documented and committed

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && bash tests/smoke.sh`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`

## Slice 2E closeout — field-level IR3 evidence mapping

### Completed
- IR3 Summary cards now show supporting evidence chips when uploaded/review-linked documents map directly to that IR3 field.
- Existing review evidence metadata is reused; no persistence or API shape migration was required.
- PAYE summaries now map to `IR3 11A` as well as `11B` / `11C`, tightening one common auto-link gap for field-level support.
- Frontend copy and chips distinguish auto vs manual evidence links at the field level.

### Local validation passed
- backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
- frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

### Deploy validation passed
- built and pushed frontend image `zdacrtaxdevaue.azurecr.io/frontend:ir3-field-evidence-20260329222053`
- updated Azure Container App `zd-ca-web-dev-aue`
- verified live bundle contains `Supporting evidence mapped to this field`

### Next tasks
1. Add targeted frontend tests for evidence flows
2. Consider manual override for warning-level evidence after test coverage exists
3. Continue tightening IR3 field mappings where document types are still broad

### Known blockers
- No active blocker for Slice 2E closeout

### Definition of done for current slice
1. IR3 Summary surfaces supporting evidence at the field level where `ir3Refs` exist
2. Existing review/document evidence-link data remains backward-compatible
3. PAYE evidence includes `IR3 11A` coverage
4. Backend smoke test and frontend build pass locally
5. Live frontend rollout is verified
6. Completion is documented and committed
