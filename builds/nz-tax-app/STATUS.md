# NZ Tax App Status

- Timestamp: 2026-03-23T17:02:00+13:00
- Current stage: Deploy diagnosis
- Current lane owner: HAL (mission control)
- Last completed milestone: mission controller deployed and tax app enrolled
- Current task: refactor first-release path to run without auth/login and validate the frontend build path
- Status: In Progress
- Current blocker: deploy path was coupled to Azure AD B2C and the frontend build had stale/broken files that prevent first-release packaging
- Next action: run the stage-15 deploy lane against the no-auth frontend path and verify whether Azure can progress without Stage 4 B2C outputs
- Next user-visible checkpoint: deploy-lane start or the next concrete Azure blocker
