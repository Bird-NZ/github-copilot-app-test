#!/usr/bin/env bash
set -euo pipefail

# AZ Prototype demo commands
# Run from anywhere: bash /home/mat/.openclaw/workspace/docs/az-prototype-demo/commands.sh

DEMO_ROOT="${HOME}/.openclaw/workspace/tmp/az-prototype-demo"
PROJECT_NAME="retail-insights-demo"
LOCATION="australiaeast"
AI_PROVIDER="github-models"
IAC_TOOL="terraform"
TEMPLATE="ai-app"
PROJECT_DIR="${DEMO_ROOT}/${PROJECT_NAME}"
REQ_SRC="/home/mat/.openclaw/workspace/docs/az-prototype-demo/demo-requirements.md"

mkdir -p "${DEMO_ROOT}"

echo "=== 0) Preflight ==="
az version
az extension show --name prototype
az account show --output table
gh auth status

echo
echo "=== 1) Show built-in agents ==="
az prototype agent list

echo
echo "=== 2) Create fresh demo project ==="
rm -rf "${PROJECT_DIR}"
az prototype init \
  --name "${PROJECT_NAME}" \
  --location "${LOCATION}" \
  --ai-provider "${AI_PROVIDER}" \
  --iac-tool "${IAC_TOOL}" \
  --template "${TEMPLATE}" \
  --output-dir "${DEMO_ROOT}"

cd "${PROJECT_DIR}"

echo
echo "=== 3) Show project config ==="
ls -la
cat prototype.yaml

echo
echo "=== 4) Prepare requirement artifact ==="
mkdir -p requirements
cp "${REQ_SRC}" ./requirements/demo-requirements.md
ls -la requirements

echo
echo "=== 5) Run design from artifact ==="
az prototype design --artifacts ./requirements --context "Use a pragmatic, demo-friendly Azure architecture with clear next-phase production path."

echo
echo "=== 6) Show current project status ==="
az prototype status --detailed || az prototype status

echo
echo "=== 7) Build generated assets ==="
az prototype build

echo
echo "=== 8) Show build status ==="
az prototype build --status

echo
echo "=== 9) Safe deployment preview ==="
az prototype deploy --dry-run

echo
echo "=== 10) Show deploy status ==="
az prototype deploy --status

echo
echo "=== 11) Demo agent inspection ==="
az prototype agent show --name cloud-architect
az prototype agent show --name app-developer
az prototype agent show --name security-reviewer

echo
echo "=== 12) Optional: test an agent ==="
az prototype agent test --name cost-analyst --prompt "Estimate likely prototype cost posture for this retail insights demo and explain the main cost drivers."

echo
echo "=== 13) Optional: export agent definition ==="
az prototype agent export --name cloud-architect --output-file ./cloud-architect.yaml || true

echo
echo "=== 14) Optional: generate docs / backlog ==="
az prototype generate docs || true
az prototype generate backlog || true

echo
echo "Demo project ready at: ${PROJECT_DIR}"
echo "Next interactive step if you want live deployment:"
echo "  cd ${PROJECT_DIR} && az prototype deploy"
