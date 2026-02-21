# Reviewer Bot RSI Kit

This is a lightweight, auditable Recursive Self-Improvement (RSI) loop for a reviewer bot.

## What it does
1. Logs review outcomes to `data/review_log.jsonl`
2. Aggregates recurring failures
3. Proposes top patch candidates
4. Produces a promotion gate decision from fixed thresholds

## Files
- `reviewer_rubric.yaml` — scoring dimensions and weights
- `failure_taxonomy.yaml` — failure tags + patch playbooks
- `rsi_cycle.py` — analysis + report generator
- `promote_policy.yaml` — promotion thresholds
- `templates/reviewer_prompt.md` — drop-in reviewer prompt

## Log format (`data/review_log.jsonl`)
One JSON object per line:

```json
{
  "task_id": "abc-123",
  "timestamp": "2026-02-21T13:00:00+13:00",
  "scores": {
    "correctness": 4,
    "completeness": 4,
    "safety": 5,
    "clarity": 4,
    "tool_efficiency": 3
  },
  "failure_tags": ["missed_requirement", "tool_overuse"],
  "fix_proposal": "Add explicit requirement checklist before final answer",
  "accepted": true,
  "post_score": 4.4,
  "latency_ms": 1800,
  "cost_usd": 0.012
}
```

## Run weekly RSI pass
```bash
python3 reviewer_bot/rsi_cycle.py \
  --log data/review_log.jsonl \
  --out reviewer_bot/out
```

Outputs:
- `reviewer_bot/out/weekly_report.md`
- `reviewer_bot/out/patch_candidates.json`
- `reviewer_bot/out/promotion_decision.json`

## Reviewer operating loop
Draft -> Review -> Patch proposal -> Eval replay -> Gate -> Promote/Rollback
