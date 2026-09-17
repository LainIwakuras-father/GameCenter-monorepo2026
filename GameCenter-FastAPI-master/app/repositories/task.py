from app.models.models import Task
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    model = Task

    async def get_all(self) -> list[Task]:
        return await Task.all().order_by("id")
