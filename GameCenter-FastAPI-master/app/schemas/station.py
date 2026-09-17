"""Validation models for stations and their tasks."""

from pydantic import Field

from app.schemas.base import BaseSchema


class StationBase(BaseSchema):
    time: int = Field(default=10, ge=0)
    points: int = Field(default=10, ge=0)
    name: str
    description: str | None = None
    image: str | None = None
    assignment: str | None = None
    task_id: int | None = None


class StationCreate(StationBase):
    pass


class StationUpdate(BaseSchema):
    time: int | None = Field(default=None, ge=0)
    points: int | None = Field(default=None, ge=0)
    name: str | None = None
    description: str | None = None
    image: str | None = None
    assignment: str | None = None
    task_id: int | None = None


class TaskNested(BaseSchema):
    id: int
    name: str | None = None
    question: str | None = None


class Station(StationBase):
    id: int


class StationWithRelations(Station):
    task: TaskNested | None = None
