from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import HTTPException, status
from jwt import PyJWTError, decode, encode
from passlib.context import CryptContext

from app.config.config import auth_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_encoded_jwt(
    payload: dict[str, Any],
    *,
    expire_minutes: int | None = None,
    expire_timedelta: timedelta | None = None,
) -> str:
    now = datetime.now(UTC)
    if expire_timedelta is not None:
        expires_at = now + expire_timedelta
    else:
        expires_at = now + timedelta(
            minutes=(
                expire_minutes
                if expire_minutes is not None
                else auth_settings.access_token_expire_minutes
            )
        )
    encoded_payload = {**payload, "exp": expires_at, "iat": now}
    return encode(
        encoded_payload,
        auth_settings.secret_key,
        algorithm=auth_settings.algorithm,
    )


def decoded_jwt(token: str | bytes) -> dict[str, Any]:
    try:
        return decode(
            token,
            auth_settings.secret_key,
            algorithms=[auth_settings.algorithm],
        )
    except PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен недействителен или истёк",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_password_hash(password: str | bytes) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str | bytes, hashed_password: str | bytes
) -> bool:
    """Return whether ``plain_password`` matches a stored hash.

    Password hashes are persisted data and can become malformed after a
    migration, a manual edit, or a partial restore.  Passlib deliberately
    raises for some malformed values instead of returning ``False``.  This
    function is used directly by the login and admin authentication paths, so
    those errors must never turn into a 500 response (or leak hash details to
    a caller).  Authentication therefore fails closed for *any* verifier
    error.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:  # noqa: BLE001 - authentication must fail closed
        return False
