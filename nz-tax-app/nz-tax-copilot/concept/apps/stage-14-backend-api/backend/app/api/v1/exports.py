"""
Export generation endpoints (placeholder implementation).
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/workspaces/{workspace_id}/exports", tags=["exports"])


@router.post("/")
async def generate_export(
    workspace_id: str,
    user_id: str = Depends(get_current_user)
):
    """Generate IR3 export."""
    return {"message": "Export endpoints - implementation pending"}