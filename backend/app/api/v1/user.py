from typing import Annotated

from fastapi import APIRouter, Depends

from app.schemas.user import CurrentUser
from app.utils.dependencies import get_user_role

router = APIRouter(prefix="/api/user", tags=["user"])
CurrentRole = Annotated[dict, Depends(get_user_role)]


@router.get("/me", response_model=CurrentUser)
async def get_me(role: CurrentRole) -> dict:
    return role
