"""
Questionnaire endpoints (placeholder implementation).
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/workspaces/{workspace_id}/questionnaire", tags=["questionnaire"])


@router.get("/")
async def get_questionnaire(
    workspace_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get questionnaire for workspace."""
    return {"message": "Questionnaire endpoints - implementation pending"}