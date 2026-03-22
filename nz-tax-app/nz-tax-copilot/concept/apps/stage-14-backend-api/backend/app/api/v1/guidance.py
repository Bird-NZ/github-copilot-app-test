"""
IRD guidance query endpoints (placeholder implementation).
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/guidance", tags=["guidance"])


@router.post("/query")
async def query_guidance(
    user_id: str = Depends(get_current_user)
):
    """Query IRD guidance system."""
    return {"message": "Guidance endpoints - implementation pending"}