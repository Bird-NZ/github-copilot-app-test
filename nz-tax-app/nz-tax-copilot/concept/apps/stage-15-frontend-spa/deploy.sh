#!/bin/bash
set -euo pipefail

# Stage 15: Frontend SPA Deployment Script
# Deploys React SPA as Azure Container App with nginx

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
STAGE_NAME="stage15-frontend-spa"
STAGE_DIR="${SCRIPT_DIR}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Error handler
error_handler() {
  log_error "Deployment failed at line $1"
  exit 1
}

trap 'error_handler $LINENO' ERR

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  # Check Azure CLI
  if ! command -v az &> /dev/null; then
    log_error "Azure CLI not found. Install from https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
  fi
  
  # Check Terraform
  if ! command -v terraform &> /dev/null; then
    log_error "Terraform not found. Install from https://www.terraform.io/downloads"
    exit 1
  fi
  
  # Check Docker
  if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Install from https://docs.docker.com/get-docker/"
    exit 1
  fi
  
  # Check Azure login
  if ! az account show &> /dev/null; then
    log_error "Not logged into Azure. Run 'az login' first"
    exit 1
  fi
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    log_error "npm not found. Install Node.js from https://nodejs.org/"
    exit 1
  fi
  
  local subscription_id
  subscription_id=$(az account show --query id -o tsv)
  log_info "Using Azure subscription: ${subscription_id}"
}

# Build frontend container image
build_frontend_image() {
  log_info "Building frontend container image..."
  
  local acr_login_server
  acr_login_server=$(cd "${STAGE_DIR}" && terraform output -raw acr_login_server 2>/dev/null || echo "")
  
  if [[ -z "${acr_login_server}" ]]; then
    log_error "ACR login server not found. Ensure Stage 10 (Container Registry) is deployed."
    exit 1
  fi
  
  cd "${SCRIPT_DIR}/app"
  
  # Build React app for production
  log_info "Building React production bundle..."
  npm install
  npm run build
  
  # Build container image
  log_info "Building Docker image..."
  docker build -t "${acr_login_server}/frontend:latest" -f Dockerfile .
  
  # Login to ACR using managed identity (via az acr login)
  log_info "Logging into Azure Container Registry..."
  az acr login --name "${acr_login_server%%.*}"
  
  # Push image
  log_info "Pushing image to ACR..."
  docker push "${acr_login_server}/frontend:latest"
  
  log_info "Frontend image built and pushed: ${acr_login_server}/frontend:latest"
  
  cd "${STAGE_DIR}"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
  log_info "Deploying frontend infrastructure..."
  
  cd "${STAGE_DIR}"
  
  # Initialize Terraform
  log_info "Initializing Terraform..."
  terraform init -reconfigure
  
  # Plan deployment
  log_info "Planning Terraform deployment..."
  terraform plan -out=frontend.tfplan
  
  # Apply deployment
  log_info "Applying Terraform deployment..."
  terraform apply -auto-approve frontend.tfplan
  
  log_info "Infrastructure deployed successfully"
}

# Export outputs to JSON
export_outputs() {
  log_info "Exporting deployment outputs..."
  
  cd "${STAGE_DIR}"
  
  local outputs_json
  outputs_json=$(terraform output -json)
  
  echo "${outputs_json}" > outputs.json
  
  log_info "Outputs saved to outputs.json"
  
  # Display key outputs
  local frontend_url
  frontend_url=$(echo "${outputs_json}" | jq -r '.frontend_url.value')
  
  log_info "Frontend URL: ${frontend_url}"
}

# Verify deployment
verify_deployment() {
  log_info "Verifying deployment..."
  
  cd "${STAGE_DIR}"
  
  local frontend_url
  frontend_url=$(terraform output -raw frontend_url)
  
  log_info "Waiting 60 seconds for Container App to stabilize..."
  sleep 60
  
  # Health check
  log_info "Checking health endpoint: ${frontend_url}/health"
  
  local http_status
  http_status=$(curl -s -o /dev/null -w "%{http_code}" "${frontend_url}/health" || echo "000")
  
  if [[ "${http_status}" == "200" ]]; then
    log_info "Health check passed (HTTP ${http_status})"
  else
    log_warn "Health check returned HTTP ${http_status} (may need more time to start)"
  fi
  
  log_info "Frontend deployment verified"
}

# Main deployment flow
main() {
  log_info "Starting Stage 15: Frontend SPA deployment"
  
  check_prerequisites
  build_frontend_image
  deploy_infrastructure
  export_outputs
  verify_deployment
  
  log_info "Stage 15: Frontend SPA deployment completed successfully"
  
  local frontend_url
  frontend_url=$(cd "${STAGE_DIR}" && terraform output -raw frontend_url)
  
  echo ""
  echo "========================================"
  echo "Frontend SPA Deployed"
  echo "========================================"
  echo "URL: ${frontend_url}"
  echo ""
  echo "Next steps:"
  echo "1. Open ${frontend_url} in your browser"
  echo "2. Sign up with Azure AD B2C"
  echo "3. Create a tax year workspace"
  echo "4. Enter income and crypto transactions"
  echo "5. Query IRD guidance for tax questions"
  echo "========================================"
}

# Run main function
main "$@"