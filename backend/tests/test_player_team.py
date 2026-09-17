import pytest

from app.models.models import Curator, PlayerTeam, StationOrder, User
from tests.conftest import access_headers

pytestmark = pytest.mark.asyncio


async def test_team_contract_has_no_global_time_fields(api_client) -> None:
    client, seed = api_client
    headers = await access_headers(client, "player", "player-pass")

    response = await client.get("/api/playerteam/me", headers=headers)

    assert response.status_code == 200
    assert response.json() == {
        "id": seed.team_id,
        "team_name": "Test Team",
        "score": 0,
        "user_id": seed.player_id,
        "stations_id": response.json()["stations_id"],
        "current_station": 1,
    }
    assert {
        "start_time",
        "expires_at",
        "quest_active",
    }.isdisjoint(response.json())


async def test_player_cannot_read_all_teams(api_client) -> None:
    client, _ = api_client
    headers = await access_headers(client, "player", "player-pass")
    response = await client.get("/api/playerteam", headers=headers)
    assert response.status_code == 403


async def test_curator_can_read_teams_and_own_profile(api_client) -> None:
    client, seed = api_client
    headers = await access_headers(client, "curator", "curator-pass")

    teams = await client.get("/api/playerteam", headers=headers)
    curator = await client.get("/api/curator/me", headers=headers)

    assert teams.status_code == 200
    assert [team["team_name"] for team in teams.json()] == ["Test Team"]
    assert curator.status_code == 200
    assert curator.json()["station_id"] == seed.first_station_id


async def test_score_is_added_and_route_advances_atomically(
    api_client,
) -> None:
    client, seed = api_client
    first_headers = await access_headers(client, "curator", "curator-pass")

    first = await client.post(
        f"/api/playerteam/{seed.team_id}/score",
        headers=first_headers,
        json={"score": 8},
    )
    assert first.status_code == 200
    assert first.json() == {"score": 8, "current_station": 2}

    duplicate = await client.post(
        f"/api/playerteam/{seed.team_id}/score",
        headers=first_headers,
        json={"score": 8},
    )
    assert duplicate.status_code == 409

    second_headers = await access_headers(client, "curator-2", "curator-pass")
    second = await client.post(
        f"/api/playerteam/{seed.team_id}/score",
        headers=second_headers,
        json={"score": 10},
    )
    assert second.status_code == 200
    assert second.json() == {"score": 18, "current_station": 3}


async def test_invalid_score_does_not_change_team(api_client) -> None:
    client, seed = api_client
    headers = await access_headers(client, "curator", "curator-pass")

    negative = await client.post(
        f"/api/playerteam/{seed.team_id}/score",
        headers=headers,
        json={"score": -1},
    )
    excessive = await client.post(
        f"/api/playerteam/{seed.team_id}/score",
        headers=headers,
        json={"score": 14},
    )
    team = await PlayerTeam.get(id=seed.team_id)

    assert negative.status_code == 422
    assert excessive.status_code == 422
    assert (team.score, team.current_station) == (0, 1)


async def test_completed_route_rejects_more_score(api_client) -> None:
    client, seed = api_client
    headers = await access_headers(client, "curator", "curator-pass")
    await PlayerTeam.filter(id=seed.team_id).update(current_station=11)

    response = await client.post(
        f"/api/playerteam/{seed.team_id}/score",
        headers=headers,
        json={"score": 1},
    )
    assert response.status_code == 409


async def test_team_and_curator_mutations_reject_missing_foreign_keys(
    api_client,
) -> None:
    client, seed = api_client
    headers = await access_headers(client, "admin", "admin-pass")

    missing_user = await client.post(
        "/api/playerteam",
        headers=headers,
        json={"team_name": "Missing user", "user_id": 99999},
    )
    assert missing_user.status_code == 422
    assert "user_id" in str(missing_user.json()["detail"])

    route = await StationOrder.all().first()
    assert route is not None
    available_user = await User.create(
        username="new-player",
        hash_password="not-used-in-this-test",
    )
    missing_route = await client.post(
        "/api/playerteam",
        headers=headers,
        json={
            "team_name": "Missing route",
            "user_id": available_user.id,
            "stations_id": 99999,
        },
    )
    assert missing_route.status_code == 422
    assert "stations_id" in str(missing_route.json()["detail"])

    null_user = await client.put(
        f"/api/playerteam/{seed.team_id}",
        headers=headers,
        json={"user_id": None},
    )
    assert null_user.status_code == 422

    curator_user = await User.create(
        username="new-curator",
        hash_password="not-used-in-this-test",
    )
    missing_station = await client.post(
        "/api/curator",
        headers=headers,
        json={
            "name": "Missing station",
            "user_id": curator_user.id,
            "station_id": 99999,
        },
    )
    assert missing_station.status_code == 422
    assert "station_id" in str(missing_station.json()["detail"])

    curator = await Curator.get(id=seed.curator_id)
    curator_update = await client.put(
        f"/api/curator/{curator.id}",
        headers=headers,
        json={"station_id": 99999},
    )
    assert curator_update.status_code == 422
