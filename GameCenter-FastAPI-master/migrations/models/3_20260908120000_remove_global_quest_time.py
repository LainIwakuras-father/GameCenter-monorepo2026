from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "player_teams"
            DROP COLUMN IF EXISTS "start_time";
    """


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "player_teams"
            ADD COLUMN IF NOT EXISTS "start_time" TIMESTAMPTZ;
    """
