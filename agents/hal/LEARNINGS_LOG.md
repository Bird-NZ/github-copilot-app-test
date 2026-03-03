# LEARNINGS_LOG.md

## 2026-02-15 — Initial CCIS run

### Learned
1. Ambiguous tickers caused market confusion risk.
2. A single baseline set was insufficient for NZ/AU/US use cases.
3. User preference compliance (persona wording) needs strict hard rules.
4. Report utility improved when score + context + readability are combined.

### Adapted
1. Implemented market-specific baselines (US/AU/NZ).
2. Added strict ticker market disambiguation behavior.
3. Added language constraints for Bender persona.
4. Built and activated v2; started v3 visual redesign.

### Expected impact
- Fewer wrong-market analyses.
- Better trust and preference adherence.
- Faster interpretation of report outputs.

## 2026-02-16 — Lean execution refinement

### Learned
1. Simple tasks were incurring unnecessary overhead from extra context/tooling.
2. Review quality stayed good, but consistency/speed suffered from workflow drift.

### Adapted
1. Added lean digest guardrail: low-context default for simple asks.
2. Enforced NO_REPLY fast-path when no meaningful user-visible output is needed.
3. Added explicit tool-necessity and skill-preflight checks.
4. Kept FAST mode gated checkpoints for risk/ambiguity control.

### Expected impact
- Faster turnaround on lightweight requests.
- Lower tool-call noise and less user-facing friction.
- Better consistency without sacrificing safety.

## 2026-02-22 — Completion-discipline correction

### Learned
1. I can prematurely stop after partial setup (e.g., scheduling RSI) without verifying end-to-end completion (log production + confirmed writes).
2. User expectation is explicit: complete tasks fully in one pass unless there is a genuine high-security blocker.

### Adapted
1. Added an execution rule: for implementation tasks, finish with end-to-end verification of the requested outcome (not just configuration changes).
2. Added a mandatory completion checklist step: **configured -> executed -> validated artifact exists -> reported proof**.
3. Enabled and verified automatic reviewer JSONL log writing so RSI has real daily input.

### Expected impact
- Fewer partial completions and fewer user follow-up corrections.
- Higher trust via visible proof of done.
- Faster iterative improvement because feedback loops are actually closed.

## 2026-03-01 — Restart completeness correction

### Learned
1. Restarting only the local app process can leave prior internet access broken when tunnel/proxy layers are not restored.
2. User expectation is explicit: restart the whole previously running stack, not isolated components.

### Adapted
1. Added a restart rule: when a service was previously internet-reachable, bring up app + exposure layer together.
2. Added a verification step before reporting done: confirm both local health and external/public reachability.

### Expected impact
- Fewer "it works locally but not publicly" regressions.
- More reliable operational restarts with no missing layers.

## 2026-03-02 — Pairing-required loop correction (messaging)

### Learned
1. `pairing required` can be caused by gateway device-scope upgrade/pending device approval, not only WhatsApp channel unlinking.
2. Repeatedly asking the user to re-pair WhatsApp without checking pending device approvals creates unnecessary loops and frustration.

### Adapted
1. Added a mandatory triage rule: on `gateway closed (1008): pairing required`, check `openclaw devices list` immediately.
2. If there is a pending request for this agent, approve it first, then retry send before requesting user-side re-pair.
3. Escalate to user re-pair steps only when device approval does not clear the error.

### Expected impact
- Fewer repeated user-side reconnect loops.
- Faster recovery for outbound messaging failures.
- Better trust through issue ownership and direct remediation.

## 2026-03-03 — Rapid Bundle v1 activation

### Learned
1. Conservative rollout wording can feel like delay when user asks for immediate capability gains.
2. High-confidence quality upgrades should be applied same-day, then validated live.

### Adapted
1. Activated Rapid Mode override with same-day patch behavior.
2. Applied three immediate gates: preflight coverage, mandatory incident trace, and done-proof closeout.
3. Set 24h delta reporting with immediate rollback-on-regression.

### Expected impact
- Faster visible improvements with lower user friction.
- Fewer repeated loops and clearer failure handling.
- Higher trust in completion claims via explicit proof.

## 2026-03-03 — Rapid Bundle v2 (clarification quality)

### Learned
1. Weak clarification is a top recurring failure mode and can feel like avoidable drag.
2. Multiple broad questions before first output reduce momentum and perceived usefulness.

### Adapted
1. Added clarification decision gate: only ask when correctness/safety/irreversibility depends on missing info.
2. Added assumption contract: proceed with bounded assumptions and state them briefly.
3. Standardized question format: one focused question with concrete options + recommended default.
4. Added one-round clarification cap before first deliverable.

### Expected impact
- Fewer unnecessary questions and less conversational friction.
- Faster first useful output under ambiguity.
- Better quality/consistency in necessary clarification asks.

## 2026-03-03 — Rapid Bundle v3 (execution intelligence)

### Learned
1. Non-trivial tasks benefit from explicit path selection rather than implicit single-path execution.
2. Users value quick tangible progress before deep optimization.
3. Dependency-heavy tasks need pre-defined fallback paths to avoid stalls.

### Adapted
1. Added option-ranking step for non-trivial tasks (impact/speed/risk/reversibility).
2. Added first-pass deliverable target in first execution cycle.
3. Added Plan A/B/C fallback ladder and confidence-tagged recommendations.

