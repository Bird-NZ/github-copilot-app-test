# Read outputs from Stage 1 (Foundation)
data "terraform_remote_state" "foundation" {
  backend = "local"
  config = {
    path = "../stage-1-foundation/terraform.tfstate"
  }
}

# Read outputs from Stage 2 (Storage)
data "terraform_remote_state" "storage" {
  backend = "local"
  config = {
    path = "../stage-2-storage/terraform.tfstate"
  }
}