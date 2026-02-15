# FAST_MODE.md — CCIS Fast Mode (ACTIVE)

Activated: 2026-02-15 (NZ)

## Objective
Increase improvement cycle speed ~10x while preserving safety and human approval.

## Loop
1. Micro-review after each meaningful task (30–60s)
2. Log issue -> fix candidate -> confidence
3. Daily patch bundle (max 3 changes) for user approval
4. Promote only after evidence gate passes

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
