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
