#!/usr/bin/env bash
set -euo pipefail
AZ=${AZ:-$HOME/.local/bin/az}
RG=${RG:-zd-rg-helloworld-dev-aue}

if [[ "$($AZ group exists --name "$RG")" != "true" ]]; then
  echo "Resource group $RG does not exist. Nothing to destroy."
  exit 0
fi

echo "Deleting resource group: $RG"
$AZ group delete --name "$RG" --yes --no-wait

echo "Delete requested (async). Check status with:"
echo "  $AZ group exists --name $RG"
