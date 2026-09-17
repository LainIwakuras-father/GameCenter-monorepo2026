from fastapi import APIRouter, HTTPException, status

from app.models.models import Station, User
from app.schemas.curator import Curator, CuratorCreate, CuratorUpdate
from app.services.curator import CuratorService
from app.utils.dependencies import CurrentAuthUser, Superuser
from app.utils.relations import ensure_foreign_key
from app.utils.serializers import serialize_curator

router = APIRouter(prefix="/api/curator", tags=["curators"])
service = CuratorService()


@router.get("/me", response_model=Curator)
async def get_current_curator(current_user: CurrentAuthUser) -> dict:
    curator = await service.get_by_user_id(current_user.id)
    if curator is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Куратор не найден",
        )
    return serialize_curator(curator)


@router.get("", response_model=list[Curator])
async def get_all_curators(_: Superuser) -> list[dict]:
    return [serialize_curator(curator) for curator in await service.get_all()]


@router.get("/{curator_id}", response_model=Curator)
async def get_curator(curator_id: int, _: Superuser) -> dict:
    curator = await service.get_by_id(curator_id)
    if curator is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return serialize_curator(curator)


@router.post("", response_model=Curator, status_code=status.HTTP_201_CREATED)
async def create_curator(data: CuratorCreate, _: Superuser) -> dict:
    await ensure_foreign_key(
        User,
        data.user_id,
        field_name="user_id",
        nullable=False,
    )
    await ensure_foreign_key(
        Station,
        data.station_id,
        field_name="station_id",
    )
    return serialize_curator(await service.create(data.model_dump()))


@router.put("/{curator_id}", response_model=Curator)
async def update_curator(
    curator_id: int, data: CuratorUpdate, _: Superuser
) -> dict:
    updates = data.model_dump(exclude_unset=True)
    if "user_id" in updates:
        await ensure_foreign_key(
            User,
            updates["user_id"],
            field_name="user_id",
            nullable=False,
        )
    if "station_id" in updates:
        await ensure_foreign_key(
            Station,
            updates["station_id"],
            field_name="station_id",
        )
    curator = await service.update(curator_id, updates)
    if curator is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return serialize_curator(curator)


@router.delete("/{curator_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_curator(curator_id: int, _: Superuser) -> None:
    if not await service.delete(curator_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
