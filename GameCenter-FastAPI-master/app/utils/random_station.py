import random

from app.models.models import PlayerTeam, Station, StationOrder


async def shuffle_stations(ids: list[int]) -> str:
    """Assign a fresh random route to each selected team."""

    all_stations = await Station.all()
    if len(all_stations) < 10:
        raise ValueError(
            "Недостаточно станций для создания маршрута: нужно минимум 10"
        )

    teams = await PlayerTeam.filter(id__in=ids)
    positions = (
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

    for team in teams:
        selected = random.sample(all_stations, 10)
        random.shuffle(selected)
        station_order = await StationOrder.create(
            **{
                position: station
                for position, station in zip(positions, selected)
            }
        )
        team.stations = station_order
        # current_station is a route position, not a station primary key.
        team.current_station = 1
        team.score = 0
        await team.save()

    return f"Случайные станции установлены для {len(teams)} команд"
