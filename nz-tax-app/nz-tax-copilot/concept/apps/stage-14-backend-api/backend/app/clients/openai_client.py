from openai import AsyncAzureOpenAI
from azure.identity import get_bearer_token_provider
from functools import lru_cache
from .credential_provider import get_credential
from ..core.config import get_settings
import logging

logger = logging.getLogger(__name__)

@lru_cache()
def get_openai_client() -> AsyncAzureOpenAI:
    """
    Get Azure OpenAI client with managed identity authentication.
    
    Returns:
        AsyncAzureOpenAI: Async OpenAI client
    
    Note: Token provider may fail during initial deployment if RBAC
    role assignment has not yet propagated. Retry logic should be
    implemented in calling code.
    """
    settings = get_settings()
    credential = get_credential()
    
    try:
        # Token provider for Azure OpenAI SDK
        token_provider = get_bearer_token_provider(
            credential,
            "https://cognitiveservices.azure.com/.default"
        )
        
        client = AsyncAzureOpenAI(
            azure_endpoint=settings.OPENAI_ENDPOINT,
            azure_ad_token_provider=token_provider,
            api_version=settings.OPENAI_API_VERSION
        )
        
        logger.info(f"OpenAI client initialized: {settings.OPENAI_ENDPOINT}")
        return client
        
    except Exception as e:
        logger.error(f"Failed to initialize OpenAI client: {str(e)}")
        logger.error("This may be due to RBAC role assignment not yet propagated.")
        logger.error("Ensure 'Cognitive Services OpenAI User' role is assigned to managed identity.")
        raise