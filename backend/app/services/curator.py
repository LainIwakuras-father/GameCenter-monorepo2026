from typing import Any

from app.repositories.curator import CuratorRepository


class CuratorService:
    def __init__(self, repository: CuratorRepository | None = None) -> None:
        self.repository = repository or CuratorRepository()

    async def get_all(self) -> list[Any]:
        return await self.repository.get_all()

    async def get_by_id(self, object_id: int) -> Any | None:
        return await self.repository.get_by_id(object_id)

    async def get_by_user_id(self, user_id: int) -> Any | None:
        return await self.repository.get_by_user_id(user_id)

    async def create(self, data: dict[str, Any]) -> Any:
        return await self.repository.create(**data)

    async def update(self, object_id: int, data: dict[str, Any]) -> Any | None:
        return await self.repository.update(object_id, **data)

    async def delete(self, object_id: int) -> bool:
        return await self.repository.delete(object_id)
