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
