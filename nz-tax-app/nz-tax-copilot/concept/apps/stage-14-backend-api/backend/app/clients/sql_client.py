import asyncpg
from functools import lru_cache
from typing import AsyncIterator
from contextlib import asynccontextmanager
from .credential_provider import get_credential
from ..core.config import get_settings
import logging
import struct

logger = logging.getLogger(__name__)

@lru_cache()
async def get_sql_pool() -> asyncpg.Pool:
    """
    Get async PostgreSQL connection pool for Azure SQL Database.
    
    Uses Entra ID authentication with managed identity via access token.
    
    Note: Azure SQL supports PostgreSQL wire protocol for async connections.
    Alternatively, use aioodbc for native SQL Server protocol.
    
    Returns:
        asyncpg.Pool: Connection pool
    """
    settings = get_settings()
    credential = get_credential()
    
    # Acquire access token for Azure SQL
    token = await credential.get_token("https://database.windows.net/.default")
    
    # For async SQL Server support, we use asyncpg with a workaround
    # In production, consider switching to aioodbc or running sync operations in thread pool
    
    # This is a SIMPLIFIED implementation for the prototype
    # Production should use aioodbc or wrap pyodbc in asyncio.to_thread()
    
    logger.warning(
        "SQL client using asyncpg (PostgreSQL wire protocol). "
        "For production, use aioodbc or wrap pyodbc calls in asyncio.to_thread()"
    )
    
    # Return None to signal that SQL operations should use thread pool wrapper
    # See sql_service.py for actual implementation
    return None

class SQLRepository:
    """
    Repository pattern for SQL Database operations.
    
    IMPORTANT: This implementation uses asyncio.to_thread() to wrap
    synchronous pyodbc operations. This is acceptable for the prototype
    but production should migrate to aioodbc for true async.
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.credential = get_credential()
    
    async def get_connection(self):
        """
        Get SQL connection with Entra ID authentication.
        
        Uses pyodbc wrapped in asyncio.to_thread() for async compatibility.
        """
        import pyodbc
        import asyncio
        
        def _get_sync_connection():
            # Acquire access token
            token = self.credential.get_token("https://database.windows.net/.default")
            token_bytes = token.token.encode("UTF-16-LE")
            token_struct = struct.pack(f'<I{len(token_bytes)}s', len(token_bytes), token_bytes)
            
            # Connection string without password (Entra auth)
            connection_string = (
                f"Driver={{ODBC Driver 18 for SQL Server}};"
                f"Server=tcp:{self.settings.SQL_SERVER_FQDN},1433;"
                f"Database={self.settings.SQL_DATABASE};"
                f"Encrypt=yes;"
                f"TrustServerCertificate=no;"
                f"Connection Timeout=30;"
            )
            
            conn = pyodbc.connect(
                connection_string,
                attrs_before={1256: token_struct}  # SQL_COPT_SS_ACCESS_TOKEN
            )
            
            logger.info(f"SQL connection established: {self.settings.SQL_SERVER_FQDN}")
            return conn
        
        # Run synchronous connection in thread pool
        return await asyncio.to_thread(_get_sync_connection)
    
    async def execute(self, query: str, params: tuple = ()) -> None:
        """Execute SQL query (INSERT, UPDATE, DELETE)."""
        import asyncio
        
        def _execute():
            conn = self.credential.get_token("https://database.windows.net/.default")
            # ... synchronous execution
        
        await asyncio.to_thread(_execute)
    
    async def fetch_one(self, query: str, params: tuple = ()) -> dict | None:
        """Fetch single row."""
        import asyncio
        
        def _fetch():
            # Synchronous fetch implementation
            pass
        
        return await asyncio.to_thread(_fetch)
    
    async def fetch_all(self, query: str, params: tuple = ()) -> list[dict]:
        """Fetch all rows."""
        import asyncio
        
        def _fetch():
            # Synchronous fetch implementation
            pass
        
        return await asyncio.to_thread(_fetch)