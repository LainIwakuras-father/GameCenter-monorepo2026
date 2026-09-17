from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel

from app.config.config import auth_settings
from app.models.models import User
from app.schemas.user import UserLogin
from app.utils.auth_utils import verify_password
from app.utils.dependencies import get_current_auth_user_for_refresh
from app.utils.helpers import create_access_token, create_refresh_token

router = APIRouter(prefix="/api/token", tags=["auth"])


class TokenInfo(BaseModel):
    access: str


async def validate_auth_user(credentials: UserLogin) -> User:
    user = await User.get_or_none(username=credentials.username)
    if (
        user is None
        or not user.is_active
        or not verify_password(credentials.password, user.hash_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


AuthenticatedUser = Annotated[User, Depends(validate_auth_user)]
RefreshUsername = Annotated[str, Depends(get_current_auth_user_for_refresh)]


@router.post("", response_model=TokenInfo)
async def login_for_access_token(
    response: Response, user: AuthenticatedUser
) -> TokenInfo:
    max_age = auth_settings.refresh_token_expire_days * 24 * 60 * 60
    response.set_cookie(
        key="users_refresh_token",
        value=create_refresh_token(user.username),
        httponly=True,
        secure=auth_settings.cookie_secure,
        max_age=max_age,
        samesite="lax",
        path="/api",
    )
    return TokenInfo(access=create_access_token(user.username))


@router.post("/refresh", response_model=TokenInfo)
async def refresh_token(username: RefreshUsername) -> TokenInfo:
    return TokenInfo(access=create_access_token(username))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> Response:
    response.delete_cookie(
        key="users_refresh_token",
        path="/api",
        secure=auth_settings.cookie_secure,
        httponly=True,
        samesite="lax",
    )
    response.status_code = status.HTTP_204_NO_CONTENT
    return response
