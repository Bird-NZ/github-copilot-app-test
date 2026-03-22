"""
IR3 calculation endpoints (placeholder implementation).
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/workspaces/{workspace_id}/calculations", tags=["calculations"])


@router.post("/")
async def calculate_ir3(
    workspace_id: str,
    user_id: str = Depends(get_current_user)
):
    """Calculate draft IR3 return."""
    return {"message": "Calculation endpoints - implementation pending"}