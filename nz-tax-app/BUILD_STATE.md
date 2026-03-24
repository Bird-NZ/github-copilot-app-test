# NZ Tax App — Build State

## Current stage
- Stage 9 / Deploy for questionnaire persistence + progress dashboard slice
- Stage 7 / Test is complete for this slice

## Current objective
Deploy and verify the persisted questionnaire flow plus cleaner workspace summary/progress dashboard, then continue directly into the next 5 highest-value features.

## Last completed milestone
- Workspace creation/open flow deployed
- NZ tax year presets deployed
- Workspace hub deployed with Questionnaire / Income / Crypto / IR3 Summary
- Questionnaire persistence implemented in backend/frontend code
- Progress dashboard implemented in frontend code
- Local validation passed for this slice:
  - backend tests pass
  - frontend build passes
- Remote image builds status:
  - backend image rebuilt and pushed
  - frontend image rebuilt and pushed

## Next tasks
1. Roll fresh Azure backend revision for persisted questionnaire slice
2. Roll fresh Azure frontend revision for progress dashboard slice
3. Verify live app shows persisted questionnaire + dashboard behavior
4. Commit the slice if needed and update build state
5. Continue immediately into the next 5 feature additions without stopping

## Known blockers
- None currently

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Not blockers
- Failing tests
- Stale documentation
- Agent/subagent handoff failure
- ACP runtime unavailable
- Need to switch tools or execution strategy
- Need to continue locally instead of through ClawDev
- Long-running remote builds, deploys, polls, or rollout waits

## Progress update contract
- Send a user-facing progress update at least every 5 minutes during active build/deploy/test work
- Do not begin a new major command batch if an update is overdue
- Every update must state:
  - what changed
  - what is next
  - status: Done / In Progress / Blocked
- Long-running remote builds, deploys, polls, and rollout waits require interim updates, not just terminal summaries
- `PROGRESS_LEDGER.md` is mandatory during active build work and must be updated before and after each major command batch
- Treat missing chat update + missing ledger entry as a workflow defect
- Track timing explicitly during active work:
  - `last_user_update_at`: 2026-03-24 20:59 NZDT
  - `next_update_due_at`: 2026-03-24 21:04 NZDT

## Definition of done for current slice
This slice is done only when all of the following are true:
1. Questionnaire answers persist per workspace
2. Workspace dashboard shows progress across questionnaire, income, crypto, and IR3 summary
3. Live Azure deployment reflects this slice
4. Live verification is completed
5. Remaining gaps are explicitly documented before moving to the next 5 features

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && npm test`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
- `az acr build -r zdacrtaxdevaue -t api:latest /home/mat/.openclaw/workspace/nz-tax-app/src/api`
- `az acr build -r zdacrtaxdevaue -t frontend:latest --build-arg VITE_API_URL=https://zd-ca-api-dev-aue.agreeablesky-1ad949ae.australiaeast.azurecontainerapps.io --build-arg VITE_AUTH_MODE=none /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend`
