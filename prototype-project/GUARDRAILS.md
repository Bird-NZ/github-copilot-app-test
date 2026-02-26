# Prototype Guardrails (Implemented)

Scope: `zd-rg-helloworld-dev-aue` in `australiaeast`

## 1) Budget cap + alerts
- Budget name: `prototype-project-monthly-cap`
- Scope: subscription, filtered to resource group `zd-rg-helloworld-dev-aue`
- Amount: **10 NZD/month** (configured as 10 in billing currency)
- Alerts: **50% / 80% / 100%** to account email + subscription owners

## 2) Region restriction
- Azure Policy assignment: `rg-allow-only-australiaeast`
- Only `australiaeast` allowed for resources in the prototype RG.

## 3) Resource type allowlist (blocks expensive services)
- Azure Policy assignment: `rg-allow-only-prototype-types`
- Allowed types:
  - `Microsoft.Insights/components`
  - `Microsoft.OperationalInsights/workspaces`
  - `Microsoft.Storage/storageAccounts`
  - `Microsoft.Storage/storageAccounts/blobServices/containers`
  - `Microsoft.ManagedIdentity/userAssignedIdentities`
  - `Microsoft.Web/serverfarms`
  - `Microsoft.Web/sites`
  - `Microsoft.Authorization/roleAssignments`

This intentionally blocks premium add-ons like APIM, private endpoints, NAT Gateway, etc.

## 4) Mandatory tagging
Required on resources and RG:
- `owner`
- `project`
- `env`
- `ttl`
- `costCap`

Current RG tags:
- `owner=mat`
- `project=prototype-project`
- `env=dev`
- `ttl=7d`
- `costCap=10NZD`
- `managedBy=az-prototype`

## 5) TTL cleanup helper
Use the destroy script when done:

```bash
bash /home/mat/.openclaw/workspace/prototype-project/scripts/destroy_prototype.sh
```

## 6) Daily cost check helper

```bash
bash /home/mat/.openclaw/workspace/prototype-project/scripts/check_costs.sh
```

---

If you want, I can also wire automatic daily checks and alert messages via OpenClaw heartbeat/cron.
