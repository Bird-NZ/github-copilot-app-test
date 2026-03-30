# NZ Tax App — Build State

## Current stage
- Tranche 3 / Slice 1 complete (explicit submission-readiness gate)
- Tranche 3 / Slice 2 complete (blocker-to-surface routing)
- Tranche 3 queue remains active

## Current objective
Keep tightening the filing-readiness path so the draft not only exposes blockers, but also routes the user directly to the surface that resolves each one.

## Last completed milestones
- Defined Tranche 3 as a filing-readiness queue focused on review/submission confidence
- Review payload now includes `submissionReadiness` with questionnaire completeness, applicable-document coverage, explicit blockers, and next actions
- Submission blockers now carry routing metadata so the UI can send users straight to Questionnaire, Documents, or IR3 Summary
- Workspace UI now surfaces submission readiness both at the top level and inside IR3 Summary, with action buttons on blockers
- Export CSV/PDF/JSON now carry submission blocker data as part of the review/export pack
- Local validation passed:
  - backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
  - frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

## Recently completed slices

### Tranche 3 / Slice 1 — explicit submission-readiness gate
- Added a new submission-readiness model to the review payload
- Derived explicit blockers from incomplete questionnaire state, applicable missing documents, and high-severity warnings
- Added user-facing next actions to make the review path obvious
- Included submission blockers in export outputs

### Tranche 3 / Slice 2 — blocker-to-surface routing
- Added per-blocker routing metadata in the review payload
- Added action buttons so blockers can jump users directly to Questionnaire, Documents, or IR3 Summary
- Reduced the gap between “problem detected” and “where to fix it”

## Next tasks
1. Start Tranche 3 / Slice 3: applicable-document precision across all review states
2. Then continue into review-ready export summary

## Known blockers
- No active technical blocker on Tranche 3 / Slice 2
- Slice 3 is defined but not yet implemented in this pass

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && bash tests/smoke.sh`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
