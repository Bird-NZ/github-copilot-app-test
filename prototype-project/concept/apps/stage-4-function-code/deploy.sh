#!/bin/bash
set -euo pipefail

#############################################
# Stage 4: Function Code Deployment Script
#############################################
# Deploys Python function code to existing Azure Function App
# Prerequisites: Azure CLI, Azure Functions Core Tools
# Dependencies: Stage 3 outputs (function app must exist)

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE_NAME="stage-4-function-code"
OUTPUTS_FILE="$SCRIPT_DIR/outputs.json"

# Logging functions
log_info() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $*"
}

log_warn() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $*" >&2
}

log_error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
}

# Error handler
trap 'log_error "Deployment failed at line $LINENO. Exit code: $?"' ERR

#############################################
# Prerequisite Checks
#############################################

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    
    # Check Azure Functions Core Tools
    if ! command -v func &> /dev/null; then
        log_error "Azure Functions Core Tools not installed. Install from: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local"
        exit 1
    fi
    
    # Check jq for JSON parsing
    if ! command -v jq &> /dev/null; then
        log_warn "jq is not installed. Install for better JSON parsing: brew install jq (macOS) or apt-get install jq (Linux)"
    fi
    
    # Check Azure login status
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Run: az login"
        exit 1
    fi
    
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
    SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
    log_info "✓ Using subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"
    
    # Verify func version
    FUNC_VERSION=$(func --version)
    log_info "✓ Azure Functions Core Tools version: $FUNC_VERSION"
}

#############################################
# Load Stage 3 Outputs
#############################################

load_stage_outputs() {
    log_info "Loading Stage 3 outputs..."

    # Try multiple known output locations first
    CANDIDATES=(
      "$SCRIPT_DIR/../stage-3-function-app/outputs.json"
      "$SCRIPT_DIR/../../infra/terraform/stage-3-function/outputs.json"
      "$SCRIPT_DIR/../../infra/terraform/stage-3-outputs.json"
    )

    STAGE3_OUTPUTS=""
    for f in "${CANDIDATES[@]}"; do
      if [ -f "$f" ]; then
        STAGE3_OUTPUTS="$f"
        break
      fi
    done

    if [ -n "$STAGE3_OUTPUTS" ]; then
      # Extract function app name from Stage 3 outputs
      if command -v jq &> /dev/null; then
          FUNCTION_APP_NAME=$(jq -r '.function_app_name.value // empty' "$STAGE3_OUTPUTS")
          RESOURCE_GROUP=$(jq -r '.resource_group_name.value // empty' "$STAGE3_OUTPUTS")
      else
          # Fallback: parse JSON without jq (less robust)
          FUNCTION_APP_NAME=$(grep -o '"function_app_name"[^}]*"value"[^"]*"[^"]*"' "$STAGE3_OUTPUTS" | sed -n 's/.*"value"[^"]*"\([^"]*\)".*/\1/p')
          RESOURCE_GROUP=$(grep -o '"resource_group_name"[^}]*"value"[^"]*"[^"]*"' "$STAGE3_OUTPUTS" | sed -n 's/.*"value"[^"]*"\([^"]*\)".*/\1/p')
      fi
    fi

    # Fallback discovery when outputs file is missing or incomplete
    if [ -z "${RESOURCE_GROUP:-}" ]; then
      RESOURCE_GROUP="zd-rg-helloworld-dev-aue"
    fi

    if [ -z "${FUNCTION_APP_NAME:-}" ]; then
      FUNCTION_APP_NAME=$(az functionapp list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv 2>/dev/null || true)
    fi

    if [ -z "$FUNCTION_APP_NAME" ] || [ "$FUNCTION_APP_NAME" = "null" ]; then
        log_error "Could not determine Function App name (outputs missing and auto-discovery failed)"
        exit 1
    fi

    if [ -z "$RESOURCE_GROUP" ]; then
        log_error "Could not determine resource group"
        exit 1
    fi

    log_info "✓ Function App: $FUNCTION_APP_NAME"
    log_info "✓ Resource Group: $RESOURCE_GROUP"
}

#############################################
# Verify Function App Exists
#############################################

