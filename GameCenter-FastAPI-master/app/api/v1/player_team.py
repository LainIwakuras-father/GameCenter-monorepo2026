from fastapi import APIRouter, HTTPException, status

from app.models.models import StationOrder, User
from app.schemas.player_team import (
    PlayerTeam,
    PlayerTeamCreate,
    PlayerTeamUpdate,
    ScoreAdd,
    ScoreResponse,
)
from app.services.player_team import PlayerTeamService
from app.utils.dependencies import (
    CurrentAuthUser,
    CurrentCurator,
    StaffUser,
    Superuser,
)
from app.utils.relations import ensure_foreign_key
from app.utils.serializers import serialize_team

router = APIRouter(prefix="/api/playerteam", tags=["player-teams"])
service = PlayerTeamService()


@router.get("/me", response_model=PlayerTeam)
async def get_current_team(current_user: CurrentAuthUser) -> dict:
    team = await service.get_by_user_id(current_user.id)
    if team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Команда пользователя не найдена",
        )
    return serialize_team(team)


@router.get("/top", response_model=list[PlayerTeam])
async def get_top_teams() -> list[dict]:
    return [serialize_team(team) for team in await service.get_top_3()]


@router.get("", response_model=list[PlayerTeam])
async def get_all_teams(_: StaffUser) -> list[dict]:
    return [serialize_team(team) for team in await service.get_all()]


@router.get("/{team_id}", response_model=PlayerTeam)
async def get_team(team_id: int, _: StaffUser) -> dict:
    team = await service.get_by_id(team_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return serialize_team(team)


@router.post(
    "", response_model=PlayerTeam, status_code=status.HTTP_201_CREATED
)
async def create_team(data: PlayerTeamCreate, _: Superuser) -> dict:
    await ensure_foreign_key(
        User,
        data.user_id,
        field_name="user_id",
        nullable=False,
    )
    await ensure_foreign_key(
        StationOrder,
        data.stations_id,
        field_name="stations_id",
    )
    return serialize_team(await service.create(data.model_dump()))


@router.put("/{team_id}", response_model=PlayerTeam)
async def update_team(
    team_id: int, data: PlayerTeamUpdate, _: Superuser
) -> dict:
    updates = data.model_dump(exclude_unset=True)
    if "user_id" in updates:
        await ensure_foreign_key(
            User,
            updates["user_id"],
            field_name="user_id",
            nullable=False,
        )
    if "stations_id" in updates:
        await ensure_foreign_key(
            StationOrder,
            updates["stations_id"],
            field_name="stations_id",
        )
    team = await service.update(team_id, updates)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return serialize_team(team)


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(team_id: int, _: Superuser) -> None:
    if not await service.delete(team_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.post("/{team_id}/score", response_model=ScoreResponse)
async def add_score(
    team_id: int, payload: ScoreAdd, curator: CurrentCurator
) -> ScoreResponse:
    score, current_station = await service.add_score(
        team_id, curator, payload.score
    )
    return ScoreResponse(score=score, current_station=current_station)
