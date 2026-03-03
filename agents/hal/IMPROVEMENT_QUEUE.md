# IMPROVEMENT_QUEUE.md

## Open proposals

### CCIS-FAST-001 — Micro-review on every meaningful task
- Trigger: task completion
- Change: 30–60s self-review and log with confidence
- Expected impact: faster learning capture
- Status: APPROVED + ACTIVE
- Added: 2026-02-15

### CCIS-FAST-002 — Daily patch bundle (max 3)
- Trigger: daily cycle
- Change: propose only highest-impact approved-candidate changes
- Expected impact: faster deployment without overload
- Status: APPROVED + ACTIVE
- Added: 2026-02-15

### CCIS-FAST-003 — 80/20 evidence gate
- Trigger: before promoting changes
- Change: 80% synthetic checks + 20% real evidence required
- Expected impact: speed with robustness
- Status: APPROVED + ACTIVE
- Added: 2026-02-15

### CCIS-FAST-004 — Lean digest guardrail
- Trigger: quality audit finding (overhead + workflow drift on simple outputs)
- Change: enforce low-context mode for simple asks, NO_REPLY fast-path when appropriate, skill preflight only when clearly applicable, and tool-necessity checks before tool use.
- Expected impact: faster responses, less unnecessary tool usage, improved consistency.
- Status: APPROVED + APPLIED
- Added: 2026-02-16

### CCIS-001 — Clarify market before unsuffixed ticker
- Trigger: User requests stock analysis with ticker lacking .AX/.NZ and no explicit market.
- Change: Ask "US, AU, or NZ?" before running.
- Expected impact: Avoid cross-market baseline errors.
- Status: APPROVED + APPLIED
- Added: 2026-02-15

### CCIS-002 — Ban annoying term in Bender persona
- Trigger: Group chat persona language complaints.
- Change: Do not use "meatbag".
- Expected impact: Better preference compliance.
- Status: APPROVED + APPLIED
- Added: 2026-02-15

### CCIS-003 — Improve report visual hierarchy
- Trigger: User feedback on readability/fit/appearance.
- Change: v3 best-of layout with better spacing, cards, framing.
- Expected impact: Better usability and fewer formatting complaints.
- Status: APPROVED + IN PROGRESS (v3 generated; awaiting final polish feedback)
- Added: 2026-02-15

### CCIS-RSI-REVIEWER-001 — Reviewer bot recursive self-improvement loop
- Trigger: User request to implement RSI for reviewer bot.
- Change: Added `reviewer_bot/` package with rubric, failure taxonomy, promotion gate policy, reviewer template, and weekly RSI analysis script.
- Expected impact: Auditable reviewer learning cycle, faster patch prioritization, safer promotions.
- Status: APPROVED + APPLIED
- Added: 2026-02-21

### CCIS-RAPID-001 — Preflight coverage gate for sparse evidence
- Trigger: low-evidence audits/analysis causing weak confidence and over-trust risk.
- Change: Require minimum evidence check before conclusions; auto-widen lookback and label LOW CONFIDENCE when sparse.
- Expected impact: fewer thin-evidence conclusions and clearer confidence signaling.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-002 — Mandatory incident trace on failures
- Trigger: repeat-loop risk during troubleshooting.
- Change: On error/blocker, report cause class + attempts + next path before requesting user action.
- Expected impact: less repetition, higher transparency, faster unblocking.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-003 — Done-proof gate before completion
- Trigger: partial completions or weak completion claims.
- Change: Require concrete proof artifact/state before declaring done.
- Expected impact: better completion integrity and trust.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-004 — Clarification decision gate
- Trigger: weak_clarification failures and user friction from unnecessary questions.
- Change: Ask clarification only when correctness/safety/irreversibility depends on missing info; otherwise proceed with bounded assumptions.
- Expected impact: fewer unnecessary clarification loops; faster first useful output.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-005 — Assumption contract + single focused question format
- Trigger: ambiguity handling quality inconsistency.
- Change: If proceeding, state one-line assumptions; if asking, ask one focused question with concrete options + recommended default.
- Expected impact: clearer decisions, lower cognitive load, improved user trust.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-006 — One-round clarification cap
- Trigger: multi-question interrogation patterns.
- Change: limit to one clarification round before delivering first tangible output.
- Expected impact: better momentum and reduced conversation drag.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-007 — Option ranking before execution
- Trigger: inconsistent approach selection on non-trivial tasks.
- Change: score 2–3 candidate paths by impact/speed/risk/reversibility and choose explicitly.
- Expected impact: higher-quality path choice and fewer dead-end attempts.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-008 — First-pass deliverable target
- Trigger: delays from over-optimization before showing value.
- Change: require a useful first output in the first execution cycle, then iterate.
- Expected impact: faster visible progress and better user feedback loops.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-009 — Built-in fallback ladder + confidence tags
- Trigger: slow pivots when dependencies fail or uncertainty is high.
- Change: define Plan A/B/C for dependency-heavy tasks and tag recommendations with confidence + primary uncertainty.
- Expected impact: quicker recovery, clearer decisions, better trust calibration.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-010 — Intent profile gate
- Trigger: response style/depth mismatch across different ask types.
- Change: classify each request (Quick Answer | Execute Task | Strategic Planning | Monitor/Report) and adapt style/depth automatically.
- Expected impact: higher relevance and lower response friction.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-011 — Proactive next-step recommendation
- Trigger: helpfulness plateau from purely reactive responses.
- Change: include one high-value recommended next action on substantive responses (unless user requests response-only mode).
- Expected impact: better momentum and improved outcome velocity.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-012 — Outcome delta closeout
- Trigger: weak visibility into actual progress.
- Change: after meaningful execution, close with What changed | What remains | Confidence.
- Expected impact: clearer progress tracking and better decision quality.
- Status: APPROVED + APPLIED
- Added: 2026-03-03
