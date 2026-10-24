import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered with Base.metadata
from app.api.v1 import api_router
from app.utils.file_storage import ensure_upload_dir


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure upload directory exists
    ensure_upload_dir()
    # Create tables if not existing (ideal for quick start / sqlite fallback)
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Database table initialization warning: {e}")
    yield
    # Shutdown logic if any


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-Ready Placement Management Portal API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs": "/docs"
    }


@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "ok"}
