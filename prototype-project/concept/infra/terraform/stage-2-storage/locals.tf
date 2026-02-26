# Read outputs from Stage 1 Foundation
data "terraform_remote_state" "foundation" {
  backend = "local"
  config = {
    path = var.stage1_state_path
  }
}

locals {
  # Stage 1 outputs
  resource_group_name = data.terraform_remote_state.foundation.outputs.resource_group_name
  resource_group_id   = data.terraform_remote_state.foundation.outputs.resource_group_id
  location            = data.terraform_remote_state.foundation.outputs.location
  common_tags         = data.terraform_remote_state.foundation.outputs.tags
  
  # Naming convention: microsoft-alz strategy
  # Zone: zd (Development Zone)
  # Pattern: {zoneid}-{type}-{service}-{env}-{region_short}
  storage_account_name = "zdsthelloworlddevaue"  # Lowercase, no hyphens (Storage account constraint)
  container_name       = "function-output"
  identity_name        = "zd-id-helloworld-dev-aue"
}