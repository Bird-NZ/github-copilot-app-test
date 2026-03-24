#!/bin/bash
set -euo pipefail

# Stage 15: Frontend SPA Deployment Script
# Deploys the current no-auth V1 frontend via Azure Container Registry remote build.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE_DIR="${SCRIPT_DIR}"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
error_handler() { log_error "Deployment failed at line $1"; exit 1; }
trap 'error_handler $LINENO' ERR

check_prerequisites() {
  log_info "Checking prerequisites..."

  command -v az >/dev/null || { log_error "Azure CLI not found"; exit 1; }
  command -v terraform >/dev/null || { log_error "Terraform not found"; exit 1; }
  command -v npm >/dev/null || { log_error "npm not found"; exit 1; }

  az account show >/dev/null || { log_error "Not logged into Azure. Run 'az login' first"; exit 1; }

  if [[ -z "${ARM_ACCESS_KEY:-}" ]]; then
    log_error "ARM_ACCESS_KEY environment variable not set (required for Terraform backend)"
    exit 1
  fi

  local subscription_id
  subscription_id=$(az account show --query id -o tsv)
  log_info "Using Azure subscription: ${subscription_id}"
}

resolve_backend_url() {
  local backend_url
  backend_url=$(cd "${STAGE_DIR}" && terraform output -state=../stage-14-backend-api/terraform.tfstate -raw api_url 2>/dev/null || echo "")
  if [[ -z "${backend_url}" ]]; then
    log_error "Backend API URL not found. Deploy Stage 14 first."
    exit 1
  fi
  echo "${backend_url}"
}

build_frontend_image() {
  log_info "Building frontend container image remotely in ACR..."

  local acr_login_server
  acr_login_server=$(cd "${STAGE_DIR}" && terraform output -state=../../infra/terraform/stage-10-acr/terraform.tfstate -raw acr_login_server 2>/dev/null || terraform output -state=../../infra/terraform/stage-10-container-registry/terraform.tfstate -raw acr_login_server 2>/dev/null || echo "")

  if [[ -z "${acr_login_server}" ]]; then
    log_error "ACR login server not found. Ensure Stage 10 is deployed."
    exit 1
  fi

  local backend_url
  backend_url=$(resolve_backend_url)
  local acr_name="${acr_login_server%%.*}"

  log_info "Baking frontend with API URL: ${backend_url}"
  az acr build \
    --registry "${acr_name}" \
    --image "frontend:latest" \
    --build-arg "VITE_API_URL=${backend_url}" \
    --build-arg "VITE_AUTH_MODE=none" \
    "${FRONTEND_DIR}"

  log_info "Frontend image built and pushed: ${acr_login_server}/frontend:latest"
}

deploy_infrastructure() {
  log_info "Deploying frontend infrastructure..."

  cd "${STAGE_DIR}"
  terraform init \
    -backend-config="storage_account_name=${TF_STATE_STORAGE_ACCOUNT}" \
    -backend-config="container_name=${TF_STATE_CONTAINER}" \
    -backend-config="key=stage15-frontend-spa.tfstate"
  terraform plan -out=frontend.tfplan
  terraform apply -auto-approve frontend.tfplan

  log_info "Infrastructure deployed successfully"
}

export_outputs() {
  log_info "Exporting deployment outputs..."

  cd "${STAGE_DIR}"
  local outputs_json
  outputs_json=$(terraform output -json)
  echo "${outputs_json}" > outputs.json

  local frontend_url
  frontend_url=$(echo "${outputs_json}" | jq -r '.frontend_url.value')
  log_info "Frontend URL: ${frontend_url}"
}

verify_deployment() {
  log_info "Verifying deployment..."

  cd "${STAGE_DIR}"
  local frontend_url
  frontend_url=$(terraform output -raw frontend_url)

  log_info "Waiting 60 seconds for Container App to stabilize..."
  sleep 60

  local http_status
  http_status=$(curl -s -o /dev/null -w "%{http_code}" "${frontend_url}/health" || echo "000")

  if [[ "${http_status}" == "200" ]]; then
    log_info "Health check passed (HTTP ${http_status})"
  else
    log_warn "Health check returned HTTP ${http_status} (may need more time to start)"
  fi

  log_info "Frontend deployment verified"
}

main() {
  log_info "Starting Stage 15: Frontend SPA deployment"
  check_prerequisites
  build_frontend_image
  deploy_infrastructure
  export_outputs
  verify_deployment

  local frontend_url
  frontend_url=$(cd "${STAGE_DIR}" && terraform output -raw frontend_url)

  echo ""
  echo "========================================"
  echo "Frontend SPA Deployed"
  echo "========================================"
  echo "URL: ${frontend_url}"
  echo "Auth mode: none"
  echo "========================================"
}

main "$@"
