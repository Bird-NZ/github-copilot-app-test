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
