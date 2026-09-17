from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn

# Keep this import block ordered for runtime: FastAdmin reads these values
# while it is imported, so configuration must be loaded first.
# isort: off
# Configuration must be loaded before FastAdmin reads its environment.
from app.config.config import CORS_ORIGINS, STATIC_DIR
from fastadmin import fastapi_app as admin_app

# isort: on
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from tortoise import Tortoise

from app import admin  # noqa: F401
from app.api.all_routers import routers
from app.config.logging import app_logger
from app.db import close_db, init_db


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()
    try:
        yield
    finally:
        await close_db()
        app_logger.info("Database connections closed")


app = FastAPI(
    title="ИграЦентр API",
    description="API платформы квеста «ИграЦентр».",
    version="2.0.0",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(CORS_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    """Return a healthy response only when the database is reachable."""
    try:
        await Tortoise.get_connection("default").execute_query("SELECT 1")
    except Exception as exc:
        raise HTTPException(
            status_code=503, detail="database unavailable"
        ) from exc
    return {"status": "ok"}


app.include_router(routers)
app.mount("/admin", admin_app)

Path(STATIC_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
