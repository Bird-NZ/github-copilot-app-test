from azure.cosmos.aio import CosmosClient as AzureCosmosClient
from azure.cosmos import PartitionKey
from typing import Dict, Any, List
from functools import lru_cache
from .credential_provider import get_credential
from ..core.config import get_settings
import logging

logger = logging.getLogger(__name__)

@lru_cache()
def get_cosmos_client() -> AzureCosmosClient:
    """
    Get Cosmos DB client with managed identity authentication.
    
    Returns:
        CosmosClient: Async Cosmos DB client
    """
    settings = get_settings()
    credential = get_credential()
    
    client = AzureCosmosClient(
        url=settings.COSMOS_ENDPOINT,
        credential=credential
    )
    
    logger.info(f"Cosmos DB client initialized: {settings.COSMOS_ENDPOINT}")
    return client

class CosmosRepository:
    """
    Repository pattern for Cosmos DB operations.
    """
    
    def __init__(self):
        self.client = get_cosmos_client()
        self.settings = get_settings()
    
    async def get_container(self, container_name: str):
        """Get container client."""
        database = self.client.get_database_client(self.settings.COSMOS_DATABASE)
        return database.get_container_client(container_name)
    
    async def create_item(self, container_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
        """Create document in container."""
        container = await self.get_container(container_name)
        result = await container.create_item(body=item)
        logger.info(f"Created item in {container_name}: {item.get('id')}")
        return result
    
    async def upsert_item(self, container_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
        """Upsert document in container."""
        container = await self.get_container(container_name)
        result = await container.upsert_item(body=item)
        logger.info(f"Upserted item in {container_name}: {item.get('id')}")
        return result
    
    async def read_item(self, container_name: str, item_id: str, partition_key: str) -> Dict[str, Any]:
        """Read document by ID and partition key."""
        container = await self.get_container(container_name)
        result = await container.read_item(item=item_id, partition_key=partition_key)
        return result
    
    async def query_items(
        self, 
        container_name: str, 
        query: str, 
        parameters: List[Dict[str, Any]] = None,
        partition_key: str = None
    ) -> List[Dict[str, Any]]:
        """Query documents in container."""
        container = await self.get_container(container_name)
        
        items = []
        async for item in container.query_items(
            query=query,
            parameters=parameters or [],
            partition_key=partition_key
        ):
            items.append(item)
        
        logger.info(f"Query returned {len(items)} items from {container_name}")
        return items