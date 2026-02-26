terraform {
  required_version = ">= 1.9.0"
  
  required_providers {
    azapi = {
      source  = "azure/azapi"
      version = "~> 2.8.0"
    }
  }
  
  backend "local" {
    path = "../.terraform-state/stage3.tfstate"
  }
}

provider "azapi" {
  subscription_id = var.subscription_id
}