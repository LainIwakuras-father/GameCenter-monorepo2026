from typing import Any

from tortoise import Tortoise

from app.config.config import db_settings


def _connection_config() -> dict[str, Any]:
    if db_settings.engine == "tortoise.backends.sqlite":
        credentials = {"file_path": db_settings.sqlite_path}
    else:
        credentials = {
            "host": db_settings.host,
            "port": db_settings.port,
            "user": db_settings.user,
            "password": db_settings.password,
            "database": db_settings.name,
            "minsize": 1,
            "maxsize": 10,
        }
    return {"engine": db_settings.engine, "credentials": credentials}


DB_CONFIG = {
    "connections": {"default": _connection_config()},
    "apps": {
        "models": {
            "models": ["app.models.models", "aerich.models"],
            "default_connection": "default",
        }
    },
    "use_tz": True,
    "timezone": "UTC",
}


async def init_db() -> None:
    await Tortoise.init(config=DB_CONFIG)
    if db_settings.environment in {"development", "test"}:
        await Tortoise.generate_schemas(safe=True)


async def close_db() -> None:
    await Tortoise.close_connections()