verify_function_app_exists() {
    log_info "Verifying Function App exists..."
    
    if ! az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        log_error "Function App not found: $FUNCTION_APP_NAME"
        log_error "Ensure Stage 3 deployment completed successfully"
        exit 1
    fi
    
    # Check function app state
    STATE=$(az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" --query "state" -o tsv)
    if [ "$STATE" != "Running" ]; then
        log_warn "Function App is not running (state: $STATE)"
        log_info "Starting Function App..."
        az functionapp start --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP"
        sleep 10
    fi
    
    log_info "✓ Function App is running"
}

#############################################
# Configure App Settings (if needed)
#############################################

configure_app_settings() {
    log_info "Verifying application settings..."
    
    # Get current app settings
    CURRENT_SETTINGS=$(az functionapp config appsettings list \
        --name "$FUNCTION_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "[].{name:name, value:value}" -o json)
    
    # Check required settings exist
    REQUIRED_SETTINGS=("STORAGE_ACCOUNT_NAME" "STORAGE_CONTAINER_NAME" "AZURE_CLIENT_ID" "APPLICATIONINSIGHTS_CONNECTION_STRING")
    
    for SETTING in "${REQUIRED_SETTINGS[@]}"; do
        if ! echo "$CURRENT_SETTINGS" | grep -q "\"name\": \"$SETTING\""; then
            log_error "Missing required app setting: $SETTING"
            log_error "App settings should be configured in Stage 3 deployment"
            exit 1
        fi
    done
    
    log_info "✓ All required app settings configured"
}

#############################################
# Deploy Function Code
#############################################

deploy_function_code() {
    log_info "Deploying function code..."
    
    # Change to script directory (where function_app.py is located)
    cd "$SCRIPT_DIR"
    
    # Verify function files exist
    if [ ! -f "function_app.py" ]; then
        log_error "function_app.py not found in $SCRIPT_DIR"
        exit 1
    fi
    
    if [ ! -f "requirements.txt" ]; then
        log_error "requirements.txt not found in $SCRIPT_DIR"
        exit 1
    fi
    
    if [ ! -f "host.json" ]; then
        log_error "host.json not found in $SCRIPT_DIR"
        exit 1
    fi
    
    log_info "Packaging and uploading function code..."
    
    # Deploy function app
    # --build remote: Build remotely on Azure (recommended for Linux functions)
    # --python: Python runtime
    func azure functionapp publish "$FUNCTION_APP_NAME" \
        --build remote \
        --python 2>&1 | tee deployment.log
    
    DEPLOY_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
        log_error "Function deployment failed with exit code $DEPLOY_EXIT_CODE"
        log_error "Check deployment.log for details"
        exit $DEPLOY_EXIT_CODE
    fi
    
    log_info "✓ Function code deployed successfully"
    
    # Wait for deployment to propagate
    log_info "Waiting 30 seconds for deployment to propagate..."
    sleep 30
}

#############################################
# Test Function Endpoint
#############################################

test_function_endpoint() {
    log_info "Testing function endpoint..."
    
    FUNCTION_URL="https://${FUNCTION_APP_NAME}.azurewebsites.net/api/hello"
    log_info "Testing: $FUNCTION_URL"
    
    # Test hello endpoint
    RESPONSE=$(curl -s -w "\n%{http_code}" "$FUNCTION_URL" 2>/dev/null || echo -e "\n000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" == "200" ] && [ "$BODY" == "Hello World" ]; then
        log_info "✓ Function endpoint test PASSED"
        log_info "Response: $BODY"
    else
        log_error "Function endpoint test FAILED"
        log_error "HTTP Code: $HTTP_CODE"
        log_error "Response: $BODY"
        exit 1
    fi
    
    # Test health endpoint
    HEALTH_URL="https://${FUNCTION_APP_NAME}.azurewebsites.net/api/health"
    log_info "Testing: $HEALTH_URL"
    
    HEALTH_RESPONSE=$(curl -s "$HEALTH_URL" 2>/dev/null || echo '{"status":"error"}')
    
    if command -v jq &> /dev/null; then
        HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status // "unknown"')
    else
        HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status"[^"]*"[^"]*"' | sed -n 's/.*"status"[^"]*"\([^"]*\)".*/\1/p')
    fi
    
    if [ "$HEALTH_STATUS" == "healthy" ]; then
        log_info "✓ Health check PASSED"
    else
        log_warn "Health check returned: $HEALTH_STATUS"
    fi
}

#############################################
# Save Deployment Outputs
#############################################

save_outputs() {
    log_info "Saving deployment outputs..."
    
    # Construct outputs JSON
    cat > "$OUTPUTS_FILE" <<EOF
{
  "function_app_name": {
    "value": "$FUNCTION_APP_NAME"
  },
  "function_url": {
    "value": "https://${FUNCTION_APP_NAME}.azurewebsites.net/api/hello"
  },
  "health_url": {
    "value": "https://${FUNCTION_APP_NAME}.azurewebsites.net/api/health"
  },
  "deployment_timestamp": {
    "value": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  },
  "deployment_log": {
    "value": "deployment.log"
  }
}
EOF
    
    log_info "✓ Outputs saved to: $OUTPUTS_FILE"
}

#############################################
# Main Execution
#############################################

main() {
    log_info "=========================================="
    log_info "Stage 4: Function Code Deployment"
    log_info "=========================================="
    
    check_prerequisites
    load_stage_outputs
    verify_function_app_exists
    configure_app_settings
    deploy_function_code
    test_function_endpoint
    save_outputs
    
    log_info "=========================================="
    log_info "✓ Stage 4 deployment completed successfully"
    log_info "=========================================="
    log_info ""
    log_info "Function URLs:"
    log_info "  Hello endpoint: https://${FUNCTION_APP_NAME}.azurewebsites.net/api/hello"
    log_info "  Health endpoint: https://${FUNCTION_APP_NAME}.azurewebsites.net/api/health"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Test function: curl https://${FUNCTION_APP_NAME}.azurewebsites.net/api/hello"
    log_info "  2. View logs: func azure functionapp logstream $FUNCTION_APP_NAME"
    log_info "  3. Monitor in Azure Portal: Application Insights > Live Metrics"
    log_info ""
    log_info "Deployment outputs saved to: $OUTPUTS_FILE"
}

# Execute main function
main "$@"