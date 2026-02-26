#!/usr/bin/env bash
set -euo pipefail
AZ=${AZ:-$HOME/.local/bin/az}
SUB_ID=$($AZ account show --query id -o tsv)
RG=${RG:-zd-rg-helloworld-dev-aue}
BUDGET_NAME=${BUDGET_NAME:-prototype-project-monthly-cap}

echo "=== Budget ==="
$AZ rest --method get \
  --url "https://management.azure.com/subscriptions/${SUB_ID}/providers/Microsoft.Consumption/budgets/${BUDGET_NAME}?api-version=2024-08-01" \
  --query "{name:name,amount:properties.amount,timeGrain:properties.timeGrain,filter:properties.filter.dimensions.values,notifications:properties.notifications}" -o jsonc

echo

echo "=== Last 30 days usage (RG filter) ==="
$AZ consumption usage list --start-date "$(date -u -d '-30 day' +%Y-%m-%d)" --end-date "$(date -u +%Y-%m-%d)" \
  --query "[?contains(instanceName, '${RG}')].[usageStart,usageEnd,meterCategory,pretaxCost,currency]" -o table || true
