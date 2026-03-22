"""
Health check endpoints for Container Apps probes.
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

from app.clients.cosmos_client import get_cosmos_client
from app.clients.sql_client import get_sql_connection
from app.clients.storage_client import get_blob_service_client

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health/live")
async def liveness():
    """
    Liveness probe endpoint.
    Returns 200 if container is running (no dependency checks).
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/health/ready")
async def readiness():
    """
    Readiness probe endpoint.
    Returns 200 only if all dependencies are healthy.
    Includes error details for diagnosis.
    """
    health_checks = {
        "cosmos_db": await check_cosmos_health(),
        "sql_database": await check_sql_health(),
        "blob_storage": await check_storage_health()
    }
    
    all_healthy = all(check["healthy"] for check in health_checks.values())
    status_code = 200 if all_healthy else 503
    
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if all_healthy else "not_ready",
            "checks": health_checks,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


async def check_cosmos_health() -> dict:
    """Check Cosmos DB connectivity."""
    try:
        client = get_cosmos_client()
        # List databases to verify connectivity
        list(client.list_databases())
        return {"healthy": True}
    except Exception as e:
        logger.error(f"Cosmos DB health check failed: {str(e)}")
        return {"healthy": False, "error": str(e)}


async def check_sql_health() -> dict:
    """Check Azure SQL Database connectivity."""
    try:
        conn = get_sql_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        return {"healthy": True}
    except Exception as e:
        logger.error(f"SQL Database health check failed: {str(e)}")
        return {"healthy": False, "error": str(e)}


async def check_storage_health() -> dict:
    """Check Blob Storage connectivity."""
    try:
        client = get_blob_service_client()
        # List containers to verify connectivity
        list(client.list_containers(max_results=1))
        return {"healthy": True}
    except Exception as e:
        logger.error(f"Blob Storage health check failed: {str(e)}")
        return {"healthy": False, "error": str(e)}