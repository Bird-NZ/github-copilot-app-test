terraform {
  required_version = ">= 1.9.0"

  required_providers {
    azapi = {
      source  = "azure/azapi"
      version = "~> 2.8.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0, < 5.0"
    }
  }

  # Local state for POC deployment
  # Production: Use remote backend with explicit resource_group_name, storage_account_name, container_name, key
  backend "local" {
    path = "../.terraform-state/stage2-networking.tfstate"
  }
}

provider "azapi" {
  # Subscription is set via az account or prototype.secrets.yaml
}

provider "azurerm" {
  features {}

  # Subscription is set via az account or prototype.secrets.yaml
  subscription_id = var.subscription_id
}