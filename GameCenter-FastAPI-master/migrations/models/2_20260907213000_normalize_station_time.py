from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    """Fix the original BIGINT/default drift for station durations."""

    return """
        ALTER TABLE "stations"
            ALTER COLUMN "time" TYPE INT USING "time"::INT;
        ALTER TABLE "stations"
            ALTER COLUMN "time" SET DEFAULT 10;
        UPDATE "stations" SET "time" = 10 WHERE "time" IS NULL;
    """


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "stations"
            ALTER COLUMN "time" TYPE BIGINT;
    """
