"""Validation models for ordered station routes."""

from pydantic import Field

from app.schemas.base import BaseSchema

ROUTE_FIELDS = (
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
)


class StationOrderCreate(BaseSchema):
    first_id: int = Field(ge=1)
    second_id: int = Field(ge=1)
    third_id: int = Field(ge=1)
    fourth_id: int = Field(ge=1)
    fifth_id: int = Field(ge=1)
    sixth_id: int = Field(ge=1)
    seventh_id: int = Field(ge=1)
    eighth_id: int = Field(ge=1)
    ninth_id: int = Field(ge=1)
    tenth_id: int = Field(ge=1)


class StationOrderUpdate(BaseSchema):
    first_id: int | None = Field(default=None, ge=1)
    second_id: int | None = Field(default=None, ge=1)
    third_id: int | None = Field(default=None, ge=1)
    fourth_id: int | None = Field(default=None, ge=1)
    fifth_id: int | None = Field(default=None, ge=1)
    sixth_id: int | None = Field(default=None, ge=1)
    seventh_id: int | None = Field(default=None, ge=1)
    eighth_id: int | None = Field(default=None, ge=1)
    ninth_id: int | None = Field(default=None, ge=1)
    tenth_id: int | None = Field(default=None, ge=1)


class StationOrder(BaseSchema):
    id: int
    first_id: int | None = None
    second_id: int | None = None
    third_id: int | None = None
    fourth_id: int | None = None
    fifth_id: int | None = None
    sixth_id: int | None = None
    seventh_id: int | None = None
    eighth_id: int | None = None
    ninth_id: int | None = None
    tenth_id: int | None = None
