"""Explicit API serializers for Tortoise models."""

from typing import Any


def relation_id(obj: Any, field: str) -> int | None:
    value = getattr(obj, f"{field}_id", None)
    if value is not None:
        return int(value)
    related = getattr(obj, field, None)
    related_id = getattr(related, "id", None)
    return int(related_id) if related_id is not None else None


def media_url(value: str | None) -> str | None:
    if not value:
        return None
    if value.startswith(("http://", "https://", "/")):
        return value
    return f"/{value.lstrip('/')}"


def serialize_team(team: Any) -> dict[str, Any]:
    return {
        "id": int(team.id),
        "team_name": team.team_name,
        "score": int(team.score or 0),
        "user_id": relation_id(team, "user"),
        "stations_id": relation_id(team, "stations"),
        "current_station": int(team.current_station),
    }


def serialize_station(station: Any) -> dict[str, Any]:
    task = getattr(station, "task", None)
    return {
        "id": int(station.id),
        "time": int(station.time),
        "points": int(station.points),
        "name": station.name,
        "description": station.description,
        "image": media_url(station.image),
        "assignment": station.assignment,
        "task_id": relation_id(station, "task"),
        "task": (
            {
                "id": int(task.id),
                "name": task.name,
                "question": task.question,
            }
            if task is not None
            else None
        ),
    }


ROUTE_FIELDS = (
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


def serialize_station_order(order: Any) -> dict[str, Any]:
    return {
        "id": int(order.id),
        **{f"{field}_id": relation_id(order, field) for field in ROUTE_FIELDS},
    }


def serialize_curator(curator: Any) -> dict[str, Any]:
    return {
        "id": int(curator.id),
        "name": curator.name,
        "station_id": relation_id(curator, "station"),
        "user_id": relation_id(curator, "user"),
    }
