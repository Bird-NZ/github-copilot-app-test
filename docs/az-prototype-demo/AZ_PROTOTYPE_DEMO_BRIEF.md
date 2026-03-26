# AZ Prototype Demo Brief

This document is a single, demo-ready brief for presenting **AZ Prototype** and its built-in agent system. It includes:

- what AZ Prototype is
- the agent roles to highlight
- a recommended demo scenario
- exact setup and run commands
- a step-by-step live demo script
- a short version for tight time windows

---

## 1. What AZ Prototype is

**AZ Prototype** is an Azure CLI extension for turning an idea into a structured Azure prototype using AI-driven agent teams.

Core workflow:

```text
init -> design -> build -> deploy
```

The interesting part is that it is not just a single prompt-based generator. It provides:

- a staged workflow
- named specialist agents
- inspectable project state
- re-entrant stages for refinement
- support for infrastructure, application generation, documentation, cost, QA, and deployment

---

## 2. What to say in the demo

Suggested one-line positioning:

> AZ Prototype turns rough requirements into a structured Azure prototype workflow using specialist AI agents, with a repeatable CLI path from idea to architecture to build to deployment.

Suggested “why it matters” line:

> The value is not only faster generation. The value is that prototype delivery becomes an operating model: named agents, staged execution, inspectable state, and a path from concept to deployable Azure assets.

---

## 3. The built-in agents to highlight

AZ Prototype ships with 11 built-in agents:

- `cloud-architect` — architecture design and cross-service coordination
- `terraform-agent` — Terraform IaC generation
- `bicep-agent` — Bicep IaC generation
- `app-developer` — application code generation
- `doc-agent` — project and deployment documentation
- `qa-engineer` — error diagnosis and remediation guidance
- `biz-analyst` — requirements gap analysis and design dialogue
- `cost-analyst` — Azure cost estimation
- `project-manager` — backlog/scope/task coordination
- `security-reviewer` — pre-deployment security review
- `monitoring-agent` — observability/monitoring configuration

For a live demo, the best agents to call out verbally are:

- `cloud-architect`
- `app-developer`
- `security-reviewer`
- `qa-engineer`
- `cost-analyst`
- `project-manager`
- `monitoring-agent`

---

## 4. Recommended demo scenario

### Demo project

**Project name:** `retail-insights-demo`

### Story

A retailer wants an internal AI-powered assistant that:

- answers store-operations questions
- shows sales and stock insights
- provides a simple internal web interface
- supports secure Azure-native architecture
- remains cost-conscious for prototype use
- has a credible path to later production hardening

### Why this scenario works well

It naturally exercises:

- architecture
- app generation
- infrastructure generation
- security review
- monitoring
- cost analysis
- documentation
- backlog/project-management follow-up

---

## 5. Recommended setup choices

### Best demo defaults

Use these settings:

- **AI provider:** `github-models`
- **IaC tool:** `terraform`
- **template:** `ai-app`
- **location:** `australiaeast`

### Why I recommend `github-models`

Because on this machine it keeps the demo simpler:

- GitHub auth is already working
- Azure CLI is already installed
- the `prototype` extension is already installed
- it avoids unnecessary setup friction during the demo

---

## 6. Environment status already verified on this machine

Verified locally:

- Azure CLI installed: `2.83.0`
- Prototype extension installed: `0.2.1b2`
- Azure account authenticated
- GitHub CLI authenticated
- `az prototype agent list` works

---

## 7. Pre-demo checks

Run these before the demo starts:

```bash
az version
az extension show --name prototype
az account show --output table
gh auth status
az prototype agent list
```

What this proves:

- CLI is present
- extension is installed
- Azure login is valid
- GitHub login is valid
- AZ Prototype is functioning

---

## 8. Exact commands to start a demo project

### Create the project

```bash
mkdir -p ~/.openclaw/workspace/tmp/az-prototype-demo
cd ~/.openclaw/workspace/tmp/az-prototype-demo

az prototype init \
  --name retail-insights-demo \
  --location australiaeast \
  --ai-provider github-models \
  --iac-tool terraform \
  --template ai-app
```

