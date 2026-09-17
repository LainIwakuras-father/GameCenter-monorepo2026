from fastapi import APIRouter, HTTPException, status

from app.models.models import Task
from app.schemas.station import (
    StationCreate,
    StationUpdate,
    StationWithRelations,
)
from app.services.station import StationService
from app.utils.dependencies import CurrentAuthUser, Superuser
from app.utils.relations import ensure_foreign_key
from app.utils.serializers import serialize_station

router = APIRouter(prefix="/api/station", tags=["stations"])
service = StationService()


@router.get("", response_model=list[StationWithRelations])
async def get_all_stations(_: CurrentAuthUser) -> list[dict]:
    return [serialize_station(item) for item in await service.get_all()]


@router.get("/{station_id}", response_model=StationWithRelations)
async def get_station(station_id: int, _: CurrentAuthUser) -> dict:
    station = await service.get_by_id(station_id)
    if station is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return serialize_station(station)


@router.post(
    "",
    response_model=StationWithRelations,
    status_code=status.HTTP_201_CREATED,
)
async def create_station(data: StationCreate, _: Superuser) -> dict:
    await ensure_foreign_key(
        Task,
        data.task_id,
        field_name="task_id",
    )
    station = await service.create(data.model_dump())
    station = await service.get_by_id(station.id)
    return serialize_station(station)


@router.put("/{station_id}", response_model=StationWithRelations)
async def update_station(
    station_id: int, data: StationUpdate, _: Superuser
) -> dict:
    updates = data.model_dump(exclude_unset=True)
    if "name" in updates and updates["name"] is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Поле name не может быть null",
        )
    if "task_id" in updates:
        await ensure_foreign_key(
            Task,
            updates["task_id"],
            field_name="task_id",
        )
    station = await service.update(station_id, updates)
    if station is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    station = await service.get_by_id(station_id)
    return serialize_station(station)


@router.delete("/{station_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_station(station_id: int, _: Superuser) -> None:
    if not await service.delete(station_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
