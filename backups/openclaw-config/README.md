# OpenClaw Config Snapshot

This folder contains a **Git-safe snapshot** of selected OpenClaw configuration files.

## Purpose

These snapshots let the normal nightly workspace GitHub backup also preserve critical OpenClaw configuration that lives outside the workspace repo.

## Included

- `openclaw.json` (sanitized)
- `cron-jobs.json` (sanitized)
- `manifest.json`

## Safety model

- This is an **allowlist** backup, not a full `~/.openclaw` dump.
- Sensitive fields like API keys, tokens, passwords, and secrets are redacted.
- Credentials, pairing/session state, and secret stores are intentionally excluded.

## Refresh

Run:

```bash
python3 scripts/snapshot_openclaw_config.py
```

The nightly GitHub backup job should run this before `git add -A`.
