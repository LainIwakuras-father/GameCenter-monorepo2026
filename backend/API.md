# API

All endpoints use the /api prefix. JSON responses follow the schemas in
app/schemas. The access token is sent as
Authorization: Bearer <access-token>. The refresh token is an HttpOnly
cookie named users_refresh_token; it is not returned in JSON.

## Authentication

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | /api/token | Public |
| POST | /api/token/refresh | Refresh cookie |
| POST | /api/token/logout | Public |
| GET | /api/user/me | Access token |

Login request:

    {
      "username": "player",
      "password": "password"
    }

Login response:

    {
      "access": "<jwt>"
    }

## Player teams

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | /api/playerteam/me | Authenticated user |
| GET | /api/playerteam/top | Public |
| GET | /api/playerteam | Curator or superuser |
| GET | /api/playerteam/{id} | Curator or superuser |
| POST | /api/playerteam | Superuser |
| PUT | /api/playerteam/{id} | Superuser |
| DELETE | /api/playerteam/{id} | Superuser |
| POST | /api/playerteam/{id}/score | Curator |

Add score request:

    {
      "score": 8
    }

The score endpoint validates the current station, prevents duplicate route
advancement, and updates the score and route position in one transaction.

## Curators

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | /api/curator/me | Authenticated user |
| GET | /api/curator | Superuser |
| GET | /api/curator/{id} | Superuser |
| POST | /api/curator | Superuser |
| PUT | /api/curator/{id} | Superuser |
| DELETE | /api/curator/{id} | Superuser |

## Stations and routes

Stations use /api/station; station orders use /api/stationorder. Both
collections support GET, GET /{id}, POST, PUT /{id}, and DELETE /{id}.
Reading requires an access token; mutations require a superuser.

Tasks use /api/task and support the same five operations. Task operations
require a superuser.

## Time policy

There is no global time limit for a team's quest. The time field belongs to
an individual station and is used only by the station timer in the frontend.
