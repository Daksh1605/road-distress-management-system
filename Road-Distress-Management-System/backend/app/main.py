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


from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from app.db.session import get_db, SessionLocal
import logging

logger = logging.getLogger(__name__)


@app.on_event("startup")
def startup_event() -> None:
    """
    FastAPI startup hook to validate connection to PostgreSQL.
    """
    logger.info("Validating database connection on startup...")
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connection validated successfully.")
    except Exception as e:
        logger.critical(f"Database connection validation failed: {e}")


@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)) -> dict:
    """
    Enhanced health check validating the database connection and verifying tables.
    """
    try:
        # Perform actual database connection validation
        db.execute(text("SELECT 1"))
        
        # Verify table presence
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        
        required_tables = ["users", "road_distresses", "uploaded_videos", "maintenance_tasks", "reports"]
        for table in required_tables:
            if table not in tables:
                raise HTTPException(
                    status_code=500,
                    detail=f"Database table verification failed. Missing table: {table}"
                )
        
        return {
            "status": "healthy",
            "database": "connected",
            "tables": required_tables
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=503,
            detail=f"Database connection is unhealthy: {str(e)}"
        )


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
