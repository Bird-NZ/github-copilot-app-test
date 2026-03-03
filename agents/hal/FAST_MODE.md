# FAST_MODE.md — CCIS Fast Mode (ACTIVE)

Activated: 2026-02-15 (NZ)
Rapid Mode Override: ACTIVE (2026-03-03 NZ)

## Objective
Increase improvement cycle speed ~10x while preserving safety and human approval.

## Loop
1. Micro-review after each meaningful task (30–60s)
2. Log issue -> fix candidate -> confidence
3. Daily patch bundle (max 3 changes) for user approval
4. Promote only after evidence gate passes

## Rapid Mode Override (ACTIVE)
- Apply high-confidence operational improvements same-day.
- Validate on the next real task cycle (no unnecessary waiting window).
- Report a concise delta update within 24h.
- If regression appears, rollback immediately and present an alternate path.

## Lean digest guardrail (ACTIVE)
- Default to low-context path for simple asks.
- NO_REPLY fast-path when appropriate (no meaningful user-visible output required).
- Skill preflight only if one skill clearly applies.
- Tool-necessity check before calling tools; avoid extra calls for lightweight responses.
- Preserve FAST mode gated checkpoints for risky/ambiguous decisions.

## Evidence gate (80/20)
- 80% synthetic checks (edge cases, formatting, ambiguity routing)
- 20% real conversation evidence before promotion

## Triage
- P0: safety/policy drift -> immediate escalation
- P1: repeated quality errors -> next daily bundle
- P2: cosmetic tweaks -> backlog

## Constraints
- No autonomous unsafe self-modification
- No hidden parameter rewrite
- Human approval required for persistent behavioral changes
