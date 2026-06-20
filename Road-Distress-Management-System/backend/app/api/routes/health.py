"""
Health check route for the Road Distress Management System.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", response_model=dict)
def health_check() -> dict:
    """
    Simple health check endpoint returning status ok.
    """
    return {"status": "ok"}
