"""
Income entry endpoints (placeholder implementation).
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/workspaces/{workspace_id}/income", tags=["income"])


@router.get("/")
async def list_income(
    workspace_id: str,
    user_id: str = Depends(get_current_user)
):
    """List income entries for workspace."""
    return {"message": "Income endpoints - implementation pending"}