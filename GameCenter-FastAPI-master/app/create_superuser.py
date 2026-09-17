import asyncio
import getpass
import os

from app.config.logging import app_logger as logger
from app.db import close_db, init_db
from app.models.models import User
from app.utils.auth_utils import get_password_hash


def _admin_password() -> str:
    password = os.getenv("ADMIN_PASSWORD")
    if password is None:
        password = getpass.getpass("Admin password: ")
    if len(password) < 12:
        raise RuntimeError(
            "ADMIN_PASSWORD must contain at least 12 characters"
        )
    return password


async def create_superuser() -> None:
    await init_db()
    try:
        username = os.getenv("ADMIN_USERNAME", "admin").strip()
        if not username:
            raise RuntimeError("ADMIN_USERNAME must not be empty")

        user = await User.get_or_none(username=username)
        if not user:
            password = _admin_password()
            await User.create(
                username=username,
                hash_password=get_password_hash(password),
                is_superuser=True,
            )
            logger.info("Superuser {} created", username)
        elif not user.is_superuser:
            user.is_superuser = True
            await user.save(update_fields=("is_superuser",))
            logger.info("Existing user {} promoted to superuser", username)
        else:
            logger.info("Superuser {} already exists", username)

    except Exception:
        logger.exception("Failed to create superuser")
        raise
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(create_superuser())
