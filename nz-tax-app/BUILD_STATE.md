# NZ Tax App — Build State

## Current stage
- Tranche 2 / Slice 2A complete (evidence-backed review foundations)
- Stage 7 / Test complete for this slice (backend tests + frontend build passed)
- Stage 10 / Closeout complete for this slice (local completion documented)

## Current objective
Begin the next smallest shippable Tranche 2 slice after evidence-backed review foundations.

## Last completed milestone
- Extended review evidence payloads so linked documents now include:
  - `documentId`
  - `documentType`
  - review `section`
  - related `ir3Refs`
  - `uploadedAt`
  - `summaryKey`
- Surfaced evidence-backed review UI in workspace detail:
  - uploaded documents now show when they support a review area
  - IR3 Summary now includes a Supporting evidence card
- Local validation passed:
  - backend tests (`npm test`) succeed
  - frontend build (`npm run build`) succeeds

## Next tasks
1. Add user-editable evidence linking if review needs manual overrides or multiple document-to-figure mappings
2. Expand evidence beyond doc-type heuristics into figure-level or warning-level links
3. Add targeted frontend tests for evidence/review rendering when this area is touched again

## Known blockers
- No active blocker for Slice 2A closeout

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Definition of done for current slice
This slice is done when all of the following are true:
1. Adjustments fields are editable in workspace UI and persist via API
2. Review warnings are visible in workspace UI with severity cues
3. IR3 Summary shows readiness + assumptions/warnings context
4. Frontend build passes locally
5. Completion is documented and committed

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
