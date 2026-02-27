# MAT TTT Demo — Agent Workforce

This workforce is designed for fast, low-risk Azure app delivery using a plan-first workflow.

## Roles

1. **Planner Agent**
   - Converts user brief into 2–3 architecture options (cheap / balanced / production-lite).
   - Outputs cost estimate and resource bill of materials.

2. **Scaffolder Agent**
   - Creates/updates app code and deployment files (Dockerfile, scripts, env config).
   - Keeps changes minimal and traceable.

3. **Security Agent**
   - Checks identity, secret handling, ingress, and least privilege defaults.
   - Produces a small hardening checklist.

4. **Cost Agent**
   - Right-sizes CPU/memory/scaling and highlights monthly cost drivers.
   - Suggests savings actions (scale-to-zero, log retention, SKU changes).

5. **Deploy Agent**
   - Runs deployment commands (az group/acr/containerapp/etc) in controlled order.
   - Captures outputs and rollback commands.

6. **QA Agent**
   - Runs smoke tests (URL reachable, game flow works, multiplayer works, local mode works).
   - Reports pass/fail with exact reproduction steps.

7. **Ops Agent**
   - Produces runbook: deploy/update/rollback/teardown commands.
   - Maintains handover docs.

---

## Workflow

`Brief -> Planner -> Approval -> Scaffolder -> Security+Cost -> Deploy -> QA -> Ops handover`

---

## Command Template (OpenClaw sub-agent style)

Use isolated sub-agents for each role. Example orchestration steps:

1. Spawn Planner
2. Spawn Scaffolder (after approval)
3. Spawn Security + Cost in parallel
4. Spawn Deploy
5. Spawn QA
6. Spawn Ops handover

---

## Guardrails

- No deploy until Planner output is approved.
- Security/Cost checks must pass before final deploy.
- Every deploy must include rollback command.
- Keep production-destructive actions explicitly approved by user.
