"""
GIS integration routes for the Road Distress Management System.
Placeholder for retrieving geo-tagged distress coordinate clusters.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/markers")
def get_map_markers() -> dict:
    """
    Placeholder endpoint to retrieve geographic markers for the map view.
    """
    return {"message": "Get GIS map markers stub"}
