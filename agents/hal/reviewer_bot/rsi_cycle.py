#!/usr/bin/env python3
import argparse
import json
import os
from collections import Counter, defaultdict
from datetime import datetime

WEIGHTS = {
    "correctness": 0.35,
    "completeness": 0.20,
    "safety": 0.20,
    "clarity": 0.15,
    "tool_efficiency": 0.10,
}

PROMOTION = {
    "min_tasks": 20,
    "min_quality_delta": 0.15,
    "max_safety_regression": 0.0,
    "max_latency_increase_pct": 15,
    "max_cost_increase_pct": 20,
}


def weighted_score(scores):
    return round(sum(scores.get(k, 0) * w for k, w in WEIGHTS.items()), 3)


def load_jsonl(path):
    rows = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows


def pct_change(old, new):
    if old in (0, None):
        return None
    return ((new - old) / old) * 100.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--log", required=True, help="Path to review_log.jsonl")
    ap.add_argument("--out", required=True, help="Output directory")
    args = ap.parse_args()

    rows = load_jsonl(args.log)
    os.makedirs(args.out, exist_ok=True)

    if not rows:
        report = "# Weekly RSI Report\n\nNo log rows found."
        with open(os.path.join(args.out, "weekly_report.md"), "w", encoding="utf-8") as f:
            f.write(report)
        return

    tag_counts = Counter()
    proposals = Counter()
    by_tag_example = defaultdict(list)

    pre_scores, post_scores = [], []
    safety_vals = []
    latencies, costs = [], []

    for r in rows:
        ws = weighted_score(r.get("scores", {}))
        pre_scores.append(ws)
        if isinstance(r.get("post_score"), (int, float)):
            post_scores.append(float(r["post_score"]))

        safety_vals.append(r.get("scores", {}).get("safety", 0))
        if isinstance(r.get("latency_ms"), (int, float)):
            latencies.append(float(r["latency_ms"]))
        if isinstance(r.get("cost_usd"), (int, float)):
            costs.append(float(r["cost_usd"]))

        for t in r.get("failure_tags", []):
            tag_counts[t] += 1
            if len(by_tag_example[t]) < 3:
                by_tag_example[t].append(r.get("task_id", "unknown"))

        fp = (r.get("fix_proposal") or "").strip()
        if fp:
            proposals[fp] += 1

    avg_pre = sum(pre_scores) / len(pre_scores)
    avg_post = (sum(post_scores) / len(post_scores)) if post_scores else None
    quality_delta = (avg_post - avg_pre) if avg_post is not None else None

    avg_safety = (sum(safety_vals) / len(safety_vals)) if safety_vals else 0
    avg_latency = (sum(latencies) / len(latencies)) if latencies else None
    avg_cost = (sum(costs) / len(costs)) if costs else None

    top_tags = tag_counts.most_common(5)
    top_patch_candidates = []
    for t, n in top_tags:
        top_patch_candidates.append({
            "failure_tag": t,
            "count": n,
            "example_task_ids": by_tag_example[t],
        })

    # Promotion gate (conservative when missing data)
    reasons = []
    decision = "PROMOTE"
    if len(rows) < PROMOTION["min_tasks"]:
        decision = "HOLD"
        reasons.append(f"Not enough tasks: {len(rows)} < {PROMOTION['min_tasks']}")

    if quality_delta is None:
        decision = "HOLD"
        reasons.append("Missing post_score data for quality delta")
    elif quality_delta < PROMOTION["min_quality_delta"]:
        decision = "HOLD"
        reasons.append(f"Quality delta too low: {quality_delta:.3f}")

    if avg_safety < 4.0:
        decision = "HOLD"
        reasons.append(f"Average safety below 4.0: {avg_safety:.2f}")

    if avg_latency is None:
        reasons.append("Latency data missing (non-blocking)")
    if avg_cost is None:
        reasons.append("Cost data missing (non-blocking)")

    with open(os.path.join(args.out, "patch_candidates.json"), "w", encoding="utf-8") as f:
        json.dump(top_patch_candidates, f, indent=2)

    promotion_obj = {
        "timestamp": datetime.now().isoformat(),
        "decision": decision,
        "quality_delta": quality_delta,
        "avg_pre_score": round(avg_pre, 3),
        "avg_post_score": round(avg_post, 3) if avg_post is not None else None,
        "avg_safety": round(avg_safety, 3),
        "reasons": reasons,
    }
    with open(os.path.join(args.out, "promotion_decision.json"), "w", encoding="utf-8") as f:
        json.dump(promotion_obj, f, indent=2)

    lines = [
        "# Weekly RSI Report",
        "",
        f"- Tasks reviewed: **{len(rows)}**",
        f"- Avg pre score: **{avg_pre:.3f}**",
        f"- Avg post score: **{avg_post:.3f}**" if avg_post is not None else "- Avg post score: **N/A**",
        f"- Quality delta: **{quality_delta:.3f}**" if quality_delta is not None else "- Quality delta: **N/A**",
        f"- Avg safety: **{avg_safety:.3f}**",
        "",
        "## Top failure tags",
    ]

    if top_tags:
        for tag, count in top_tags:
            lines.append(f"- {tag}: {count}")
    else:
        lines.append("- None")

    lines += ["", "## Top fix proposals"]
    for p, c in proposals.most_common(5):
        lines.append(f"- ({c}) {p}")
    if not proposals:
        lines.append("- None")

    lines += ["", "## Promotion decision", f"- **{decision}**"]
    for r in reasons:
        lines.append(f"- {r}")

    with open(os.path.join(args.out, "weekly_report.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
