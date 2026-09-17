import pytest

import app.create_curators as curator_seed
import app.create_player_teams as player_seed
from app.models.models import Curator, PlayerTeam, Station, StationOrder, User

pytestmark = pytest.mark.asyncio


async def _noop() -> None:
    return None


async def _password() -> str:
    return "generated-password"


async def test_account_seeds_are_additive_and_idempotent(
    api_client, monkeypatch
) -> None:
    _client, _seed = api_client

    # The API fixture already owns the in-memory connection.  Exercise the
    # seed body without letting its command-line wrapper reinitialize it.
    for module in (curator_seed, player_seed):
        monkeypatch.setattr(module, "init_db", _noop)
        monkeypatch.setattr(module, "close_db", _noop)
        monkeypatch.setattr(module, "generate_random_password", _password)
        monkeypatch.setattr(module, "get_password_hash", lambda _: "hash")

    # Keep this regression test small while still proving that unrelated users
    # do not prevent captain/team creation.
    monkeypatch.setattr(
        player_seed,
        "teams_list",
        [{"name": "Seed Team One"}, {"name": "Seed Team Two"}],
    )

    stations = await Station.all().order_by("id")
    route_fields = (
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
    await StationOrder.create(**dict(zip(route_fields, stations)))

    await curator_seed.create_users()
    await player_seed.create_player_teams()

    seeded_team = await PlayerTeam.get(team_name="Seed Team One")
    seeded_team.score = 27
    seeded_team.current_station = 4
    await seeded_team.save(update_fields=("score", "current_station"))

    counts_after_first_run = (
        await User.all().count(),
        await Curator.all().count(),
        await PlayerTeam.all().count(),
    )

    await curator_seed.create_users()
    await player_seed.create_player_teams()

    assert (
        await User.all().count(),
        await Curator.all().count(),
        await PlayerTeam.all().count(),
    ) == counts_after_first_run
    await seeded_team.refresh_from_db()
    assert (seeded_team.score, seeded_team.current_station) == (27, 4)

    assert await User.filter(username="капитан1").exists()
    assert await User.filter(username="капитан2").exists()
    assert (
        await PlayerTeam.filter(team_name__startswith="Seed Team").count() == 2
    )
    # Two stations already have manually seeded fixture curators.  The command
    # fills the other eight and never overwrites the existing assignments.
    assert await Curator.all().count() == len(stations)
