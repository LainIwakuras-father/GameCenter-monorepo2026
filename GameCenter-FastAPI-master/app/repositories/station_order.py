from app.models.models import StationOrder
from app.repositories.base import BaseRepository


class StationOrderRepository(BaseRepository[StationOrder]):
    model = StationOrder

    async def get_all(self) -> list[StationOrder]:
        return await StationOrder.all().order_by("id")
