"""
Main entry point for the Road Distress Management System backend.
Initializes FastAPI, configures CORS, and registers versioned API endpoints.
"""

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.routes import (
    auth,
    distress,
    gis,
    reports,
    maintenance,
    upload
)

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    version="1.0.0"
)

# CORS middleware configuration
if settings.BACKEND_CORS_ORIGINS:
    origins = [origin.strip() for origin in settings.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    """
    Health check endpoint to verify that the API server is online and running.
    """
    return {
        "status": "healthy",
        "service": "road-distress-management-backend",
        "version": "1.0.0"
    }


# Centralized router registry for API v1 routes
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(distress.router, prefix="/distress", tags=["Road Distress Monitoring"])
api_router.include_router(gis.router, prefix="/gis", tags=["GIS Map Integration"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reporting & Analytics"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["Maintenance Scheduling"])
api_router.include_router(upload.router, prefix="/upload", tags=["Media Upload & Processing"])

# Bind centralized API version 1 router to application
app.include_router(api_router, prefix=settings.API_V1_STR)
