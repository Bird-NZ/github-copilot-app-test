---
name: az-prototype
description: Use the local Azure az-prototype repo and Azure CLI prototype extension workflow to scaffold, design, build, deploy, diagnose, and customize AI-driven Azure prototypes. Use when the user wants help with the Azure az-prototype / `az prototype` project, turning requirements into Azure prototypes, running the init→design→build→deploy flow, checking project status, analyzing errors or costs, or creating/testing custom prototype agents.
---

# az-prototype

Use the local repo at `/home/mat/.openclaw/workspace/az-prototype` as the source of truth.

## Core workflow

Default to the staged flow:
1. `az prototype init`
2. `az prototype design`
3. `az prototype build`
4. `az prototype deploy`

Treat `design`, `build`, and `deploy` as re-entrant. Prefer checking status before resets.

## Working rules

- Work from the target prototype project directory, not the extension repo, unless editing the extension itself.
- If the user means **use** az-prototype, run `az prototype ...` commands.
- If the user means **modify/fix** az-prototype itself, work in the repo and use its docs/tests/scripts.
- Before destructive resets (`--reset`, deleting generated state, overwriting config), ask.
- For unclear Azure prerequisites, verify with `az version`, `az extension show --name prototype`, `az account show`, and tool-specific checks.

## Fast path for common requests

### Start a new prototype
Use something like:
```bash
az prototype init --name <name> --location <region>
```
Then move into:
- `az prototype design`
- `az prototype build`
- `az prototype deploy`

### Design from docs/artifacts
Use:
```bash
az prototype design --artifacts <dir>
az prototype design --context "<extra context>"
```
Use `--status` to inspect progress and `--interactive` when refinement is wanted.

### Build specific scopes
Use:
```bash
az prototype build --scope infra
az prototype build --scope apps
az prototype build --scope db
az prototype build --scope docs
```
Use `--status` before `--reset`.

### Deployment help
Use:
```bash
az prototype deploy --status
az prototype deploy --dry-run
az prototype deploy --stage <n>
```
Prefer dry-run/plan when validating changes.

### Troubleshooting
Use:
```bash
az prototype analyze error --input "<error text>"
az prototype analyze error --input ./deploy.log
az prototype analyze costs
az prototype status --detailed
```

### Agent customization
Use:
```bash
az prototype agent list
az prototype agent show --name <agent>
az prototype agent test --name <agent>
az prototype agent add --name <custom-agent>
az prototype agent override --name <builtin-agent> --file <yaml>
```

## Repo-aware guidance

Read these only as needed:
- `references/repo-readme.md` for overview, prerequisites, config, and built-in workflow.
- `references/commands.md` for command flags, examples, slash commands, and exact behavior.
- `references/features.md` for capabilities, architecture, and framing.

If working on the extension implementation itself, inspect the repo directly under `/home/mat/.openclaw/workspace/az-prototype`.

## Useful checks

When diagnosing environment issues, prefer this sequence:
```bash
az version
az extension show --name prototype
az account show
which gh
az prototype --help
az prototype status --detailed
```

If GitHub-backed providers are involved, also verify `gh auth status`.

## Output style

When helping the user operate az-prototype:
- keep the next step concrete
- suggest exact commands
- distinguish clearly between repo-development tasks and end-user prototype-generation tasks
- summarize blockers as missing auth, missing extension/tooling, missing project state, or Azure-side deployment issues
