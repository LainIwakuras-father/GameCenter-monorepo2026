"""Validation models for station curators."""

from pydantic import Field

from app.schemas.base import BaseSchema


class CuratorCreate(BaseSchema):
    name: str | None = Field(default=None, max_length=100)
    station_id: int | None = Field(default=None, ge=1)
    user_id: int = Field(ge=1)


class CuratorUpdate(BaseSchema):
    name: str | None = Field(default=None, max_length=100)
    station_id: int | None = Field(default=None, ge=1)
    user_id: int | None = Field(default=None, ge=1)


class Curator(BaseSchema):
    id: int
    name: str | None = None
    station_id: int | None = None
    user_id: int
