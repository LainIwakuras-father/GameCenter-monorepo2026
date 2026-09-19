from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    """
    Make player_teams.stations_id NOT NULL.

    Field is semantically required: every team must have a route.
    Before applying, ensure no NULL values exist in the table.
    """
    return """
        ALTER TABLE "player_teams"
        ALTER COLUMN "stations_id" SET NOT NULL;
    """


async def downgrade(db: BaseDBAsyncClient) -> str:
    """Revert to nullable in case of rollback."""
    return """
        ALTER TABLE "player_teams"
        ALTER COLUMN "stations_id" DROP NOT NULL;
    """