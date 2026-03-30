# NZ Tax App — Build State

## Current stage
- Tranche 2 / Slice 5 complete (PIE income + tax credit refinement)
- Tranche 2 / Slice 6 complete (student loan treatment visibility)
- Tranche 2 / Slice 7 complete (tax already deducted refinement)
- Tranche 2 / Slice 8 complete (provisional tax threshold / residual-tax polish)
- Tranche 2 / Slice 9 complete (submission-ready export pack upgrade)
- Queue currently complete

## Current objective
Close out the Tranche 2 queue state cleanly and prepare the next tranche definition if Mat wants further refinement.

## Last completed milestones
- Slice 8 now uses the official provisional-tax baseline in the simplified model: modeled residual income tax above NZ$5,000 surfaces provisional-tax relevance, and the default estimate basis is the standard option uplift of 5%
- Review summaries, IR3 explanations, PDF export, and workspace UI now explain the residual-tax/provisional-tax relationship explicitly
- Slice 9 upgraded the export pack so CSV/PDF/JSON now carry review warnings/assumptions and a supporting-document checklist
- Local validation passed:
  - backend smoke test (`cd src/api && bash tests/smoke.sh`) succeeds
  - frontend build (`cd nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`) succeeds

## Recently completed slices

### Slice 8 — provisional tax threshold / residual-tax polish
- Added explicit provisional-tax status metadata to the calc summary
- Refined review warnings and plain-English explanation text to use the > NZ$5,000 residual income tax threshold and standard-option 5% uplift basis
- Added dedicated provisional-tax visibility in the workspace review UI and PDF export

### Slice 9 — submission-ready export pack upgrade
- Extended draft export CSV with review warnings, assumptions, and checklist rows
- Extended PDF sections to include review readiness and supporting-document checklist content
- Extended JSON export payload to include the supporting-document checklist

## Next tasks
1. If Mat wants the next tranche, define the next review/export or deployment slice explicitly
2. Otherwise keep this queue marked complete

## Known blockers
- No active technical blocker on the completed Tranche 2 queue
- Next work now depends on selecting the next tranche/slice beyond the currently defined queue

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && bash tests/smoke.sh`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
