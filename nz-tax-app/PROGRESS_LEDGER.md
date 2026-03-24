# NZ Tax App — Progress Ledger

Append-only ledger for active build work.

## Rules
- Add an entry before every major command batch, long-running build, deploy, or rollout wait.
- Add an entry after each meaningful result, milestone, or status change.
- Each entry must include:
  - timestamp
  - what changed
  - next action
  - status
  - next update due by
- Treat missing ledger updates during active build work as a workflow defect.

---

## 2026-03-24

- 20:58 NZDT
  - What changed: Added mandatory progress-ledger system to stop silent build stretches and make updates part of execution, not optional memory.
  - Next action: Update BUILD_STATE to reference the ledger, then continue the next 5-feature tax app batch under this system.
  - Status: In Progress
  - Next update due by: 21:03 NZDT

- 20:59 NZDT
  - What changed: Persistence + dashboard slice is already live and committed. Current next feature batch remains:
    1. questionnaire autosave feedback + last-saved indicator
    2. additional income types beyond PAYE
    3. document upload inside workspace
    4. audit trail tab
    5. export/download usability improvements
  - Next action: Re-anchor BUILD_STATE to require ledger usage, then begin feature 1 + 2 implementation.
  - Status: In Progress
  - Next update due by: 21:04 NZDT

- 21:00 NZDT
  - What changed: BUILD_STATE now enforces PROGRESS_LEDGER usage as a required gate before/after major command batches.
  - Next action: Inspect backend/frontend income and questionnaire flows, then implement autosave feedback and additional income types.
  - Status: In Progress
  - Next update due by: 21:05 NZDT

- 21:04 NZDT
  - What changed: Feature 1 + 2 passed local build validation. Workspace UI now includes questionnaire autosave feedback plus income type support for PAYE / interest / dividends / other.
  - Next action: Build and deploy a fresh frontend revision, then verify the live bundle reflects the new UI.
  - Status: In Progress
  - Next update due by: 21:09 NZDT

- 21:22 NZDT
  - What changed: Live frontend image build for feature pair 1 + 2 completed successfully and was pushed to ACR.
  - Next action: Roll a fresh frontend revision and verify autosave + additional income-type UI in the public app.
  - Status: In Progress
  - Next update due by: 21:27 NZDT

- 21:24 NZDT
  - What changed: New frontend revision inc212224 is live but still activating; public bundle already exposes part of the new autosave UI.
  - Next action: Wait for healthy status and re-check for the full autosave + income-type string set.
  - Status: In Progress
  - Next update due by: 21:29 NZDT
