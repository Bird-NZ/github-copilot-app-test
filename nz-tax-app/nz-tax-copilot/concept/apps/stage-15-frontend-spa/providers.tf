terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azapi = {
      source  = "azure/azapi"
      version = "~> 1.9"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }
  
  backend "azurerm" {
    key = "stage15-frontend-spa.tfstate"
  }
}

provider "azapi" {
  # No configuration needed — uses AzureRM provider auth
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
}

# Current Azure subscription and tenant info
data "azurerm_client_config" "current" {}