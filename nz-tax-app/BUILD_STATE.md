# NZ Tax App — Build State

## Current stage
- Tranche 4 / Slice 1 complete (key-field traceability matrix)
- Tranche 4 / Slice 2 queued (traceability gap surfacing)
- Tranche 3 queue complete and live

## Current objective
Tranche 4 reviewer traceability handoff is now active. The draft already exposes filing readiness; this tranche strengthens reviewer trust by making important IR3 fields easier to trace back to explanation/source text and attached supporting evidence across app and export surfaces.

## Last completed milestones
- Defined Tranche 4 as a reviewer-traceability queue focused on trust, source precision, and handoff quality after live filing-readiness work
- Review payload now includes `traceability` for important IR3 fields with field ref, label, current value, note/source text, evidence count, and trace status
- Workspace IR3 Summary now shows a reviewer-traceability overview so a human can quickly see evidence coverage across key fields
- Export CSV/PDF/JSON now carry reviewer-traceability summary data as part of the handoff pack
- Tranche 3 remains complete and live: filing blockers, routing, applicable-document precision, export summary, and final human-review checklist are all in place
- Local validation passed:
  - backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
  - frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

## Recently completed slices

### Tranche 4 / Slice 1 — key-field traceability matrix
- Added a structured reviewer-traceability model to the review payload for important IR3 fields
- Included explanation/source text, evidence counts, and trace status per key field
- Surfaced a reviewer-traceability overview inside IR3 Summary
- Added reviewer-traceability summary output to CSV/PDF handoff surfaces

## Next tasks
1. Tranche 4 / Slice 2 — surface explicit traceability gaps for explained-only vs evidenced fields
2. Tranche 4 / Slice 3 — export reviewer follow-up pack for missing evidence on important fields

## Known blockers
- No active technical blocker in Tranche 4 Slice 1
- Slice 2 is queued, not blocked

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && bash tests/smoke.sh`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
