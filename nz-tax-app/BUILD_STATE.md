# NZ Tax App — Build State

## Current stage
- Tranche 2 / Slice 2A complete (evidence-backed review foundations)
- Stage 7 / Test complete for this slice (backend tests + frontend build passed)
- Stage 10 / Closeout complete for this slice (local completion documented)

## Current objective
Begin the next smallest shippable Tranche 2 slice after user-editable evidence-link overrides.

## Last completed milestone
- Added per-document manual evidence-link controls in the Documents tab:
  - keep automatic mapping
  - manually link a document to a review area
  - explicitly remove a document from review evidence
- Persisted evidence-link overrides on document records and exposed evidence-link options from the API
- Updated review/export payloads so evidence items now show whether they were linked automatically or manually
- Surfaced manual-vs-auto link state in both Documents and IR3 Summary
- Local validation passed:
  - backend smoke test (`bash tests/smoke.sh`) succeeds
  - frontend build (`npm run build`) succeeds

## Next tasks
1. Allow one document to support multiple review areas if evidence needs one-to-many mapping
2. Expand manual evidence controls from review areas into field-level or warning-level links
3. Add targeted frontend tests for evidence-link rendering and override persistence

## Known blockers
- No active blocker for Slice 2B closeout

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
