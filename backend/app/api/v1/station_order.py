from fastapi import APIRouter, HTTPException, status

from app.models.models import Station
from app.schemas.station_order import (
    StationOrder,
    StationOrderCreate,
    StationOrderUpdate,
)
from app.services.station_order import StationOrderService
from app.utils.dependencies import CurrentAuthUser, Superuser
from app.utils.relations import ensure_foreign_keys
from app.utils.serializers import serialize_station_order

router = APIRouter(prefix="/api/stationorder", tags=["station-orders"])
service = StationOrderService()


@router.get("", response_model=list[StationOrder])
async def get_all_station_orders(_: CurrentAuthUser) -> list[dict]:
    return [serialize_station_order(item) for item in await service.get_all()]


@router.get("/{order_id}", response_model=StationOrder)
async def get_station_order(order_id: int, _: CurrentAuthUser) -> dict:
    order = await service.get_by_id(order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return serialize_station_order(order)


@router.post(
    "", response_model=StationOrder, status_code=status.HTTP_201_CREATED
)
async def create_station_order(data: StationOrderCreate, _: Superuser) -> dict:
    values = data.model_dump()
    await ensure_foreign_keys(Station, values, nullable_fields=frozenset())
    order = await service.create(values)
    return serialize_station_order(order)


@router.put("/{order_id}", response_model=StationOrder)
async def update_station_order(
    order_id: int, data: StationOrderUpdate, _: Superuser
) -> dict:
    updates = data.model_dump(exclude_unset=True)
    await ensure_foreign_keys(
        Station,
        updates,
        # StationOrder columns are nullable, so an explicit null clears a
        # route slot while a non-existent id remains a validation error.
        nullable_fields=frozenset(updates),
    )
    order = await service.update(order_id, updates)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return serialize_station_order(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_station_order(order_id: int, _: Superuser) -> None:
    if not await service.delete(order_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
