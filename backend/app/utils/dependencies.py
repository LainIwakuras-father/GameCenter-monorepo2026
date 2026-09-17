from typing import Annotated, Any

from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models.models import Curator, PlayerTeam, User
from app.utils.auth_utils import decoded_jwt


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


class AccessTokenBearer(HTTPBearer):
    def __init__(self) -> None:
        super().__init__(auto_error=False)

    async def __call__(self, request: Request) -> dict[str, Any]:
        credentials: (
            HTTPAuthorizationCredentials | None
        ) = await super().__call__(request)
        if credentials is None:
            raise _unauthorized("Токен не найден")

        token_data = decoded_jwt(credentials.credentials)
        if token_data.get("type") != "access":
            raise _unauthorized("Требуется access-токен")
        return token_data


access_token_bearer = AccessTokenBearer()
AccessToken = Annotated[dict[str, Any], Depends(access_token_bearer)]


async def get_current_auth_user_for_refresh(
    refresh_token: Annotated[
        str | None, Cookie(alias="users_refresh_token")
    ] = None,
) -> str:
    if not refresh_token:
        raise _unauthorized("Refresh-токен не найден")

    token_data = decoded_jwt(refresh_token)
    if token_data.get("type") != "refresh":
        raise _unauthorized("Требуется refresh-токен")

    username = token_data.get("sub")
    if not isinstance(username, str) or not username:
        raise _unauthorized("Некорректный refresh-токен")

    user = await User.get_or_none(username=username, is_active=True)
    if user is None:
        raise _unauthorized("Пользователь не найден или отключён")
    return username


async def get_current_user(token_data: AccessToken) -> User:
    username = token_data.get("sub")
    if not isinstance(username, str) or not username:
        raise _unauthorized("В токене отсутствует пользователь")

    user = await User.get_or_none(username=username, is_active=True)
    if user is None:
        raise _unauthorized("Пользователь не найден или отключён")
    return user


CurrentAuthUser = Annotated[User, Depends(get_current_user)]


async def require_curator(current_user: CurrentAuthUser) -> Curator:
    curator = await Curator.get_or_none(user_id=current_user.id)
    if curator is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Требуется роль куратора",
        )
    return curator


CurrentCurator = Annotated[Curator, Depends(require_curator)]


async def require_staff(current_user: CurrentAuthUser) -> User:
    if current_user.is_superuser:
        return current_user
    if await Curator.exists(user_id=current_user.id):
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Требуется роль куратора",
    )


StaffUser = Annotated[User, Depends(require_staff)]


async def require_superuser(current_user: CurrentAuthUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав",
        )
    return current_user


Superuser = Annotated[User, Depends(require_superuser)]


async def get_user_role(current_user: CurrentAuthUser) -> dict[str, Any]:
    curator = await Curator.get_or_none(user_id=current_user.id)
    player_team = await PlayerTeam.get_or_none(user_id=current_user.id)
    return {
        "user_id": current_user.id,
        "is_curator": curator is not None,
        "is_player": player_team is not None,
        "is_superuser": current_user.is_superuser,
        "curator_data": (
            {"curator_id": curator.id} if curator is not None else None
        ),
        "player_data": (
            {
                "team_id": player_team.id,
                "team_name": player_team.team_name,
            }
            if player_team is not None
            else None
        ),
    }
