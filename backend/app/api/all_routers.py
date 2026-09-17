from fastapi import APIRouter

from app.api.v1 import (
    auth,
    curator,
    player_team,
    station,
    station_order,
    task,
    user,
)

routers = APIRouter()

for router in (
    auth.router,
    user.router,
    task.router,
    curator.router,
    player_team.router,
    station.router,
    station_order.router,
):
    routers.include_router(router)
