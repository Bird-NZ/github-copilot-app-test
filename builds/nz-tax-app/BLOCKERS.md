# NZ Tax App Blockers

## Active blockers
- Deployment state inconsistency
  - Repo review artifacts imply build/review progression beyond README stage note
  - Azure prototype deploy state still shows most stages pending
  - Reconfirmed on 2026-03-23 17:02 NZ time
  - Local API verification still passes: `SMOKE_OK`, `FAILURE_TESTS_OK`
  - Next action: inspect auth/deploy assumptions and classify true deploy blocker path

- Azure AD B2C failure
  - Stage 4 marked failed in prototype deploy state
  - Reconfirmed on 2026-03-23 17:02 NZ time
  - Mitigation in progress: first-release frontend/deploy path has been refactored toward no-auth mode so B2C is no longer intended to be a hard dependency for initial deployment
  - Next action: validate the stage-15 deploy flow against the no-auth frontend path

## Resolved blockers
- None yet under the new mission-controller system
