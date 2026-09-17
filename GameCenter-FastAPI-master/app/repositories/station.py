from app.models.models import Station
from app.repositories.base import BaseRepository


class StationRepository(BaseRepository[Station]):
    model = Station

    async def get_all(self) -> list[Station]:
        return await Station.all().prefetch_related("task").order_by("id")

    async def get_by_id(self, object_id: int) -> Station | None:
        return (
            await Station.filter(id=object_id).prefetch_related("task").first()
        )