### Move into the project

```bash
cd retail-insights-demo
```

### Show the generated config

```bash
cat prototype.yaml
```

---

## 9. Requirement artifacts for design stage

### Simple single-file version

Use the prepared requirement file:

```bash
mkdir -p requirements
cp /home/mat/.openclaw/workspace/docs/az-prototype-demo/demo-requirements.md ./requirements/demo-requirements.md
```

Then run design:

```bash
az prototype design --artifacts ./requirements --context "Use a pragmatic, demo-friendly Azure architecture with clear next-phase production path."
```

### Rich sample artifact pack version

If you want a more realistic demo, use the included sample artifact pack with multiple input types:

```bash
mkdir -p requirements
cp -R /home/mat/.openclaw/workspace/docs/az-prototype-demo/sample-artifacts/. ./requirements/
```

This gives you actual example inputs such as:
- executive brief (`01-executive-brief.md`)
- discovery notes (`02-discovery-notes.txt`)
- architecture slide outline (`03-architecture-slides-outline.md`)
- sample issue list (`04-sample-issues.csv`)
- non-functional requirements (`05-nonfunctional-requirements.json`)
- customer brief PDF (`06-customer-brief.pdf`)
- screenshot mock (`07-dashboard-screenshot.svg`)

Then run:

```bash
az prototype design --artifacts ./requirements --context "Use these materials to produce a pragmatic Azure prototype design with a clear next-phase production path."
```

After design, inspect state:

```bash
az prototype status --detailed
```

---

## 10. Build commands

Run build:

```bash
az prototype build
```

Check build status:

```bash
az prototype build --status
```

What to say:

> This stage generates the implementation assets based on the design context. The point is not just generation; it is structured generation across architecture, application, infrastructure, and supporting materials.

---

## 11. Deployment commands

For a safe demo, start with dry-run:

```bash
az prototype deploy --dry-run
```

Check deployment status:

```bash
az prototype deploy --status
```

If you want to do a real deployment live:

```bash
az prototype deploy
```

Suggested talking point:

> I usually show dry-run first in demos because it proves the staged deployment story without forcing immediate Azure resource creation or spend.

---

## 12. Commands to demo the agent system directly

### List agents

```bash
az prototype agent list
```

### Show agent details

```bash
az prototype agent show --name cloud-architect
az prototype agent show --name app-developer
az prototype agent show --name security-reviewer
```

### Show full prompt details if needed

```bash
az prototype agent show --name cloud-architect --detailed
```

### Test a specialist agent

```bash
az prototype agent test --name cost-analyst --prompt "Estimate likely prototype cost posture for this retail insights demo and explain the main cost drivers."
```

Good optional follow-ups:

```bash
az prototype agent test --name qa-engineer --prompt "What are the main prototype risks or likely failure points in this kind of architecture?"
az prototype agent test --name project-manager --prompt "Generate the next-phase backlog for production hardening."
```

### Export an agent definition

```bash
az prototype agent export --name cloud-architect --output-file ./cloud-architect.yaml
```

Why this matters:

> It shows the system is inspectable and customizable, not a sealed black box.

---

## 13. Optional follow-up generation commands

Generate docs:

```bash
az prototype generate docs
```

Generate backlog:

```bash
az prototype generate backlog
```

Suggested line:

> One useful part of AZ Prototype is that it can generate not just build assets but also delivery collateral like docs and backlog output.

---

## 14. Full live demo script

### Opening

> I’m going to show you AZ Prototype, an Azure CLI extension that uses specialist AI agents to turn an idea into a prototype project. The key thing is that this is not just one prompt. It’s a staged workflow with architecture, build, deployment, cost, QA, and documentation support.

### Step 1 — establish credibility

Run:

```bash
az version
az extension show --name prototype
az account show --output table
```

Say:

