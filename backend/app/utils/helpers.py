from datetime import timedelta

from app.config.config import auth_settings
from app.utils.auth_utils import create_encoded_jwt

ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def create_access_token(username: str) -> str:
    return create_encoded_jwt(
        {"type": ACCESS_TOKEN_TYPE, "sub": username},
        expire_minutes=auth_settings.access_token_expire_minutes,
    )


def create_refresh_token(username: str) -> str:
    return create_encoded_jwt(
        {"type": REFRESH_TOKEN_TYPE, "sub": username},
        expire_timedelta=timedelta(
            days=auth_settings.refresh_token_expire_days
        ),
    )
