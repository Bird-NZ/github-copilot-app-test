"""
Crypto transaction endpoints (placeholder implementation).
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/workspaces/{workspace_id}/crypto", tags=["crypto"])


@router.get("/")
async def list_crypto_transactions(
    workspace_id: str,
    user_id: str = Depends(get_current_user)
):
    """List crypto transactions for workspace."""
    return {"message": "Crypto endpoints - implementation pending"}