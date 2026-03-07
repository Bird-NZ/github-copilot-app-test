# CHANGELOG.md — CCIS

## 2026-03-08
- Added Copilot prompt production gate:
  - Updated `OPERATING_PROTOCOL.md` with a 2-layer production rule for Copilot prompt work (mechanics excellence + source-verified research).
  - Updated `MEMORY.md` to persist the same preference for future prompt tasks.

## 2026-03-04
- Formalized Connect4-derived process learnings:
  - Updated `OPERATING_PROTOCOL.md` with an active UI parity gate set (UI spec freeze, mid-build visual checkpoint, pre-release visual parity blocker).
  - Added `CCIS-RAPID-034/035/036` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged Connect4 design-to-build fidelity learnings and adaptations in `LEARNINGS_LOG.md`.

## 2026-03-03
- Enabled Rapid Mode override in `FAST_MODE.md`:
  - Same-day application of high-confidence improvements.
  - Next-cycle validation instead of delayed rollout windows.
  - 24h concise delta reporting and immediate rollback-on-regression rule.
- Applied Rapid Bundle v1 hard gates:
  - Added `OPERATING_PROTOCOL.md` section for preflight coverage checks, mandatory incident trace on failures, and done-proof closeout gate.
  - Added `CCIS-RAPID-001/002/003` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged learning/adaptation entry in `LEARNINGS_LOG.md`.
- Applied Rapid Bundle v2 (clarification quality):
  - Added `OPERATING_PROTOCOL.md` section for clarification decision gate, assumption contract, focused-question format, and one-round clarification cap.
  - Added `CCIS-RAPID-004/005/006` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged v2 learning/adaptation entry in `LEARNINGS_LOG.md`.
- Applied Rapid Bundle v3 (execution intelligence):
  - Added `OPERATING_PROTOCOL.md` section for option ranking, first-pass deliverable target, fallback ladder, and confidence-tagged recommendations.
  - Added `CCIS-RAPID-007/008/009` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged v3 learning/adaptation entry in `LEARNINGS_LOG.md`.
- Applied Rapid Bundle v4 / Phase 4 (personalization + proactivity):
  - Added `OPERATING_PROTOCOL.md` section for intent profile gate, proactive next-step rule, outcome delta closeout, and same-run preference reinforcement.
  - Added `CCIS-RAPID-010/011/012` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged v4 learning/adaptation entry in `LEARNINGS_LOG.md`.
- Applied Rapid Bundle v5 / Phase 5 (forecasting + self-evaluation):
  - Added `OPERATING_PROTOCOL.md` section for pre-mortem risk gate, prediction+calibration loop, pre-send self-evaluation gate, and repeat-failure regression sentinel.
  - Added `CCIS-RAPID-013/014/015` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged v5 learning/adaptation entry in `LEARNINGS_LOG.md`.
- Applied Rapid Bundle v6 / Phase 6 (tooling acceleration):
  - Added `OPERATING_PROTOCOL.md` section for runbook-first execution, one-command recovery macros, tool-call minimization with safe parallelism, and fast verification packs.
  - Added `CCIS-RAPID-016/017/018` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged v6 learning/adaptation entry in `LEARNINGS_LOG.md`.
- Applied Rapid Bundle v7 / Phase 7 (strategic foresight):
  - Added `OPERATING_PROTOCOL.md` section for best-next-action ranking, trade-off optimizer, horizon planning, and decision memo micro-format.
  - Added `CCIS-RAPID-019/020/021` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged v7 learning/adaptation entry in `LEARNINGS_LOG.md`.
- Applied Rapid Bundle v8 / Phase 8 (compounding intelligence):
  - Added `OPERATING_PROTOCOL.md` section for weekly benchmark set, automated retrospective loop, capability scorecard, and compound patch promotion gate.
  - Added `CCIS-RAPID-022/023/024` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged v8 learning/adaptation entry in `LEARNINGS_LOG.md`.
