import pytest

from app.models.models import Station, StationOrder
from tests.conftest import access_headers

pytestmark = pytest.mark.asyncio


async def test_station_and_route_contracts(api_client) -> None:
    client, _ = api_client
    headers = await access_headers(client, "player", "player-pass")

    stations = await client.get("/api/station", headers=headers)
    routes = await client.get("/api/stationorder", headers=headers)

    assert stations.status_code == 200
    assert len(stations.json()) == 10
    assert stations.json()[0]["time"] == 10
    assert stations.json()[0]["image"] == "/static/image/1.png"
    assert routes.status_code == 200
    assert routes.json()[0]["first_id"] == stations.json()[0]["id"]


async def test_only_superuser_can_mutate_catalog(api_client) -> None:
    client, _ = api_client
    curator_headers = await access_headers(client, "curator", "curator-pass")
    denied = await client.post(
        "/api/station",
        headers=curator_headers,
        json={"name": "Denied"},
    )
    assert denied.status_code == 403

    admin_headers = await access_headers(client, "admin", "admin-pass")
    created = await client.post(
        "/api/station",
        headers=admin_headers,
        json={
            "name": "Created",
            "time": 12,
            "points": 9,
        },
    )
    assert created.status_code == 201
    assert created.json()["name"] == "Created"


async def test_top_endpoint_orders_by_score(api_client) -> None:
    client, seed = api_client
    admin_headers = await access_headers(client, "admin", "admin-pass")
    updated = await client.put(
        f"/api/playerteam/{seed.team_id}",
        headers=admin_headers,
        json={"score": 42},
    )
    assert updated.status_code == 200

    top = await client.get("/api/playerteam/top")
    assert top.status_code == 200
    assert top.json()[0]["score"] == 42


async def test_catalog_mutations_reject_missing_foreign_keys_and_null_name(
    api_client,
) -> None:
    client, seed = api_client
    headers = await access_headers(client, "admin", "admin-pass")

    missing_task = await client.post(
        "/api/station",
        headers=headers,
        json={"name": "Broken task link", "task_id": 99999},
    )
    assert missing_task.status_code == 422
    assert "task_id" in str(missing_task.json()["detail"])

    stations = await Station.all().order_by("id")
    route_payload = {
        field: station.id
        for field, station in zip(
            (
                "first_id",
                "second_id",
                "third_id",
                "fourth_id",
                "fifth_id",
                "sixth_id",
                "seventh_id",
                "eighth_id",
                "ninth_id",
                "tenth_id",
            ),
            stations,
        )
    }
    route_payload["tenth_id"] = 99999
    missing_station = await client.post(
        "/api/stationorder", headers=headers, json=route_payload
    )
    assert missing_station.status_code == 422
    assert "tenth_id" in str(missing_station.json()["detail"])

    station = await Station.get(id=seed.first_station_id)
    original_name = station.name
    null_name = await client.put(
        f"/api/station/{station.id}",
        headers=headers,
        json={"name": None},
    )
    assert null_name.status_code == 422
    await station.refresh_from_db()
    assert station.name == original_name

    # A route update may clear a nullable slot, but a non-existent station id
    # must still be rejected before Tortoise reaches the database constraint.
    order = await StationOrder.all().first()
    assert order is not None
    missing_on_update = await client.put(
        f"/api/stationorder/{order.id}",
        headers=headers,
        json={"first_id": 99999},
    )
    assert missing_on_update.status_code == 422
