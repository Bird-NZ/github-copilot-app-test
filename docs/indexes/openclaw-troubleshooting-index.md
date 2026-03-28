# OpenClaw Troubleshooting Index

Purpose: give HAL a fast map of recurring OpenClaw/platform issues and the first place to look.

## 1) Gateway unhealthy / restart weirdness
Symptoms:
- gateway probe fails
- restart output gets interrupted
- post-restart state unclear

First checks:
```bash
openclaw status
openclaw gateway status
openclaw channels status --probe --json
```

Runbook:
- `docs/runbooks/openclaw-ops.md`

Key rule:
- restart alone is not recovery; verify post-restart health explicitly

## 2) WhatsApp linked but delivery failing
Symptoms:
- channel appears linked
- messages/media not usable
- scheduled jobs show delivery issues

First checks:
```bash
openclaw channels status --probe --json
openclaw status
```

Runbook:
- `docs/runbooks/openclaw-ops.md`

Key rule:
- distinguish routing failure from content/media failure

## 3) WhatsApp voice replies fail on phone but play on desktop
Symptoms:
- local playback works
- phone WhatsApp says audio cannot be played

Runbook:
- `docs/runbooks/whatsapp-voice.md`

Key rule:
- desktop playback is not proof of success; mobile WhatsApp playback is the target test

## 4) ClawDev / ACP delegation stalls or fails
Symptoms:
- delegated coding path does not actually execute
- ACP route is unavailable, read-only, or stalled

Runbooks/policies:
- `docs/runbooks/delegated-build-protocol.md`
- `docs/policies/model-runtime-fallbacks.md`

Key rule:
- delegation failure is not a blocker by itself; fall back and continue

## 5) Build updates drift / Mat not getting regular progress
Symptoms:
- long silence during coding
- completion-only updates
- vague status without proof-of-work

Runbooks/templates:
- `docs/runbooks/delegated-build-protocol.md`
- `docs/templates/build-update-template.md`
- `HEARTBEAT.md` (update watchdog)

Key rule:
- every active delegated build slice needs handoff + interim + completion updates

## 6) Memory exists but behavior does not improve
Symptoms:
- rule is present in memory
- repeated workflow mistakes still happen

Runbooks/policies:
- `MEMORY.md`
- `HEARTBEAT.md`

Key rule:
- convert recurring lessons into enforcing artifacts (runbook/checklist/template/heartbeat), not passive memory only

## 7) Wrong tool/runtime path chosen
Symptoms:
- heavy browser path used for public info
- stalled preferred model/runtime path with no fallback
- overcomplicated routing for solvable tasks

Policy:
- `docs/policies/model-runtime-fallbacks.md`
- `docs/policies/task-lanes.md`

Key rule:
- use the lightest viable path and fall back quickly when the preferred one is broken

## 8) What to update after a durable fix
When a fix is likely to recur, consider updating one or more of:
- runbook in `docs/runbooks/`
- policy in `docs/policies/`
- checklist/template in `docs/templates/`
- heartbeat task in `HEARTBEAT.md`
- memory note in `MEMORY.md` or `memory/YYYY-MM-DD.md`
