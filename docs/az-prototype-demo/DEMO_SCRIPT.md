# AZ Prototype Demo Script

This is a presenter-friendly talk track for a live terminal demo.

## Demo goal

Show that **AZ Prototype** can take a rough idea, turn it into a structured Azure solution, coordinate multiple specialized agents, and move through a repeatable workflow:

`init -> design -> build -> deploy`

## Opening setup

Suggested intro:

> I’m going to show you AZ Prototype, an Azure CLI extension that uses specialized AI agents to turn an idea into a prototype project. The key point is that it’s not just one chat prompt — it’s a staged workflow with architecture, build, deployment, cost, QA, and documentation support.

## Section 1 — establish credibility

Run:

```bash
az version
az extension show --name prototype
az account show --output table
```

Say:

> This is running as an Azure CLI extension, not a separate bespoke app. It sits directly in the Azure workflow, which makes it easier to adopt for teams already living in `az`.

## Section 2 — show the agent system

Run:

```bash
az prototype agent list
```

Say:

> Under the hood, this uses a team of specialized agents. Instead of one model trying to do everything, you have roles like cloud architect, app developer, cost analyst, security reviewer, QA engineer, documentation, and project management.

Call out a few named agents:
- `cloud-architect`
- `app-developer`
- `security-reviewer`
- `qa-engineer`
- `cost-analyst`
- `project-manager`
- `monitoring-agent`

Then run:

```bash
az prototype agent show --name cloud-architect
az prototype agent show --name security-reviewer
```

Say:

> This makes the workflow explainable. You can inspect the agent roles instead of treating the system like a black box.

## Section 3 — initialize a project

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

Say:

> Here I’m starting with a realistic but demo-friendly use case: a retail operations assistant. I’m using GitHub Models for the AI provider because it keeps the setup friction low for a demo, and I’m using the AI app template as the starter topology.

Then run:

```bash
cd retail-insights-demo
cat prototype.yaml
```

Say:

> The project is now grounded in a local config file, which is important because it turns the process into something repeatable and editable.

## Section 4 — design from business requirements

Prepare the requirement artifact first:

```bash
mkdir -p requirements
cp /home/mat/.openclaw/workspace/docs/az-prototype-demo/demo-requirements.md ./requirements/demo-requirements.md
```

Run:

```bash
az prototype design --artifacts ./requirements --context "Use a pragmatic, demo-friendly Azure architecture with clear next-phase production path."
```

Say:

> This is where AZ Prototype moves from idea to architecture. The business analyst and architect roles work together to identify gaps, assumptions, and a proposed Azure design.

Talking points while it runs:
- it can ingest documents/artifacts
- design is re-entrant
- it is not just generating code blindly; it is shaping the solution first
- this is the right place to capture scope and tradeoffs

Afterward run:

```bash
az prototype status --detailed
```

Say:

> At this point we can inspect the state of the project across stages instead of losing track in a long agent conversation.

## Section 5 — build

Run:

```bash
az prototype build
az prototype build --status
```

Say:

> Now the system generates the project assets — infrastructure, application scaffolding, and supporting materials — using the agent team and the design context from the previous stage.

Talking points:
- Terraform or Bicep support
- staged generation
- policy and QA hooks
- easier to iterate because build is re-entrant

## Section 6 — deployment story

Run:

```bash
az prototype deploy --dry-run
az prototype deploy --status
```

Say:

> For demos, I like using dry-run first. It lets you show that deployment is structured and staged without forcing immediate live resource creation or surprise spend.

Then explain:
- deploy is staged
- there are rollback/status concepts
- this is closer to a delivery workflow than a one-shot generator

If you want to show live deployment, run:

```bash
az prototype deploy
```

## Section 7 — show a specialist agent in action

Run:

```bash
az prototype agent test --name cost-analyst --prompt "Estimate likely prototype cost posture for this retail insights demo and explain the main cost drivers."
```

Say:

> This is useful because it shows that the agents are not only used implicitly. You can also directly interrogate specialist roles.

Optional follow-ups:

```bash
az prototype agent test --name qa-engineer --prompt "What are the main prototype risks or likely failure points in this kind of architecture?"
az prototype agent test --name project-manager --prompt "Generate the next-phase backlog for production hardening."
```

## Section 8 — show output enrichment

Run:

```bash
az prototype generate docs
az prototype generate backlog
```

Say:

> Beyond infra and app generation, it can also generate the delivery collateral around the solution — docs and backlog output — which matters if you want to move from prototype into team execution.

## Closing summary

Suggested wrap-up:

> The value here isn’t just faster code generation. It’s that AZ Prototype gives you a structured path from idea to architecture to build to deploy, with specialist agents and repeatable CLI operations. That makes it much more useful for real Azure prototype work than a loose chat-only workflow.

## Short version if time is tight

If you only have 5 minutes, do these commands:

```bash
az prototype agent list
az prototype init --name retail-insights-demo --location australiaeast --ai-provider github-models --template ai-app
cd retail-insights-demo
az prototype design --artifacts ./requirements --context "Demo-friendly retail insights assistant"
az prototype build
az prototype deploy --dry-run
```

## Recommended phrasing for the "why it matters" moment

> Most AI demo tools can generate something. The interesting part here is that this turns prototype creation into an explicit operating model: named agents, staged execution, inspectable state, and a path from concept to deployment.
