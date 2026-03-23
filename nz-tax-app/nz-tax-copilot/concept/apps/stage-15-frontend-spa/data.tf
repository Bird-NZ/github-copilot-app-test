# Import outputs from prior stages via terraform_remote_state

data "terraform_remote_state" "stage1_foundation" {
  backend = "azurerm"
  config = {
    key = "stage1-foundation.tfstate"
  }
}

data "terraform_remote_state" "stage2_networking" {
  backend = "azurerm"
  config = {
    key = "stage2-networking.tfstate"
  }
}

data "terraform_remote_state" "stage3_keyvault" {
  backend = "azurerm"
  config = {
    key = "stage3-keyvault.tfstate"
  }
}

data "terraform_remote_state" "stage10_acr" {
  backend = "azurerm"
  config = {
    key = "stage10-acr.tfstate"
  }
}

data "terraform_remote_state" "stage11_cae" {
  backend = "azurerm"
  config = {
    key = "stage11-cae.tfstate"
  }
}

data "terraform_remote_state" "stage14_backend" {
  backend = "azurerm"
  config = {
    key = "stage14-backend-api.tfstate"
  }
}

locals {
  # Stage 1: Foundation
  resource_group_name           = data.terraform_remote_state.stage1_foundation.outputs.resource_group_name
  location                      = data.terraform_remote_state.stage1_foundation.outputs.location
  log_analytics_workspace_id    = data.terraform_remote_state.stage1_foundation.outputs.log_analytics_workspace_id

  # Stage 3: Key Vault
  key_vault_id                  = data.terraform_remote_state.stage3_keyvault.outputs.key_vault_id

  # Stage 10: Container Registry
  acr_id                        = data.terraform_remote_state.stage10_acr.outputs.acr_id
  acr_login_server              = data.terraform_remote_state.stage10_acr.outputs.acr_login_server

  # Stage 11: Container Apps Environment
  container_apps_environment_id = data.terraform_remote_state.stage11_cae.outputs.container_apps_environment_id

  # Stage 14: Backend API
  backend_api_fqdn              = data.terraform_remote_state.stage14_backend.outputs.backend_api_fqdn
}
