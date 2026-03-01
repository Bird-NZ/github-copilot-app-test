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
