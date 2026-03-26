# AZ Prototype Demo Pack

This pack is designed to help Mat demo **AZ Prototype** end-to-end, including the built-in agents, the project workflow, and the exact commands to run.

## What this demo shows

- `az prototype init` scaffolding a new AI-driven Azure prototype project
- `az prototype design` turning rough requirements into architecture
- `az prototype build` generating solution assets
- `az prototype deploy` preparing or executing staged deployment
- `az prototype agent` commands to show the built-in agent system
- `az prototype generate` commands for docs/backlog follow-up

## Recommended demo scenario

Use a scenario that naturally exercises multiple agents:

**Project:** `retail-insights-demo`

**Story:**
A retailer wants an AI-powered internal assistant that:
- answers store-operations questions
- shows sales and stock insights
- records support/admin actions
- runs on Azure with secure access patterns
- is cheap enough for a prototype but can grow later

This is a good demo because it touches:
- architecture
- app generation
- infrastructure generation
- documentation
- cost analysis
- security review
- monitoring
- backlog/project planning

## Local environment status already verified

Verified on this machine:
- Azure CLI installed: `2.83.0`
- Prototype extension installed: `0.2.1b2`
- Azure account logged in
- GitHub CLI authenticated
- `az prototype agent list` works

## Recommended AI provider for the demo

Use **GitHub Models** unless you specifically want to demo Azure OpenAI setup.

Why:
- GitHub auth is already working here
- avoids depending on Copilot license behavior during the demo
- keeps the setup story simpler

Recommended init flag:

```bash
--ai-provider github-models
```

## Suggested demo flow

1. Preflight checks
2. Show built-in agents
3. Initialize project
4. Show generated `prototype.yaml`
5. Run design stage using a prepared requirement artifact
6. Show status
7. Run build stage
8. Show generated docs / staged output
9. Show deploy options (`--dry-run`, `--status`)
10. Show agent commands (`show`, `test`, `export`)
11. Optionally show backlog/docs generation

## Files in this pack

- `demo-requirements.md` — sample business brief to feed design
- `sample-artifacts/` — realistic mixed-format input pack for `--artifacts`
- `commands.sh` — runnable command sheet
- `DEMO_SCRIPT.md` — presenter script / talk track

## Fastest path

If you just want the essentials:

```bash
cd /home/mat/.openclaw/workspace/docs/az-prototype-demo
bash ./commands.sh
```

Or copy commands from the script step-by-step into your terminal.

## Notes

- `design`, `build`, and `deploy` are re-entrant, so you can safely revisit them.
- For a safe public demo, prefer `deploy --dry-run` unless you explicitly want live resource creation.
- If you want a live Azure deploy demo, do a dry-run first so you can explain stages before spending money.
