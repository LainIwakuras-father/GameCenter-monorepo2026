import os
from collections.abc import AsyncGenerator
from dataclasses import dataclass

import pytest_asyncio
from asgi_lifespan import LifespanManager
from httpx import ASGITransport, AsyncClient

os.environ.update(
    {
        "ENVIRONMENT": "test",
        "DB_ENGINE": "tortoise.backends.sqlite",
        "DB_SQLITE_PATH": ":memory:",
        "SECRET_KEY": "test-secret-key-test-secret-key-test-secret-key",
        "ADMIN_SECRET_KEY": "test-admin-secret-key-test-admin-secret-key",
    }
)

from app.main import app
from app.models.models import (
    Curator,
    PlayerTeam,
    Station,
    StationOrder,
    User,
)
from app.utils.auth_utils import get_password_hash


@dataclass(frozen=True)
class SeedData:
    player_id: int
    team_id: int
    curator_id: int
    second_curator_id: int
    first_station_id: int
    second_station_id: int


async def _seed_database() -> SeedData:
    admin = await User.create(
        username="admin",
        hash_password=get_password_hash("admin-pass"),
        is_superuser=True,
    )
    player = await User.create(
        username="player",
        hash_password=get_password_hash("player-pass"),
    )
    curator_user = await User.create(
        username="curator",
        hash_password=get_password_hash("curator-pass"),
    )
    second_curator_user = await User.create(
        username="curator-2",
        hash_password=get_password_hash("curator-pass"),
    )
    await admin.refresh_from_db()

    stations = [
        await Station.create(
            name=f"Station {number}",
            time=10,
            points=10,
            image=f"static/image/{number}.png",
        )
        for number in range(1, 11)
    ]
    route = await StationOrder.create(
        first=stations[0],
        second=stations[1],
        third=stations[2],
        fourth=stations[3],
        fifth=stations[4],
        sixth=stations[5],
        seventh=stations[6],
        eighth=stations[7],
        ninth=stations[8],
        tenth=stations[9],
    )
    team = await PlayerTeam.create(
        user=player,
        team_name="Test Team",
        stations=route,
    )
    curator = await Curator.create(
        user=curator_user,
        name="Curator One",
        station=stations[0],
    )
    second_curator = await Curator.create(
        user=second_curator_user,
        name="Curator Two",
        station=stations[1],
    )
    return SeedData(
        player_id=player.id,
        team_id=team.id,
        curator_id=curator.id,
        second_curator_id=second_curator.id,
        first_station_id=stations[0].id,
        second_station_id=stations[1].id,
    )


@pytest_asyncio.fixture
async def api_client() -> AsyncGenerator[tuple[AsyncClient, SeedData]]:
    async with LifespanManager(app):
        seed = await _seed_database()
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport,
            base_url="http://test",
        ) as client:
            yield client, seed


async def access_headers(
    client: AsyncClient, username: str, password: str
) -> dict[str, str]:
    response = await client.post(
        "/api/token",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access']}"}