> This is running as an Azure CLI extension, which means it fits directly into existing Azure workflows rather than forcing a separate toolchain.

### Step 2 — show the agent model

Run:

```bash
az prototype agent list
```

Say:

> Instead of one general-purpose model doing everything, AZ Prototype uses named specialist roles like cloud architect, app developer, security reviewer, QA, cost analyst, and project manager.

Then run:

```bash
az prototype agent show --name cloud-architect
az prototype agent show --name security-reviewer
```

Say:

> That makes the workflow more inspectable and easier to explain.

### Step 3 — initialize the project

Run:

```bash
mkdir -p ~/.openclaw/workspace/tmp/az-prototype-demo
cd ~/.openclaw/workspace/tmp/az-prototype-demo

az prototype init \
  --name retail-insights-demo \
  --location australiaeast \
  --ai-provider github-models \
  --iac-tool terraform \
  --template ai-app
```

Then:

```bash
cd retail-insights-demo
cat prototype.yaml
```

Say:

> This gives us a concrete project config and a repeatable starting point.

### Step 4 — design from requirements

Run:

```bash
mkdir -p requirements
cp /home/mat/.openclaw/workspace/docs/az-prototype-demo/demo-requirements.md ./requirements/demo-requirements.md
az prototype design --artifacts ./requirements --context "Use a pragmatic, demo-friendly Azure architecture with clear next-phase production path."
```

Then:

```bash
az prototype status --detailed
```

Say:

> This is where rough business requirements become architecture and design context.

### Step 5 — build

Run:

```bash
az prototype build
az prototype build --status
```

Say:

> Now the platform generates the implementation assets using the staged design context.

### Step 6 — deployment story

Run:

```bash
az prototype deploy --dry-run
az prototype deploy --status
```

Say:

> I like using dry-run in demos because it shows the deployment model without immediately creating Azure resources.

### Step 7 — show a specialist agent directly

Run:

```bash
az prototype agent test --name cost-analyst --prompt "Estimate likely prototype cost posture for this retail insights demo and explain the main cost drivers."
```

Say:

> This makes the specialist-agent model tangible. You can directly query specific roles rather than treating them as hidden internals.

### Step 8 — close

Say:

> The real value here is not just generation speed. It’s that AZ Prototype gives you a structured path from idea to architecture to build to deployment, with inspectable specialist agents and repeatable CLI operations.

---

## 15. 5-minute version

If time is short, use this sequence:

```bash
az prototype agent list

az prototype init \
  --name retail-insights-demo \
  --location australiaeast \
  --ai-provider github-models \
  --iac-tool terraform \
  --template ai-app

cd retail-insights-demo
mkdir -p requirements
cp /home/mat/.openclaw/workspace/docs/az-prototype-demo/demo-requirements.md ./requirements/demo-requirements.md

az prototype design --artifacts ./requirements --context "Demo-friendly retail insights assistant"
az prototype build
az prototype deploy --dry-run
```

Suggested short wrap-up:

> AZ Prototype gives you a staged Azure prototype workflow with specialist agents, not just a one-shot generation prompt.

---

## 16. Recommended demo flow summary

Best order:

1. preflight checks
2. `agent list`
3. `init`
4. show `prototype.yaml`
5. `design`
6. `status`
7. `build`
8. `deploy --dry-run`
9. `agent test`
10. optional docs/backlog generation

---

## 17. Where the supporting files are

Supporting files created in this workspace:

- `/home/mat/.openclaw/workspace/docs/az-prototype-demo/demo-requirements.md`
- `/home/mat/.openclaw/workspace/docs/az-prototype-demo/commands.sh`
- `/home/mat/.openclaw/workspace/docs/az-prototype-demo/DEMO_SCRIPT.md`
- `/home/mat/.openclaw/workspace/docs/az-prototype-demo/README.md`

This consolidated brief is here:

- `/home/mat/.openclaw/workspace/docs/az-prototype-demo/AZ_PROTOTYPE_DEMO_BRIEF.md`
