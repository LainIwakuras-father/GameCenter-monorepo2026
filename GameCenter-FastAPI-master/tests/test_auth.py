import pytest

from app.utils.auth_utils import verify_password
from tests.conftest import access_headers

pytestmark = pytest.mark.asyncio


async def test_password_verifier_fails_closed_on_unexpected_hash_error(
    monkeypatch,
) -> None:
    def broken_verify(*_args, **_kwargs):
        raise RuntimeError("malformed password hash")

    monkeypatch.setattr(
        "app.utils.auth_utils.pwd_context.verify", broken_verify
    )
    assert verify_password("password", "not-a-hash") is False


async def test_login_returns_access_token_and_refresh_cookie(
    api_client,
) -> None:
    client, _ = api_client
    response = await client.post(
        "/api/token",
        json={"username": "player", "password": "player-pass"},
    )

    assert response.status_code == 200
    assert isinstance(response.json()["access"], str)
    cookie = response.headers["set-cookie"]
    assert "HttpOnly" in cookie
    assert "Path=/api" in cookie


async def test_invalid_or_inactive_user_cannot_log_in(api_client) -> None:
    client, _ = api_client
    response = await client.post(
        "/api/token",
        json={"username": "player", "password": "wrong-pass"},
    )
    assert response.status_code == 401


async def test_refresh_and_logout_cookie_flow(api_client) -> None:
    client, _ = api_client
    await access_headers(client, "player", "player-pass")

    refresh = await client.post("/api/token/refresh")
    assert refresh.status_code == 200
    assert isinstance(refresh.json()["access"], str)

    logout = await client.post("/api/token/logout")
    assert logout.status_code == 204
    assert (await client.post("/api/token/refresh")).status_code == 401


async def test_access_token_cannot_be_used_as_refresh_cookie(
    api_client,
) -> None:
    client, _ = api_client
    headers = await access_headers(client, "player", "player-pass")
    token = headers["Authorization"].removeprefix("Bearer ")
    client.cookies.set("users_refresh_token", token, path="/api")

    response = await client.post("/api/token/refresh")
    assert response.status_code == 401


async def test_me_returns_role_details(api_client) -> None:
    client, seed = api_client
    player_headers = await access_headers(client, "player", "player-pass")
    player = await client.get("/api/user/me", headers=player_headers)
    assert player.status_code == 200
    assert player.json() == {
        "user_id": seed.player_id,
        "is_curator": False,
        "is_player": True,
        "is_superuser": False,
        "curator_data": None,
        "player_data": {
            "curator_id": None,
            "team_id": seed.team_id,
            "team_name": "Test Team",
        },
    }

    curator_headers = await access_headers(client, "curator", "curator-pass")
    curator = await client.get("/api/user/me", headers=curator_headers)
    assert curator.status_code == 200
    assert curator.json()["curator_data"]["curator_id"] == seed.curator_id


async def test_protected_endpoint_rejects_missing_token(api_client) -> None:
    client, _ = api_client
    assert (await client.get("/api/playerteam/me")).status_code == 401


async def test_cors_allows_local_preview(api_client) -> None:
    client, _ = api_client
    response = await client.options(
        "/api/token",
        headers={
            "Origin": "http://127.0.0.1:4173",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == (
        "http://127.0.0.1:4173"
    )

    fallback_port = await client.options(
        "/api/token",
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert fallback_port.status_code == 200
    assert fallback_port.headers["access-control-allow-origin"] == (
        "http://localhost:5174"
    )
