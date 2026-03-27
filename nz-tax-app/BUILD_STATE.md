# NZ Tax App — Build State

## Current stage
- Stage 10 / Closeout complete for the auth/persistence/calc/export/polish tranche
- Stage 9 / Deploy is complete for this tranche
- Stage 7 / Test is complete for this tranche

## Current objective
This tranche is closed out. The next step is to begin the next approved scope/tranche.

## Last completed milestone
- Simple local login implemented and deployed to new revisions
- Persistent storage implemented for users, sessions, workspaces, income, crypto, audit, and documents
- Improved tax logic implemented with progressive NZ tax bands
- IR3 plain-English explanations implemented
- Real PDF generation implemented with PDFKit
- Export/download flow improved in backend + frontend UI
- Homepage and workspace UI received broader visual polish
- Local validation passed for this tranche:
  - backend tests pass
  - frontend build passes
- Remote rollout status:
  - backend image rebuilt and pushed
  - frontend image rebuilt and pushed
  - API revision `zd-ca-api-dev-aue--calc210250` verified live with `authMode=local`
  - web revision `zd-ca-web-dev-aue--polish210855` verified live with the new bundle/assets

## Next tasks
1. Start the next requested scope/tranche
2. Re-run local validation if the next tranche changes backend or frontend behavior
3. Keep Azure hostname drift in mind on future rollouts, but no active wait/recheck is required for this tranche

## Known blockers
- No product/code blocker remains for this tranche
- No active deployment lag remains at closeout time: the stable frontend hostname and pinned web revision were both serving the same asset bundle (`/assets/index-CVs5voSE.js`) when rechecked

## Real blocker threshold
Only stop and wait for Mat if one of these is true:
1. A product/spec decision is required from Mat
2. Credentials, secrets, permissions, payment, or external approval are required and unavailable
3. A destructive action needs explicit consent
4. A hard platform/tool/runtime limit exists with no viable workaround

## Definition of done for current tranche
This tranche is done when all of the following are true:
1. Local auth is active in the deployed backend/frontend path
2. Persistent storage is active in the deployed backend path
3. Improved tax logic + explanation + PDF/export stack are implemented and validated locally
4. Frontend export/download + polish changes are built successfully
5. New backend/frontend revisions are deployed
6. Completion is documented and committed
7. Stable frontend hostname has been rechecked after rollout closeout

## Closeout verification
- Rechecked stable frontend hostname: `https://zd-ca-web-dev-aue.agreeablesky-1ad949ae.australiaeast.azurecontainerapps.io`
- Rechecked pinned web revision: `https://zd-ca-web-dev-aue--polish210855.agreeablesky-1ad949ae.australiaeast.azurecontainerapps.io`
- Rechecked pinned API revision health: `https://zd-ca-api-dev-aue--calc210250.agreeablesky-1ad949ae.australiaeast.azurecontainerapps.io/health`
- Stable frontend hostname and pinned web revision both served the same current asset bundle: `/assets/index-CVs5voSE.js`
- API health returned `{"ok":true,"authMode":"local"}`

## Last validated commands
- `cd /home/mat/.openclaw/workspace/nz-tax-app/src/api && npm test`
- `cd /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend && npm run build`
- `az acr build -r zdacrtaxdevaue -t api:latest /home/mat/.openclaw/workspace/nz-tax-app/src/api`
- `az containerapp update -n zd-ca-api-dev-aue -g zd-rg-tax-dev-aue --image zdacrtaxdevaue.azurecr.io/api:latest --set-env-vars AUTH_MODE=local --revision-suffix calc...`
- `az acr build -r zdacrtaxdevaue -t frontend:latest --build-arg VITE_API_URL=https://zd-ca-api-dev-aue--calc210250.agreeablesky-1ad949ae.australiaeast.azurecontainerapps.io --build-arg VITE_AUTH_MODE=local /home/mat/.openclaw/workspace/nz-tax-app/nz-tax-copilot/concept/apps/stage-15-frontend-spa/frontend`
- `az containerapp update -n zd-ca-web-dev-aue -g zd-rg-tax-dev-aue --image zdacrtaxdevaue.azurecr.io/frontend:latest --revision-suffix polish...`
