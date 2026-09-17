import os
import warnings
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
STATIC_DIR = ROOT_DIR / "static"
ENV_PATH = ROOT_DIR / ".env"
PLACEHOLDER_SECRET_MARKERS = (
    "change-me",
    "replace-with",
    "development-only",
    "development-local",
)

load_dotenv(ENV_PATH)


def _csv_env(name: str, default: str) -> tuple[str, ...]:
    return tuple(
        value.strip()
        for value in os.getenv(name, default).split(",")
        if value.strip()
    )


def _int_env(name: str, default: int, *, minimum: int = 1) -> int:
    raw_value = os.getenv(name)
    if raw_value is None or not raw_value.strip():
        return default

    try:
        value = int(raw_value)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer") from exc

    if value < minimum:
        raise RuntimeError(f"{name} must be at least {minimum}")
    return value


def _secret_env(
    name: str,
    *,
    environment: str,
    development_fallback: str | None = None,
) -> str:
    secret = os.getenv(name)
    if (
        not secret
        and development_fallback
        and environment
        in {
            "development",
            "test",
        }
    ):
        secret = development_fallback
        warnings.warn(
            f"{name} is not configured; using an insecure "
            "development fallback.",
            RuntimeWarning,
            stacklevel=3,
        )

    if not secret:
        raise RuntimeError(f"{name} must be configured outside development")
    if len(secret) < 32:
        raise RuntimeError(f"{name} must contain at least 32 characters")
    if environment == "production" and any(
        marker in secret.strip().lower()
        for marker in PLACEHOLDER_SECRET_MARKERS
    ):
        raise RuntimeError(
            f"{name} must be replaced with a unique production secret"
        )
    return secret


class DBSettings:
    def __init__(self) -> None:
        self.environment = os.getenv("ENVIRONMENT", "development").lower()
        default_engine = (
            "tortoise.backends.sqlite"
            if self.environment in {"development", "test"}
            else "tortoise.backends.asyncpg"
        )
        self.engine = os.getenv("DB_ENGINE", default_engine)
        self.sqlite_path = os.getenv(
            "DB_SQLITE_PATH", str(ROOT_DIR / "gamecenter-dev.sqlite3")
        )
        self.host = os.getenv("DB_HOST", "localhost")
        self.port = _int_env("DB_PORT", 5432)
        self.name = os.getenv("DB_NAME", "gamecenter")
        self.user = os.getenv("DB_USER", "postgres")
        self.password = os.getenv("DB_PASS", "")
        if self.environment == "production":
            normalized_password = self.password.strip().lower()
            if not normalized_password:
                raise RuntimeError("DB_PASS must be configured in production")
            if any(
                marker in normalized_password
                for marker in PLACEHOLDER_SECRET_MARKERS
            ):
                raise RuntimeError(
                    "DB_PASS must be replaced with a unique "
                    "production password"
                )


class AuthSettings:
    def __init__(self) -> None:
        self.environment = os.getenv("ENVIRONMENT", "development").lower()
        secret = _secret_env(
            "SECRET_KEY",
            environment=self.environment,
            development_fallback=(
                "development-only-secret-change-me-please-keep-this-long"
            ),
        )

        algorithm = os.getenv("ALGORITHM", "HS256").strip() or "HS256"
        if algorithm not in {"HS256", "HS384", "HS512"}:
            raise RuntimeError("ALGORITHM must be HS256, HS384, or HS512")

        self.secret_key = secret
        self.algorithm = algorithm
        self.access_token_expire_minutes = _int_env(
            "ACCESS_TOKEN_EXPIRE_MINUTES", 15
        )
        self.refresh_token_expire_days = _int_env(
            "REFRESH_TOKEN_EXPIRE_DAYS", 1
        )
        self.cookie_secure = self.environment == "production"


class AdminSettings:
    def __init__(self) -> None:
        self.user_model = os.getenv("ADMIN_USER_MODEL", "User")
        self.username_field = os.getenv(
            "ADMIN_USER_MODEL_USERNAME_FIELD", "username"
        )
        environment = os.getenv("ENVIRONMENT", "development").lower()
        secret = _secret_env(
            "ADMIN_SECRET_KEY",
            environment=environment,
            development_fallback=(
                "development-only-admin-secret-change-me-please-keep-this-long"
            ),
        )
        self.secret_key = secret

        # FastAdmin reads these settings at import time.
        os.environ["ADMIN_USER_MODEL"] = self.user_model
        os.environ["ADMIN_USER_MODEL_USERNAME_FIELD"] = self.username_field
        os.environ["ADMIN_SECRET_KEY"] = self.secret_key


db_settings = DBSettings()
auth_settings = AuthSettings()
admin_settings = AdminSettings()

CORS_ORIGINS = _csv_env(
    "CORS_ORIGINS",
    # Vite moves to the next port when the default one is occupied.  Keep the
    # neighbouring local ports available so a second dev server still talks
    # to the API without requiring a hand-edited environment file.
    "http://localhost:3000,http://localhost:4173,http://localhost:5173,"
    "http://localhost:5174,http://localhost:5175,"
    "http://127.0.0.1:3000,http://127.0.0.1:4173,"
    "http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,"
    "https://играцентр.рф,https://xn--80afhj2apdp7a.xn--p1ai",
)
