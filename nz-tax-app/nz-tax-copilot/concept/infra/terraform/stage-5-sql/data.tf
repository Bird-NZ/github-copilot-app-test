# Reference outputs from Stage 1: Foundation
data "terraform_remote_state" "stage1" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage1-foundation.tfstate"
  }
}

# Reference outputs from Stage 2: Networking
data "terraform_remote_state" "stage2" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage2-networking.tfstate"
  }
}

# Current Azure configuration
data "azurerm_client_config" "current" {}