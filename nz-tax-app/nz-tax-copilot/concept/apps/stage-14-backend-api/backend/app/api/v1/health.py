"""
Health check endpoints for liveness and readiness probes
"""
import logging
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from datetime import datetime

from app.clients.cosmos_client import get_cosmos_client
from app.clients.sql_client import get_sql_connection
from app.clients.storage_client import get_blob_service_client

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])


@router.get("/health/live")
async def liveness():
    """
    Kubernetes-style liveness probe
    Returns 200 if container is running (no dependency checks)
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/health/ready")
async def readiness():
    """
    Kubernetes-style readiness probe
    Returns 200 only if all dependencies are healthy
    """
    health_checks = {
        "cosmos_db": False,
        "sql_database": False,
        "blob_storage": False,
    }

    # Check Cosmos DB
    try:
        cosmos_client = get_cosmos_client()
        list(cosmos_client.list_databases())
        health_checks["cosmos_db"] = True
    except Exception as e:
        logger.error(f"Cosmos DB health check failed: {str(e)}")

    # Check SQL Database
    try:
        sql_conn = get_sql_connection()
        cursor = sql_conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        health_checks["sql_database"] = True
    except Exception as e:
        logger.error(f"SQL Database health check failed: {str(e)}")

    # Check Blob Storage
    try:
        blob_client = get_blob_service_client()
        blob_client.get_account_information()
        health_checks["blob_storage"] = True
    except Exception as e:
        logger.error(f"Blob Storage health check failed: {str(e)}")

    all_healthy = all(health_checks.values())
    status_code = status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if all_healthy else "not_ready",
            "checks": health_checks,
            "timestamp": datetime.utcnow().isoformat()
        }
    )