from typing import ClassVar

from fastadmin import TortoiseModelAdmin, WidgetType, action, register

from app.models.models import (
    Curator,
    PlayerTeam,
    Station,
    StationOrder,
    Task,
    User,
)
from app.utils.auth_utils import get_password_hash, verify_password
from app.utils.random_station import shuffle_stations


@register(Task)
class TaskAdmin(TortoiseModelAdmin):
    list_display = ("id", "name", "question", "answer")
    search_fields = ("name", "question")
    list_filter = ("name",)
    list_display_links = ("id", "name")


@register(User)
class UserAdmin(TortoiseModelAdmin):
    list_display = (
        "id",
        "username",
        "first_name",
        "last_name",
        "is_active",
        "is_superuser",
    )
    list_display_links = ("id", "username")
    search_fields = ("username", "email", "first_name", "last_name")
    formfield_overrides: ClassVar[dict] = {
        "hash_password": (
            WidgetType.PasswordInput,
            {"passwordModalForm": False},
        )
    }
    actions = (*TortoiseModelAdmin.actions, "deactivate", "activate")

    async def authenticate(self, username: str, password: str) -> int | None:
        user = await self.model_cls.filter(
            username=username, is_superuser=True, is_active=True
        ).first()
        if user is None or not verify_password(password, user.hash_password):
            return None
        return user.id

    async def change_password(self, id: int, password: str) -> None:
        user = await self.model_cls.get_or_none(id=id)
        if user is not None:
            user.hash_password = get_password_hash(password)
            await user.save(update_fields=("hash_password",))

    @action(description="Deactivate")
    async def deactivate(self, ids: list[int]) -> None:
        await self.model_cls.filter(id__in=ids).update(is_active=False)

    @action(description="Activate")
    async def activate(self, ids: list[int]) -> None:
        await self.model_cls.filter(id__in=ids).update(is_active=True)


@register(Station)
class StationAdmin(TortoiseModelAdmin):
    list_display = (
        "id",
        "name",
        "points",
        "time",
        "task",
        "image",
        "assignment",
    )
    list_display_links = ("id", "name")
    search_fields = ("name",)
    list_filter = ("points",)


@register(StationOrder)
class StationOrderAdmin(TortoiseModelAdmin):
    list_display = (
        "id",
        "first",
        "second",
        "third",
        "fourth",
        "fifth",
        "sixth",
        "seventh",
        "eighth",
        "ninth",
        "tenth",
    )
    list_filter = (
        "first",
        "second",
        "third",
        "fourth",
        "fifth",
        "sixth",
        "seventh",
        "eighth",
        "ninth",
        "tenth",
    )


@register(PlayerTeam)
class PlayerTeamAdmin(TortoiseModelAdmin):
    list_display = (
        "id",
        "team_name",
        "score",
        "current_station",
        "stations",
    )
    search_fields = ("team_name",)
    list_filter = ("score", "current_station")
    actions = (*TortoiseModelAdmin.actions, "set_random_stations")

    @action(description="Assign random routes")
    async def set_random_stations(self, ids: list[int]) -> None:
        await shuffle_stations(ids)


@register(Curator)
class CuratorAdmin(TortoiseModelAdmin):
    list_display = ("id", "name", "station", "user")
    search_fields = ("name",)
    list_filter = ("station",)
    form_fields = ("user", "name", "station")
