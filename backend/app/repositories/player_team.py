from typing import Final

from fastapi import HTTPException, status
from tortoise.transactions import in_transaction

from app.models.models import Curator, PlayerTeam, Station
from app.repositories.base import BaseRepository

ROUTE_FIELDS: Final[tuple[str, ...]] = (
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
)


class PlayerTeamRepository(BaseRepository[PlayerTeam]):
    model = PlayerTeam

    async def get_all(self) -> list[PlayerTeam]:
        return await PlayerTeam.all().order_by("team_name")

    async def get_by_user_id(self, user_id: int) -> PlayerTeam | None:
        return await PlayerTeam.get_or_none(user_id=user_id)

    async def add_score(
        self, team_id: int, curator: Curator, score_to_add: int
    ) -> tuple[int, int]:
        async with in_transaction() as connection:
            team = (
                await PlayerTeam.filter(id=team_id)
                .select_related("stations")
                .using_db(connection)
                .select_for_update()
                .first()
            )
            if team is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Команда не найдена",
                )

            if team.stations_id is None or team.stations is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Для команды не задан маршрут",
                )

            if curator.station_id is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="За куратором не закреплена станция",
                )

            if team.current_station > len(ROUTE_FIELDS):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Команда уже завершила маршрут",
                )

            route_field = ROUTE_FIELDS[team.current_station - 1]
            station_id = getattr(team.stations, f"{route_field}_id")
            if station_id != curator.station_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Команда ещё не находится на вашей станции",
                )

            station = (
                await Station.filter(id=station_id)
                .using_db(connection)
                .first()
            )
            if station is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Текущая станция не найдена",
                )
            max_score = station.points + 3
            if score_to_add > max_score:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=(
                        f"Баллы превышают максимум для станции ({max_score})"
                    ),
                )

            team.score = (team.score or 0) + score_to_add
            team.current_station += 1
            await team.save(
                using_db=connection,
                update_fields=("score", "current_station", "updated_at"),
            )
            return team.score, team.current_station

    async def get_top_3_by_score(self) -> list[PlayerTeam]:
        return await PlayerTeam.all().order_by("-score", "id").limit(3)
