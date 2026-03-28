# Subagent Routing Hardening

Purpose: make named subagents (for example `clawdev`, `clawresearch`) invokable reliably by HAL instead of depending on the default same-agent-only policy.

## Root cause

In this OpenClaw build, named subagent invocation is controlled by the **caller agent's** per-agent config:

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "subagents": {
          "allowAgents": ["*"]
        }
      }
    ]
  }
}
```

Important detail:
- `subagents.allowAgents` belongs on the **calling agent entry** (for example `main`)
- the default behavior without this is effectively **same-agent only**
- `agents.defaults.subagents.allowAgents` is **not** accepted by the installed config schema here

## Permanent config pattern

Use this pattern in `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "subagents": {
          "allowAgents": ["*"]
        }
      },
      { "id": "clawdev" },
      { "id": "clawresearch" }
    ]
  }
}
```

Safer narrower version:

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "subagents": {
          "allowAgents": ["clawdev", "clawresearch"]
        }
      }
    ]
  }
}
```

## Validation

Local config validation:

```bash
python3 /home/mat/.openclaw/workspace/scripts/check_subagent_routing.py
```

Machine-readable validation:

```bash
python3 /home/mat/.openclaw/workspace/scripts/check_subagent_routing.py --json
```

## Live smoke test

After config changes:

1. Restart / verify gateway
   - `openclaw gateway restart`
   - `openclaw gateway status`
2. From HAL, run a real named spawn test using `sessions_spawn(runtime:"subagent", agentId:"<target>")`
3. Confirm the spawned agent replies from its own session key / agent id

Suggested smoke-test prompts:
- `clawdev` -> `Reply with exactly: CLAWDEV_OK`
- `clawresearch` -> `Reply with exactly: CLAWRESEARCH_OK`

## Recovery if named subagent spawn breaks again

Symptoms:
- `agentId is not allowed for sessions_spawn (allowed: none)`
- generic subagents work but named ones fail

Recovery steps:
1. Run config validator:
   - `python3 /home/mat/.openclaw/workspace/scripts/check_subagent_routing.py`
2. Ensure caller agent entry exists in `agents.list`
3. Ensure caller entry includes `subagents.allowAgents`
4. Do **not** put `allowAgents` under `agents.defaults.subagents` on this installed version
5. Restart gateway
6. Re-run a real named smoke test

## Definition of done

This is only fixed when all are true:
- config validator passes
- gateway is healthy on the updated config
- at least one real named subagent spawn succeeds end-to-end
- the working pattern is documented in the workspace
