"""
Document upload/download endpoints (placeholder implementation).
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/workspaces/{workspace_id}/documents", tags=["documents"])


@router.get("/")
async def list_documents(
    workspace_id: str,
    user_id: str = Depends(get_current_user)
):
    """List documents for workspace."""
    return {"message": "Document endpoints - implementation pending"}