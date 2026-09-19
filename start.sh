#!/bin/bash

sudo docker compose exec web uv run python -m app.create_tasks && sudo docker compose exec web uv run python -m app.create_stations

sudo docker compose exec web uv run python -m app.create_curators > ~/curators.log

awk -F'Username:|, password:' '/Username:/ {print $2 ":" $3}' ~/curators.log

sudo docker compose exec web uv run python -m app.create_station_order


sudo docker compose exec web uv run python -m app.create_player_teams > ~/players.log && awk -F'Username:|, password:' '/Username:/ {print $2 ":" $3}' ~/players.log