"""Validation helpers for references between API resources.

Tortoise reports a missing foreign-key target as an ``IntegrityError`` at
write time.  Letting that exception escape a request turns a client input
mistake into a 500 response.  The API routers use the helpers below to make
those references explicit and return a stable validation error instead.
"""

from typing import Any

from fastapi import HTTPException, status
from tortoise.models import Model


def _invalid_reference(field_name: str, object_id: Any) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail=(f"Связанный объект {field_name}={object_id!r} не найден"),
    )


async def ensure_foreign_key(
    model: type[Model],
    object_id: int | None,
    *,
    field_name: str,
    nullable: bool = True,
) -> None:
    """Validate one optional/required foreign-key value.

    ``nullable`` describes the database relation, not whether the request
    field is optional.  Required request fields should pass ``nullable=False``
    so an explicit JSON ``null`` receives the same 422 response as a missing
    related row.
    """

    if object_id is None:
        if not nullable:
            raise _invalid_reference(field_name, object_id)
        return

    if not await model.exists(id=object_id):
        raise _invalid_reference(field_name, object_id)


async def ensure_foreign_keys(
    model: type[Model],
    values: dict[str, Any],
    *,
    nullable_fields: set[str] | frozenset[str] = frozenset(),
) -> None:
    """Validate a set of ``*_id`` values against one model."""

    for field_name, object_id in values.items():
        await ensure_foreign_key(
            model,
            object_id,
            field_name=field_name,
            nullable=field_name in nullable_fields,
        )
