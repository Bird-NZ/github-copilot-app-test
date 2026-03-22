"""
FastAPI dependencies for authentication and service injection
"""
from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials

from app.core.security import security, validate_token
from app.clients.cosmos_client import get_cosmos_client
from app.clients.sql_client import get_sql_connection
from app.clients.storage_client import get_blob_service_client
from app.clients.openai_client import get_openai_client
from app.clients.search_client import get_search_client
from app.services.workspace_service import WorkspaceService
from app.services.income_service import IncomeService
from app.services.crypto_service import CryptoService
from app.services.document_service import DocumentService
from app.services.questionnaire_service import QuestionnaireService
from app.services.guidance_service import GuidanceService
from app.services.calculation_engine import CalculationEngine
from app.services.export_service import ExportService
from app.services.audit_service import AuditService


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> str:
    """
    Dependency to extract and validate user ID from JWT token

    Returns:
        User ID (sub claim from B2C token)
    """
    return validate_token(credentials)


# Service dependencies (singleton pattern for Azure SDK clients)


def get_workspace_service() -> WorkspaceService:
    """Get workspace service instance"""
    cosmos_client = get_cosmos_client()
    sql_conn = get_sql_connection()
    return WorkspaceService(cosmos_client, sql_conn)


def get_income_service() -> IncomeService:
    """Get income service instance"""
    sql_conn = get_sql_connection()
    return IncomeService(sql_conn)


def get_crypto_service() -> CryptoService:
    """Get crypto service instance"""
    sql_conn = get_sql_connection()
    return CryptoService(sql_conn)


def get_document_service() -> DocumentService:
    """Get document service instance"""
    sql_conn = get_sql_connection()
    blob_client = get_blob_service_client()
    return DocumentService(sql_conn, blob_client)


def get_questionnaire_service() -> QuestionnaireService:
    """Get questionnaire service instance"""
    cosmos_client = get_cosmos_client()
    return QuestionnaireService(cosmos_client)


def get_guidance_service() -> GuidanceService:
    """Get guidance service instance"""
    openai_client = get_openai_client()
    search_client = get_search_client()
    cosmos_client = get_cosmos_client()
    return GuidanceService(openai_client, search_client, cosmos_client)


def get_calculation_engine() -> CalculationEngine:
    """Get calculation engine instance"""
    income_service = get_income_service()
    crypto_service = get_crypto_service()
    return CalculationEngine(income_service, crypto_service)


def get_export_service() -> ExportService:
    """Get export service instance"""
    calculation_engine = get_calculation_engine()
    return ExportService(calculation_engine)


def get_audit_service() -> AuditService:
    """Get audit service instance"""
    sql_conn = get_sql_connection()
    return AuditService(sql_conn)