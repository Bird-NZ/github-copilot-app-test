# NZ Tax App — Overnight Build Queue (2026-03-29)

Mode locked by Mat:
- Deploy policy: code + deploy continuously
- Reporting cadence: completion only unless blocked
- Push policy: yes push
- Priority: follow recommended top-10 order

## Operating rules
For each slice:
1. implement
2. validate locally
3. commit
4. deploy if user-visible / safe to roll
5. verify deployment
6. push
7. continue to next slice

Only stop for:
- missing credentials / permissions / approvals
- a real product decision that changes build direction
- a hard runtime/tool failure with no viable workaround
- a deploy risk likely to break the live app

## Ordered queue
1. Targeted frontend tests for evidence flows
2. Manual override for warning-level evidence
3. Donation receipts totals + calc wiring
4. PIE income + tax credit refinement
5. Student loan treatment visibility
6. Tax already deducted refinement
7. Evidence trail in audit tab
8. Submission-ready PDF upgrade
9. Export pack with assumptions / warnings / supporting-doc checklist

## Current starting point
Latest completed slices:
- Tranche 2 / Slice 5 — PIE income + tax credit refinement
- Tranche 2 / Slice 6 — student loan treatment visibility
- Tranche 2 / Slice 7 — tax already deducted refinement

## Immediate next slice
- Tranche 2 / Slice 8 — provisional tax threshold / residual-tax polish
