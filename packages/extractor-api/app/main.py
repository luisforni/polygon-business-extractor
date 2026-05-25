import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.router import router
from .core.config import settings
from .db.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("/app/data", exist_ok=True)
    create_tables()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Polygon Business Extractor API",
    version="0.1.0",
    description="Multi-provider business data extraction from geographic polygons.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
