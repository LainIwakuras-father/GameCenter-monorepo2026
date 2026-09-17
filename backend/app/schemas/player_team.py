"""Validation models for participant teams."""

from pydantic import Field

from app.schemas.base import BaseSchema


class ScoreAdd(BaseSchema):
    score: int = Field(ge=0)


class ScoreResponse(BaseSchema):
    score: int
    current_station: int


class PlayerTeamCreate(BaseSchema):
    team_name: str = Field(min_length=1, max_length=100)
    user_id: int = Field(ge=1)
    stations_id: int | None = Field(default=None, ge=1)
    score: int = Field(default=0, ge=0)
    current_station: int = Field(default=1, ge=1, le=11)


class PlayerTeamUpdate(BaseSchema):
    team_name: str | None = Field(default=None, min_length=1, max_length=100)
    user_id: int | None = Field(default=None, ge=1)
    stations_id: int | None = Field(default=None, ge=1)
    score: int | None = Field(default=None, ge=0)
    current_station: int | None = Field(default=None, ge=1, le=11)


class PlayerTeam(BaseSchema):
    id: int
    team_name: str
    score: int
    user_id: int
    stations_id: int | None = None
    current_station: int
