## запуск в  локалке
```bash
cd/GameCenter-FastAPI
uv run app/main.py
проставить в файле ./app/db.py  в "genarate_schemas" значение True
```

## запуск в Docker
1. перейти в папку
```bash
cd /GameCenter-FastAPI
```
2. запустить docker-compose.yml
```bash
docker compose up -d
```

3. создать суперпользователя
```bash
docker-compose exec web uv run app/create_superuser.py # или же
sudo docker compose exec web uv run python -m app.create_superuser
```
Дополнено: после этого шага можно просто запустить один скрипт
```bash
sudo chmod +x start.sh && ./start.sh
```


4. создать 10 заданий
```bash
sudo docker compose exec web uv run python -m app.create_tasks
```
5. создать 10 станций
```bash
docker-compose exec web uv run app/create_stations.py
sudo docker compose exec web uv run python -m app.create_stations
```

6. создать 10 кураторов
```bash
sudo docker compose exec web uv run python -m app.create_curators
```
7. создать пути для капитанов
```bash
docker-compose exec web uv run python -m app.create_station_order.py
sudo docker compose exec web uv run python -m app.create_station_order
```
8. cоздать 26 капитанов
```bash
docker-compose exec web uv run python -m app.create_player_teams.
sudo docker compose exec web uv run python -m app.create_player_teams
```
9.
```bash
docker-compose exec web uv run app/drop_tables.py
```
# В ПРОЦЕССЕ РАЗРАБОТКИ
 - bash-скрипт накатать один чтоб эти команды не прописывать для вноса данных В БД
 - api-tests
 - СI/CD in github action
 - деплой на https://gamecenter.ru

## Документация и Админка

- Документация http://localhost:8000/docs
- Админка http://localhost:8000/admin

## Диаграмма Базы данных
![alt text](docs/DB.jpg)