### Expected impact
- Better first-choice execution strategy.
- Faster visible progress with fewer dead ends.
- Improved resilience and clearer uncertainty handling.

## 2026-03-03 — Rapid Bundle v4 / Phase 4 (personalization + proactivity)

### Learned
1. Usefulness scales when response mode matches user intent in real time.
2. High-value proactive suggestions improve momentum versus strictly reactive replies.
3. Users need clearer visibility of real outcome movement, not just activity.

### Adapted
1. Added intent profile gate with 4-mode routing (Quick Answer, Execute Task, Strategic Planning, Monitor/Report).
2. Added proactive next-step rule for substantive responses.
3. Added outcome delta closeout: What changed | What remains | Confidence.
4. Added same-run preference reinforcement to durable memory.

### Expected impact
- Better fit-to-intent responses with less rework.
- Faster progress through proactive recommendations.
- Clearer tracking of actual outcome movement.

## 2026-03-03 — Rapid Bundle v5 / Phase 5 (forecasting + self-evaluation)

### Learned
1. Many failures are predictable before execution if risks are named explicitly.
2. Confidence quality improves when predictions are tracked against outcomes.
3. A short pre-send quality sweep can catch requirement misses and unnecessary user burden.

### Adapted
1. Added pre-mortem risk gate for non-trivial tasks.
2. Added prediction + calibration loop with explicit success probabilities.
3. Added pre-send self-evaluation gate.
4. Added regression sentinel to auto-escalate repeated failure patterns.

### Expected impact
- Earlier risk interception and fewer repeat failures.
- Better calibrated confidence and stronger recommendations.
- Higher first-pass quality with fewer corrections.

## 2026-03-03 — Rapid Bundle v6 / Phase 6 (tooling acceleration)

### Learned
1. Repeated operational tasks are slower and riskier when executed ad-hoc.
2. Recovery speed improves with pre-bundled command paths and automatic checks.
3. Trust rises when verification is standardized and attached to every operational closeout.

### Adapted
1. Added runbook-first requirement for recurring operations.
2. Added one-command recovery macro behavior with built-in post-checks.
3. Added fast verification pack requirement: status + external reachability + proof artifact.
4. Reinforced minimum-tool + safe parallelism execution behavior.

### Expected impact
- Faster, more consistent ops execution.
- Reduced sequencing mistakes under pressure.
- Stronger, repeatable completion evidence.

## 2026-03-03 — Rapid Bundle v7 / Phase 7 (strategic foresight)

### Learned
1. Strategic usefulness increases when next actions are explicitly prioritized by expected value.
2. Many decision disagreements are trade-off mismatches, not capability issues.
3. Long-term plans are more actionable when split by time horizon with revisit triggers.

### Adapted
1. Added best-next-action ranking for multi-path goals.
2. Added explicit trade-off optimizer (speed/quality/risk).
3. Added Now/Next/Later horizon planning and decision-memo response format.

### Expected impact
- Better strategic prioritization and sequencing.
- Fewer decision mismatches due to implicit trade-offs.
- Clearer execution cadence from strategy to action.

## 2026-03-03 — Rapid Bundle v8 / Phase 8 (compounding intelligence)

### Learned
1. Sustained improvement requires stable benchmarks, not one-off anecdotes.
2. Retrospectives are most useful when they output concrete patch candidates.
3. Compounding gains need explicit promotion gates tied to measurable metrics.

### Adapted
1. Added weekly benchmark task set for consistent measurement.
2. Added automated retrospective loop (wins, misses, top 3 patches).
3. Added capability scorecard and compound patch promotion gate.

### Expected impact
- Clear week-over-week capability trend visibility.
- Faster conversion of learnings into high-impact patches.
- More reliable long-term compounding without safety/trust regressions.

## 2026-03-03 — Rapid Bundle v9 / Phase 9 (autonomous execution architecture)

### Learned
1. Throughput gains require explicit autonomy boundaries, not ad-hoc judgment each time.
2. Many complex tasks can be safely accelerated via parallel independent tracks.
3. Long-running work needs checkpoint visibility and immediate human override support.

### Adapted
1. Added autonomous execution tiers (A/B/C) with explicit approval thresholds.
2. Added parallel workstream orchestration for decomposable tasks.
3. Added checkpointed long-run execution and strict human override contract.

### Expected impact
- Faster execution with bounded risk.
- Better transparency during long tasks.
- Stronger user control while maintaining high autonomy.

## 2026-03-03 — Rapid Bundle v10 / Phase 10 (self-optimizing governance)

### Learned
1. Long-term gains require strict promotion governance, not just more patches.
2. Trust can erode if speed optimizations outpace safety/clarity/user-control safeguards.
3. Policy sprawl reduces effectiveness unless rules are periodically consolidated.

### Adapted
1. Added auto-priority patch queue by expected value.
2. Added hard safety/trust promotion gate.
3. Added automatic rollback trigger on regression.
4. Added improvement overhead budget guardrail.
5. Added monthly protocol consolidation rule.

### Expected impact
- Higher quality improvements with lower regression risk.
- Better sustained trust while performance improves.
- Cleaner operating policy with lower maintenance drag.
