from typing import Any, Generic, TypeVar

from tortoise.models import Model

ModelT = TypeVar("ModelT", bound=Model)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]

    async def get_all(self) -> list[ModelT]:
        return await self.model.all()

    async def get_by_id(self, object_id: int) -> ModelT | None:
        return await self.model.get_or_none(id=object_id)

    async def create(self, **data: Any) -> ModelT:
        return await self.model.create(**data)

    async def update(self, object_id: int, **data: Any) -> ModelT | None:
        instance = await self.get_by_id(object_id)
        if instance is None:
            return None
        if data:
            await self.model.filter(id=object_id).update(**data)
            return await self.get_by_id(object_id)
        return instance

    async def delete(self, object_id: int) -> bool:
        instance = await self.get_by_id(object_id)
        if instance is None:
            return False
        await instance.delete()
        return True
