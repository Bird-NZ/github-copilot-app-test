# Model + Runtime Fallback Policy

Purpose: keep HAL useful when the preferred model, routing path, or runtime fails.

## Core principle
Do not let a single model/runtime/tool path become a fake blocker.
If the preferred path is unavailable, degrade gracefully and keep the job moving.

## Coordinator fallback chain
Preferred coordinator path for HAL:
1. `openai-codex/gpt-5.4`
2. `gpt-5.3-codex`
3. lower-cost/faster fallback only for low-risk status, brief, or maintenance work

Rules:
- High-stakes reasoning/review should prefer the strongest available model.
- If a quota/usage/runtime failure occurs, switch to the next viable model instead of waiting idly.
- Report the fallback briefly if it materially affects speed/quality/cost.

## Coding execution fallback chain
Preferred coding path:
1. ClawDev via delegated session / ACP when healthy
2. local delegated subagent in workspace
3. direct HAL local execution in workspace

Rules:
- ClawDev is the default coding worker.
- If ACP/session routing is unavailable or stalls, do one low-friction recovery attempt.
- If still not viable, fall back immediately to local delegated or direct local execution.
- Delegation failure is not, by itself, a blocker.

## Cron / heartbeat fallback policy
For scheduled/background work:
1. prefer reliable, affordable model path
2. if quota/runtime failure occurs, retry once on fallback model
3. if still failing, surface concise actionable alert instead of silently dropping the run

Rules:
- Cron reliability matters more than using the fanciest model.
- Scheduled jobs should avoid single-model fragility.
- If confidence is reduced due to fallback, say so briefly.

## Browser/runtime fallback policy
When a heavier browser path fails:
1. use web search/fetch if public data is sufficient
2. use managed browser only when logged-in or interactive actions are truly required
3. use relay/browser-takeover paths only when lighter approaches cannot solve the job

## Communication rule during fallback
When fallback materially changes execution:
- say what failed
- say what path you switched to
- keep going

Good example:
- "ClawDev ACP routing stalled, so I switched to local delegated execution and continued the slice."

## Anti-patterns
- waiting for a broken preferred path without fallback
- treating quota failure as a stop condition for otherwise solvable work
- using heavy browser/runtime paths for tasks solvable by fetch/search
- hiding fallback if it changes confidence or expected speed significantly
