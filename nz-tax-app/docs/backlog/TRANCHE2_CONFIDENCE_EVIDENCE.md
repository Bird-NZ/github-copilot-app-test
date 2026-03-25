# Tranche 2 — Confidence, Deductions, and Evidence-Backed IR3 Review

## Product goal
Make the tax draft feel trustworthy enough to review and act on by improving deductions/adjustments, surfacing warnings/assumptions, linking evidence, and upgrading the export pack.

## Backlog

### T2-1 Deductions + adjustments model
- Add donation receipts input / totals
- Add student loan treatment visibility
- Add PIE income / deductions fields
- Improve treatment of tax already deducted
- Refine provisional tax logic / thresholds
- Extend IR3 mapping + calc summary for these adjustments

### T2-2 Review / confidence layer
- Add readiness checks for missing critical inputs
- Add warning cards for suspicious or incomplete values
- Distinguish assumed values vs confirmed values
- Add completion/confidence summary to workspace

### T2-3 Evidence-backed review
- Link uploaded documents to sections/figures
- Show which documents support which figures
- Expand audit trail into a usable evidence trail

### T2-4 Submission-ready export pack
- Improve final PDF layout
- Add summary cover page
- Add assumptions/warnings section
- Add supporting-doc checklist in export output

## Recommended build order
1. T2-1 Deductions + adjustments model
2. T2-2 Review / confidence layer
3. T2-3 Evidence-backed review
4. T2-4 Submission-ready export pack

## First shippable slice
- Add donation + PIE + student-loan data capture
- Extend IR3 calc/mapping summary
- Add first-pass review warnings endpoint/output
- Surface warnings in workspace summary
