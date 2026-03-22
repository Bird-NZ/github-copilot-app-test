from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables.
    
    Environment variables are set by Container Apps from Key Vault references.
    See deploy.sh for mapping of Terraform outputs to environment variables.
    """
    
    # Environment
    ENVIRONMENT: str = "dev"
    
    # Azure Managed Identity
    # Set from Terraform output: BACKEND_API_IDENTITY_CLIENT_ID
    AZURE_CLIENT_ID: str | None = None
    
    # Database Configuration
    # Endpoint URLs from Key Vault references (not secrets)
    COSMOS_ENDPOINT: str
    COSMOS_DATABASE: str = "TaxCopilotDB"
    
    SQL_SERVER_FQDN: str
    SQL_DATABASE: str = "TaxCopilotDB"
    
    # Azure OpenAI Configuration
    OPENAI_ENDPOINT: str
    # API version - configurable for version changes
    OPENAI_API_VERSION: str = "2024-02-01"
    OPENAI_GPT4O_DEPLOYMENT: str = "gpt-4o"
    OPENAI_EMBEDDING_DEPLOYMENT: str = "text-embedding-ada-002"
    
    # AI Search Configuration
    AI_SEARCH_ENDPOINT: str
    AI_SEARCH_INDEX: str = "ird-guidance"
    
    # Storage Configuration
    STORAGE_ACCOUNT_NAME: str
    STORAGE_CONTAINER_DOCUMENTS: str = "tax-documents"
    STORAGE_CONTAINER_EXPORTS: str = "export-output"
    
    # Azure AD B2C Configuration
    B2C_TENANT_NAME: str
    B2C_TENANT_ID: str
    B2C_POLICY_NAME: str = "B2C_1_signup_signin"
    B2C_CLIENT_ID: str  # Backend API client ID
    
    # Application Insights
    APPLICATIONINSIGHTS_CONNECTION_STRING: str
    
    # CORS Origins
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()