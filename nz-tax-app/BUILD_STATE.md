# NZ Tax App — Build State

## Current stage
- Stage 6 / Build (current no-auth V1 completion pass)
- Stage 7 / Test is complete for the updated backend no-auth scope

## Current objective
Finish the no-auth V1 path end-to-end so the app is browser-usable, locally validated, and ready for the next deploy push.

## Last completed milestone
- Backend no-auth mode implemented and validated
- Backend smoke/failure tests updated for no-auth and passing
- Frontend home/workspaces flow updated for no-auth V1
- Frontend build passing
- Commits created:
  - `cf042d8` — `feat: complete no-auth v1 tax app flow`
  - `079f89b` — `feat: add no-auth backend mode for tax app`

## Next tasks
1. Perform a real browser interaction test of the no-auth frontend against the live backend
2. Close any UI/API integration gaps found during browser testing
3. Re-run integrated validation after fixes
4. Review against V1 definition of done
5. Resume deploy path only after browser-usable local validation is complete

## Known blockers
- None currently
- ACP/ClawDev runtime is unavailable in this environment, but that is not a blocker because local direct execution is available

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

## Definition of done
The no-auth V1 pass is done only when all of the following are true:
1. Frontend is browser-usable for the intended V1 flow
2. Frontend successfully talks to the live no-auth backend
3. Core local validation is passing
4. Remaining gaps are explicitly documented
5. The build is ready for the next deploy step without relying on obsolete auth assumptions

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && npm test`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
