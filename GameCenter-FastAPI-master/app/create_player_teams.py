import asyncio

from app.config.logging import app_logger as logger
from app.db import close_db, init_db
from app.models.models import PlayerTeam, StationOrder, User
from app.utils.auth_utils import get_password_hash
from app.utils.generate_password import generate_random_password

teams_list = [
    {"name": "Веселые фермеры"},
    {"name": "Kikoriki"},
    {"name": "Винкс"},
    {"name": "Ам Нямы"},
    {"name": "Барни"},
    {"name": "Фанаты Райана Гослинга"},
    {"name": "Телепузики"},
    {"name": "Тигры в пиаре"},
    {"name": "Смурфики"},
    {"name": "Чёрный Альянс"},
    {"name": "Миньоны"},
    {"name": "Бабл-Тигры"},
    {"name": "Чёткие бобры"},
    {"name": "Dark web"},
    {"name": "ПингWindowsы"},
    {"name": "Бончоны"},
    {"name": "Неизвестные"},
    {"name": "ФавориТьфу"},
    {"name": "Это сложно"},
    {"name": "Команда"},
    {"name": "Бесы"},
    {"name": "ЛСШ ТИМ"},
    {"name": "Скебобчики"},
    {"name": "Dedы_007"},
    {"name": "Я ГОВОРЮ МАКАН ВЫ ГОВОРИТЕ…"},
    {"name": "догидог"},
]


async def create_player_teams():
    await init_db()
    try:
        # Pair teams with routes in stable database order instead of assuming
        # that primary keys start at one and remain contiguous after restores.
        station_orders = await StationOrder.all().order_by("id")
        if len(station_orders) < len(teams_list):
            raise RuntimeError(
                "Not enough station orders to seed player teams: "
                f"found {len(station_orders)}, need {len(teams_list)}"
            )

        created_users = 0
        created_teams = 0
        for index, team_data in enumerate(teams_list):
            team_number = index + 1
            username = f"капитан{team_number}"
            team_name = team_data["name"]
            user = await User.get_or_none(username=username)

            # Preserve an existing team and all of its progress.  This makes
            # the seed safe to run after an event has already started.
            if user is not None and await PlayerTeam.exists(user_id=user.id):
                continue

            # Avoid duplicating a canonical team manually created under
            # another user account.  Check before account creation so a
            # skipped team cannot leave behind an orphan seed user.
            if await PlayerTeam.exists(team_name=team_name):
                logger.warning(
                    "Team {!r} already exists; relation for {} skipped",
                    team_name,
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
                # Never rotate credentials when the seed script is rerun.
                logger.info("Username:{}, password:{}", username, password)

            await PlayerTeam.create(
                user=user,
                team_name=team_name,
                stations=station_orders[index],
            )
            created_teams += 1

        logger.info(
            "Player-team seed complete: {} users and {} teams created",
            created_users,
            created_teams,
        )
    except Exception:
        logger.exception("Failed to seed player teams")
        raise
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(create_player_teams())
