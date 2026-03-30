# NZ Tax App — Build State

## Current stage
- Tranche 5 / Slice 1 complete (unified reviewer action queue)
- Tranche 5 / Slice 2 complete (completion-aware grouping and counts)
- Tranche 4 queue complete and live
- Tranche 3 queue complete and live
- Tranche 2 queue complete and live

## Current objective
Tranche 5 reviewer action queue is now active. After filing readiness and reviewer traceability went live, the next highest-leverage step is to make the handoff pack easier for a human reviewer to act on without mentally merging blockers, warnings, assumptions, and evidence gaps across multiple panels.

## Last completed milestones
- Defined Tranche 5 as a reviewer-actionability queue focused on handoff completion, evidence sufficiency, and next-step clarity after Tranche 4 traceability work
- Review payload now includes `reviewerActionQueue`, combining open submission blockers, traceability follow-up items, review warnings, and assumptions into one ordered queue
- Workspace dashboard and IR3 Summary now surface the reviewer action queue so the next reviewer request/action is visible in one place
- Reviewer action queue now includes category-level counts so a reviewer can see whether the remaining work is mostly filing readiness, traceability, warnings, or assumptions
- Export CSV/PDF/JSON now carry the reviewer action queue headline, category counts, and queued action lines as part of the handoff pack
- Existing filing-readiness and reviewer-traceability surfaces remain intact
- Local validation passed:
  - backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
  - frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

## Recently completed slices

### Tranche 5 / Slice 1 — unified reviewer action queue
- Added a structured `reviewerActionQueue` model to the review payload
- Combined submission blockers, traceability follow-up items, review warnings, and assumptions into one ordered reviewer-facing queue
- Surfaced the queue in dashboard and IR3 Summary
- Added reviewer action queue output to CSV/PDF handoff surfaces

### Tranche 5 / Slice 2 — completion-aware grouping and counts
- Added per-category queue counts for filing readiness, traceability, review warnings, and assumptions
- Surfaced those counts in the workspace queue summary chips
- Added category-count rows/details to export surfaces so the handoff pack stays aligned with the app

## Next tasks
1. Tranche 5 / Slice 3 — evidence-sufficiency emphasis on queued items
2. Tranche 5 / Slice 4 — handoff-ready shortlist polish

## Known blockers
- No active technical blocker in Tranche 5 through Slice 2
- Slice 3 is queued, not blocked

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && bash tests/smoke.sh`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
