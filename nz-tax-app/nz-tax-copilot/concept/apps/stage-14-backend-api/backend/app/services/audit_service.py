import asyncio
from typing import Dict, Any
from datetime import datetime
import json
from ..clients.sql_client import SQLRepository

class AuditService:
    """
    Service for writing audit log entries to SQL Database.
    """
    
    def __init__(self, sql_repo: SQLRepository):
        self.sql_repo = sql_repo
    
    async def write_audit_log(
        self,
        user_id: str,
        event_type: str,
        entity_type: str,
        entity_id: str | None = None,
        workspace_id: str | None = None,
        old_value: Dict[str, Any] | None = None,
        new_value: Dict[str, Any] | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None
    ) -> None:
        """
        Write audit log entry.
        
        Args:
            user_id: Authenticated user ID
            event_type: Event type (e.g., 'workspace_created', 'income_added')
            entity_type: Entity type (e.g., 'workspace', 'income')
            entity_id: Entity ID
            workspace_id: Workspace ID
            old_value: Entity state before change (JSON)
            new_value: Entity state after change (JSON)
            ip_address: User IP address
            user_agent: User agent string
        """
        def _write():
            import pyodbc
            from .credential_provider import get_credential
            from ..core.config import get_settings
            import struct
            
            settings = get_settings()
            credential = get_credential()
            
            # Get connection
            token = credential.get_token("https://database.windows.net/.default")
            token_bytes = token.token.encode("UTF-16-LE")
            token_struct = struct.pack(f'<I{len(token_bytes)}s', len(token_bytes), token_bytes)
            
            connection_string = (
                f"Driver={{ODBC Driver 18 for SQL Server}};"
                f"Server=tcp:{settings.SQL_SERVER_FQDN},1433;"
                f"Database={settings.SQL_DATABASE};"
                f"Encrypt=yes;"
                f"TrustServerCertificate=no;"
            )
            
            conn = pyodbc.connect(
                connection_string,
                attrs_before={1256: token_struct}
            )
            
            cursor = conn.cursor()
            
            query = """
                INSERT INTO AuditLog (
                    UserId, WorkspaceId, EventType, EntityType, EntityId,
                    OldValue, NewValue, IpAddress, UserAgent, EventTimestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, SYSUTCDATETIME())
            """
            
            cursor.execute(query, (
                user_id,
                workspace_id,
                event_type,
                entity_type,
                entity_id,
                