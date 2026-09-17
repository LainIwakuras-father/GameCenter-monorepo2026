from pydantic import BaseModel, Field


class UserLogin(BaseModel):
    username: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=4, max_length=128)


class RoleReference(BaseModel):
    curator_id: int | None = None
    team_id: int | None = None
    team_name: str | None = None


class CurrentUser(BaseModel):
    user_id: int
    is_curator: bool
    is_player: bool
    is_superuser: bool
    curator_data: RoleReference | None = None
    player_data: RoleReference | None = None
