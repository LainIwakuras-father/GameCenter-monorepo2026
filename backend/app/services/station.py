from typing import Any

from app.repositories.station import StationRepository


class StationService:
    def __init__(self, repository: StationRepository | None = None) -> None:
        self.repository = repository or StationRepository()

    async def get_all(self) -> list[Any]:
        return await self.repository.get_all()

    async def get_by_id(self, object_id: int) -> Any | None:
        return await self.repository.get_by_id(object_id)

    async def create(self, data: dict[str, Any]) -> Any:
        return await self.repository.create(**data)

    async def update(self, object_id: int, data: dict[str, Any]) -> Any | None:
        return await self.repository.update(object_id, **data)

    async def delete(self, object_id: int) -> bool:
        return await self.repository.delete(object_id)
