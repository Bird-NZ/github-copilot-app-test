# NZ Tax App — Build State

## Current stage
- Tranche 3 / Slice 1 complete (explicit submission-readiness gate)
- Tranche 3 queue is now active

## Current objective
Move the app from a strong draft/export state into explicit filing-readiness flow so users can see whether the draft is ready for final human review and exactly what still blocks submission preparation.

## Last completed milestones
- Defined Tranche 3 as a filing-readiness queue focused on review/submission confidence instead of adding another broad product area
- Review payload now includes `submissionReadiness` with questionnaire completeness, applicable-document coverage, explicit blockers, and next actions
- Workspace UI now surfaces submission readiness both at the top level and inside IR3 Summary
- Export CSV/PDF/JSON now carry submission blocker data as part of the review/export pack
- Local validation passed:
  - backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
  - frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

## Recently completed slices

### Tranche 3 / Slice 1 — explicit submission-readiness gate
- Added a new submission-readiness model to the review payload
- Derived explicit blockers from incomplete questionnaire state, applicable missing documents, and high-severity warnings
- Added user-facing next actions to make the review path obvious
- Surfaced the new readiness summary in the workspace dashboard and IR3 Summary
- Included submission blockers in export outputs

## Next tasks
1. Start Tranche 3 / Slice 2: blocker-to-surface routing so each blocker points clearly to the tab or action that resolves it
2. Then tighten applicable-document precision and review-ready export summarisation

## Known blockers
- No active technical blocker on Tranche 3 / Slice 1
- Next slice is clear and queueable

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && bash tests/smoke.sh`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
