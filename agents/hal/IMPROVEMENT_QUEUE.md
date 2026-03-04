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

### CCIS-RAPID-013 — Pre-mortem risk gate
- Trigger: avoidable execution failures in non-trivial tasks.
- Change: before execution, state top 2 risks, prevention steps, and fallback triggers.
- Expected impact: fewer predictable failures and faster recovery.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-014 — Prediction + calibration loop
- Trigger: over/under-confidence in recommendations.
- Change: attach success probability to key outcomes and update calibration after observed result.
- Expected impact: better decision quality and confidence calibration over time.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-015 — Pre-send self-evaluation gate
- Trigger: quality misses before user-visible delivery.
- Change: quick self-check on requirement coverage, contradictions, evidence/confidence clarity, and user burden.
- Expected impact: fewer missed requirements and clearer outputs.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-016 — Runbook-first for recurring operations
- Trigger: repeated ad-hoc handling of known operational patterns.
- Change: require runbook selection/update before execution for recurring classes.
- Expected impact: faster, safer, more consistent operations.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-017 — One-command recovery macros
- Trigger: multi-step recovery friction and manual sequencing errors.
- Change: use bundled recovery macros with built-in post-checks.
- Expected impact: shorter time-to-recovery and fewer missed steps.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-018 — Fast verification pack
- Trigger: weak/fragmented completion evidence after ops actions.
- Change: standard post-action verification pack (status + external check + proof artifact).
- Expected impact: stronger completion confidence and trust.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-019 — Best-next-action ranking
- Trigger: multi-option drift on strategic tasks.
- Change: rank candidate actions by expected value (impact × probability ÷ effort).
- Expected impact: better prioritization and faster goal progress.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-020 — Explicit trade-off optimizer
- Trigger: implicit speed/quality/risk decisions causing mismatch.
- Change: explicitly identify top trade-off and default to user-aligned choice.
- Expected impact: clearer decisions and fewer expectation mismatches.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-021 — Horizon planning + decision memo
- Trigger: strategic recommendations lacking sequencing clarity.
- Change: structure plans into Now/Next/Later and use objective-options-recommendation-risks-revisit trigger format.
- Expected impact: more actionable strategic guidance and better revisit discipline.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-022 — Weekly benchmark task set
- Trigger: unclear measurement of real capability gains over time.
- Change: execute a fixed benchmark task set weekly for apples-to-apples comparison.
- Expected impact: objective visibility into capability trend.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-023 — Automated retrospective summary
- Trigger: improvements not consistently distilled into actionable patches.
- Change: generate weekly summary of top wins, misses, and top 3 patch candidates.
- Expected impact: faster, more focused improvement cycles.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-024 — Capability scorecard + compound patch gate
- Trigger: patching without measurable impact tracking.
- Change: maintain scorecard (completion, first-pass success, loop rate, recovery time) and only promote patches with metric gain + no safety/trust regression.
- Expected impact: compounding measurable intelligence gains.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-025 — Autonomous execution tiers
- Trigger: ambiguity about when to execute directly vs confirm first.
- Change: classify actions into Tier A/B/C with explicit execution permissions and approval thresholds.
- Expected impact: higher throughput while preserving safety and control.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-026 — Parallel workstream orchestration
- Trigger: long sequential execution on decomposable tasks.
- Change: split independent tracks and run safely in parallel; merge into unified result.
- Expected impact: faster end-to-end completion.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-027 — Checkpointed long-run + override contract
- Trigger: reduced visibility/control during long tasks.
- Change: milestone checkpoint updates and strict pause/stop/reprioritize compliance with state handoff.
- Expected impact: better transparency and tighter human control.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-028 — Auto-priority patch queue
- Trigger: patch backlog growth without strict prioritization.
- Change: rank candidates by expected value and promote highest-impact low-risk first.
- Expected impact: faster net capability gain per cycle.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-029 — Safety/trust promotion gate
- Trigger: risk of optimizing speed at expense of reliability/clarity/control.
- Change: block promotions that regress safety, clarity, or user control.
- Expected impact: sustained trust while improving performance.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-030 — Auto-rollback + monthly consolidation
- Trigger: patch regressions and policy bloat over time.
- Change: auto-rollback on metric regression; monthly rule consolidation to remove duplicates/low-value rules.
- Expected impact: resilient long-term compounding with low policy entropy.
- Status: APPROVED + APPLIED
- Added: 2026-03-03

### CCIS-RAPID-034 — UI spec freeze gate
- Trigger: approved concept images drifting from final built UI.
- Change: require a concrete UI contract (tokens/components/layout rules) before implementation.
- Expected impact: higher fidelity between concept approval and shipped interface.
- Status: APPROVED + APPLIED
- Added: 2026-03-04

### CCIS-RAPID-035 — Mid-build visual checkpoint
- Trigger: visual mismatch discovered too late (post-deploy/user testing).
- Change: mandatory scaffold-stage visual review prior to final polish/deploy.
- Expected impact: earlier correction, fewer late UI rework cycles.
- Status: APPROVED + APPLIED
- Added: 2026-03-04

### CCIS-RAPID-036 — Pre-release visual parity blocker
- Trigger: deploy marked complete while UI differs materially from approved references.
- Change: require component parity checklist + desktop/mobile interaction parity before completion status.
- Expected impact: fewer “works but doesn’t match approved design” deliveries.
- Status: APPROVED + APPLIED
- Added: 2026-03-04
