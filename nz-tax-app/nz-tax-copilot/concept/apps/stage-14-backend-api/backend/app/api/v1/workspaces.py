"""
Workspace CRUD endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from datetime import datetime
import uuid
import logging

from app.core.security import get_current_user
from app.clients.cosmos_client import get_workspaces_container

router = APIRouter(prefix="/workspaces", tags=["workspaces"])
logger = logging.getLogger(__name__)


class WorkspaceCreate(BaseModel):
    taxYear: int


class WorkspaceResponse(BaseModel):
    id: str
    userId: str
    taxYear: int
    status: str
    createdAt: str
    metadata: dict


@router.get("/", response_model=List[WorkspaceResponse])
async def list_workspaces(user_id: str = Depends(get_current_user)):
    """List all workspaces for authenticated user."""
    logger.info(f"Listing workspaces for user: {user_id}")
    
    container = get_workspaces_container()
    
    query = """
        SELECT * FROM c 
        WHERE c.userId = @userId 
        AND (NOT IS_DEFINED(c.isDeleted) OR c.isDeleted = false)
        ORDER BY c.createdAt DESC
    """
    
    items = list(container.query_items(
        query=query,
        parameters=[{"name": "@userId", "value": user_id}],
        partition_key=user_id
    ))
    
    return [WorkspaceResponse(**item) for item in items]


@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    user_id: str = Depends(get_current_user)
):
    """Create a new tax year workspace."""
    logger.info(f"Creating workspace for user: {user_id}, tax year: {workspace_data.taxYear}")
    
    # Validate tax year
    current_year = datetime.now().year
    if workspace_data.taxYear > current_year:
        raise HTTPException(
            status_code=422,
            detail="Cannot create workspace for future tax year"
        )
    
    workspace_id = f"ws_{uuid.uuid4().hex[:12]}"
    
    document = {
        "id": workspace_id,
        "userId": user_id,
        "taxYear": workspace_data.taxYear,
        "status": "draft",
        "createdAt": datetime.utcnow().isoformat(),
        "metadata": {
            "completedQuestionnaire": False,
            "hasIncomeEntries": False,
            "hasCryptoTransactions": False,
            "hasDocuments": False
        }
    }
    
    container = get_workspaces_container()
    await container.upsert_item(body=document)
    
    logger.info(f"Workspace created: {workspace_id}")
    return WorkspaceResponse(**document)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get workspace by ID."""
    logger.info(f"Fetching workspace: {workspace_id}")
    
    container = get_workspaces_container()
    
    try:
        item = container.read_item(item=workspace_id, partition_key=user_id)
        return WorkspaceResponse(**item)
    except Exception as e:
        logger.error(f"Workspace not found: {workspace_id}, error: {str(e)}")
        raise HTTPException(
            status_code=404,
            detail=f"Workspace {workspace_id} not found"
        )