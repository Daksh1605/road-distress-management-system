"""
GIS integration routes for the Road Distress Management System.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.crud.distress import get_distresses

router = APIRouter()


class MapMarker(BaseModel):
    """
    Schema representing a geo-tagged distress marker on the GIS map.
    """
    id: int
    latitude: float
    longitude: float
    distress_type: str
    severity: str
    status: str


@router.get("/markers", response_model=List[MapMarker])
def get_map_markers(db: Session = Depends(get_db)) -> List[MapMarker]:
    """
    Retrieve geo-tagged distress logs formatted as map markers for GIS visualization.
    """
    # Fetch distress logs from database (up to 500 for maps)
    distresses = get_distresses(db, limit=500)
    return [
        MapMarker(
            id=d.id,
            latitude=d.latitude,
            longitude=d.longitude,
            distress_type=d.distress_type,
            severity=d.severity,
            status=d.status
        )
        for d in distresses
    ]
