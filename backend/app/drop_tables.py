import asyncio

from tortoise import Tortoise

from app.config.logging import app_logger as logger
from app.db import close_db, init_db


async def clear_database():
    await init_db()
    connection = Tortoise.get_connection("default")
    try:
        # Отключаем проверку внешних ключей
        await connection.execute_script(
            "SET session_replication_role = 'replica';"
        )
        models_list = [
            "Curator",
            "PlayerTeam",
            "Task",
            "Station",
            "StationOrder",
            "User",
        ]

        models = Tortoise.apps.get("models")
        for model in models_list:
            if model in models:
                await models[model].all().delete()
                logger.info(f"Очищена таблица {models[model]._meta.db_table}")

        # Включаем проверку внешних ключей обратно
        await connection.execute_script(
            "SET session_replication_role = 'origin';"
        )

        logger.info("Данные из таблиц удалены")
    except Exception:
        logger.error("db connection error")
        raise
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(clear_database())
