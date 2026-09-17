import asyncio

from app.config.logging import app_logger as logger
from app.db import close_db, init_db
from app.models.models import Curator, PlayerTeam, Station, User
from app.utils.auth_utils import get_password_hash
from app.utils.generate_password import generate_random_password


async def create_users():
    await init_db()
    try:
        stations = await Station.all().order_by("id")
        if not stations:
            logger.warning("No stations found; curators were not created")
            return

        # This script used to run only when the database contained exactly one
        # user (the initial admin).  That made a partially seeded or restored
        # database impossible to complete.  Create only missing deterministic
        # accounts and relations, preserving every existing user/curator.
        created_users = 0
        created_curators = 0
        for index, station in enumerate(stations, 1):
            username = f"куратор{index}"
            user = await User.get_or_none(username=username)

            if user is not None and await Curator.exists(user_id=user.id):
                continue

            # Keep one curator per station when completing a partially seeded
            # database.  Existing assignments are user data and are left
            # untouched.  Check this before creating an account so a skipped
            # station cannot leave behind an orphan seed user.
            if await Curator.exists(station_id=station.id):
                logger.warning(
                    "Station {} already has a curator; relation for {} "
                    "skipped",
                    station.id,
                    username,
                )
                continue

            if user is None:
                password = await generate_random_password()
                user = await User.create(
                    username=username,
                    hash_password=get_password_hash(password),
                )
                created_users += 1
                # Passwords are intentionally emitted only at account creation;
                # rerunning the script never rotates existing credentials.
                logger.info("Username:{}, password:{}", username, password)

            # A user can have only one curator row.  Do not silently turn an
            # existing player account into a dual-role account.
            if await PlayerTeam.exists(user_id=user.id):
                logger.warning(
                    "User {} already belongs to a player team; "
                    "curator relation skipped",
                    username,
                )
                continue

            await Curator.create(
                user=user,
                name=f"Куратор {index}",
                station=station,
            )
            created_curators += 1

        logger.info(
            "Curator seed complete: {} users and {} curator relations created",
            created_users,
            created_curators,
        )
    except Exception:
        logger.exception("Failed to seed curators")
        raise
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(create_users())
