from azure.identity import DefaultAzureCredential, ManagedIdentityCredential
from functools import lru_cache
from ..core.config import get_settings
import logging

logger = logging.getLogger(__name__)

@lru_cache()
def get_credential():
    """
    Get Azure credential for service authentication.
    
    Uses ManagedIdentityCredential with client_id if AZURE_CLIENT_ID is set
    (Container Apps deployment), otherwise DefaultAzureCredential for local dev.
    
    Returns:
        TokenCredential: Credential for Azure SDK clients
    """
    settings = get_settings()
    
    if settings.AZURE_CLIENT_ID:
        logger.info(f"Using ManagedIdentityCredential with client_id: {settings.AZURE_CLIENT_ID}")
        return ManagedIdentityCredential(client_id=settings.AZURE_CLIENT_ID)
    
    logger.info("Using DefaultAzureCredential (local development)")
    return DefaultAzureCredential()