- Applied Rapid Bundle v9 / Phase 9 (autonomous execution architecture):
  - Added `OPERATING_PROTOCOL.md` section for autonomous execution tiers, parallel workstream orchestration, checkpointed long-run execution, and human override contract.
  - Added `CCIS-RAPID-025/026/027` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged v9 learning/adaptation entry in `LEARNINGS_LOG.md`.
- Applied Rapid Bundle v10 / Phase 10 (self-optimizing governance):
  - Added `OPERATING_PROTOCOL.md` section for auto-priority patch queue, safety/trust promotion gate, automatic rollback trigger, improvement overhead budget, and monthly protocol consolidation.
  - Added `CCIS-RAPID-028/029/030` as APPROVED+APPLIED in `IMPROVEMENT_QUEUE.md`.
  - Logged v10 learning/adaptation entry in `LEARNINGS_LOG.md`.

## 2026-03-02
- Applied messaging recovery improvement after repeated `pairing required` loop:
  - Updated `OPERATING_PROTOCOL.md` with a mandatory loop-breaker triage: check/approve pending device pairing (`openclaw devices list/approve`) before asking user to re-pair WhatsApp.
  - Logged incident learning + adaptation in `LEARNINGS_LOG.md`.
  - Added durable memory note to prioritize device approval checks before user-side re-pair instructions.
- Added global anti-loop hard encoding:
  - Updated `OPERATING_PROTOCOL.md` with an anti-loop execution policy (failure classification, alternate-path requirement, max-repeat rule, escalation after two distinct failures, assistant-ownership-first).
  - Added durable memory preference to avoid repeating the same user step without new evidence.

## 2026-02-22
- Added completion-discipline protocol updates after user feedback:
  - Updated `OPERATING_PROTOCOL.md` with explicit end-to-end completion checklist for implementation tasks.
  - Logged learning and adaptation in `LEARNINGS_LOG.md`.
  - Added durable preference note in `MEMORY.md` to only pause on high-security blockers.
- Enabled automatic reviewer log collection:
  - Updated cron job `Reviewer daily full audit digest + log writer` to append one JSONL entry per run to `data/review_log.jsonl`.
  - Bootstrapped `data/review_log.jsonl` and executed a forced run to verify append behavior.

## 2026-02-21
- Implemented `reviewer_bot/` RSI kit for reviewer workflow:
  - rubric (`reviewer_rubric.yaml`)
  - failure taxonomy (`failure_taxonomy.yaml`)
  - promotion gate policy (`promote_policy.yaml`)
  - reviewer prompt template (`templates/reviewer_prompt.md`)
  - weekly analysis script (`rsi_cycle.py`)
  - sample log + generated output examples

## 2026-02-19
- Added robust weather retrieval utility at `data/weather_robust.py`:
  - dual-source fetch (Open-Meteo + wttr.in)
  - retry with backoff for transient failures
  - geocoded location -> lat/lon normalization
  - source freshness and confidence scoring

## 2026-02-16
- Applied CCIS-FAST-004 Lean digest guardrail:
  - low-context path for simple asks
  - NO_REPLY fast-path when appropriate
  - skill preflight only when clearly applicable
  - tool-necessity checks before tool calls
- Reinforced FAST mode gated checkpoints in operating protocol.

## 2026-02-15
- Activated CCIS v1 files:
  - OPERATING_PROTOCOL.md
  - IMPROVEMENT_QUEUE.md
  - WEEKLY_REVIEW.md
  - CHANGELOG.md
  - LEARNINGS_LOG.md
- Applied market disambiguation rule for stock reports (ask if ambiguous).
- Upgraded stock workflow from v1 -> v2; deprecated v1.
- Began v3 template and implementation for improved visual quality.
- Enforced Bender language preference: do not use "meatbag".
- Activated CCIS Fast Mode (micro-reviews, daily patch bundles, 80/20 evidence gate).
