from typing import Any

from app.models.models import Curator
from app.repositories.player_team import PlayerTeamRepository


class PlayerTeamService:
    def __init__(self, repository: PlayerTeamRepository | None = None) -> None:
        self.repository = repository or PlayerTeamRepository()

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

    async def add_score(
        self, team_id: int, curator: Curator, score: int
    ) -> tuple[int, int]:
        return await self.repository.add_score(team_id, curator, score)

    async def get_top_3(self) -> list[Any]:
        return await self.repository.get_top_3_by_score()
