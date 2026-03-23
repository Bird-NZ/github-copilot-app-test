# NZ Tax App Runbook

## Key paths
- Repo: /home/mat/.openclaw/workspace/nz-tax-app
- API: /home/mat/.openclaw/workspace/nz-tax-app/src/api
- Azure prototype state: /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/.prototype/state
- Deploy state file: /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/.prototype/state/deploy.yaml
- Deployment outputs: /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/.prototype/state/deployment_outputs.json

## Build evidence currently known
- Stage 8 review gate passed for Sprint 1 skeleton scope
- smoke/failure tests were previously reported as passing in review artifact

## Build commands to verify
- cd /home/mat/.openclaw/workspace/nz-tax-app/src/api
- npm run test:smoke
- npm run test:failure

## Deploy investigation commands
- inspect deploy.yaml status for each stage
- inspect deployment_outputs.json for actually created Azure resources
- determine whether az-prototype can resume deploy flow safely

## Verification checks
- identify live endpoint/UI if deployed
- verify app/API availability
- verify at least one critical user flow

## Recovery focus
1. reconcile docs vs actual state
2. resolve Azure AD B2C failure
3. continue deploy stages in order
4. verify live surface
