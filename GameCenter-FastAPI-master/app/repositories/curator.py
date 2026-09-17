from app.models.models import Curator
from app.repositories.base import BaseRepository


class CuratorRepository(BaseRepository[Curator]):
    model = Curator

    async def get_all(self) -> list[Curator]:
        return await Curator.all().order_by("id")

    async def get_by_user_id(self, user_id: int) -> Curator | None:
        return await Curator.get_or_none(user_id=user_id)
