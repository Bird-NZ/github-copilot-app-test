from azure.storage.blob.aio import BlobServiceClient
from azure.storage.blob import generate_blob_sas, BlobSasPermissions
from functools import lru_cache
from datetime import datetime, timedelta, timezone
from .credential_provider import get_credential
from ..core.config import get_settings
import logging

logger = logging.getLogger(__name__)

@lru_cache()
def get_blob_service_client() -> BlobServiceClient:
    """
    Get Blob Storage client with managed identity authentication.
    
    Returns:
        BlobServiceClient: Async blob service client
    """
    settings = get_settings()
    credential = get_credential()
    
    account_url = f"https://{settings.STORAGE_ACCOUNT_NAME}.blob.core.windows.net"
    
    client = BlobServiceClient(
        account_url=account_url,
        credential=credential
    )
    
    logger.info(f"Blob Storage client initialized: {account_url}")
    return client

class StorageRepository:
    """
    Repository pattern for Blob Storage operations.
    """
    
    def __init__(self):
        self.client = get_blob_service_client()
        self.settings = get_settings()
    
    async def generate_upload_sas(
        self, 
        container: str, 
        blob_path: str, 
        expiry_minutes: int = 15
    ) -> str:
        """
        Generate SAS token for client-side upload.
        
        Args:
            container: Container name
            blob_path: Blob path within container
            expiry_minutes: SAS token validity period
        
        Returns:
            str: Full blob URL with SAS token
        """
        # Get user delegation key for SAS token generation
        start_time = datetime.now(timezone.utc)
        expiry_time = start_time + timedelta(minutes=expiry_minutes)
        
        user_delegation_key = await self.client.get_user_delegation_key(
            key_start_time=start_time,
            key_expiry_time=expiry_time
        )
        
        # Generate SAS token with write-only permission
        sas_token = generate_blob_sas(
            account_name=self.settings.STORAGE_ACCOUNT_NAME,
            container_name=container,
            blob_name=blob_path,
            user_delegation_key=user_delegation_key,
            permission=BlobSasPermissions(write=True),
            expiry=expiry_time
        )
        
        blob_url = f"https://{self.settings.STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{container}/{blob_path}?{sas_token}"
        
        logger.info(f"Generated upload SAS for {blob_path} (expires in {expiry_minutes} min)")
        return blob_url
    
    async def generate_download_sas(
        self, 
        container: str, 
        blob_path: str, 
        expiry_minutes: int = 60
    ) -> str:
        """
        Generate SAS token for client-side download.
        
        Args:
            container: Container name
            blob_path: Blob path within container
            expiry_minutes: SAS token validity period
        
        Returns:
            str: Full blob URL with SAS token
        """
        start_time = datetime.now(timezone.utc)
        expiry_time = start_time + timedelta(minutes=expiry_minutes)
        
        user_delegation_key = await self.client.get_user_delegation_key(
            key_start_time=start_time,
            key_expiry_time=expiry_time
        )
        
        # Generate SAS token with read-only permission
        sas_token = generate_blob_sas(
            account_name=self.settings.STORAGE_ACCOUNT_NAME,
            container_name=container,
            blob_name=blob_path,
            user_delegation_key=user_delegation_key,
            permission=BlobSasPermissions(read=True),
            expiry=expiry_time
        )
        
        blob_url = f"https://{self.settings.STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{container}/{blob_path}?{sas_token}"
        
        logger.info(f"Generated download SAS for {blob_path} (expires in {expiry_minutes} min)")
        return blob_url
    
    async def blob_exists(self, container: str, blob_path: str) -> bool:
        """Check if blob exists."""
        container_client = self.client.get_container_client(container)
        blob_client = container_client.get_blob_client(blob_path)
        return await blob_client.exists()