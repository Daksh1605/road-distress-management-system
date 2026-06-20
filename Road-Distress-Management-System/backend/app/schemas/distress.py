"""
Pydantic schemas for RoadDistress entity in the Road Distress Management System.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class RoadDistressBase(BaseModel):
    """
    Shared base schema properties for Road Distress.
    """
    distress_type: str = Field(..., max_length=100, description="Type of distress, e.g. pothole, crack")
    severity: str = Field(..., max_length=50, description="Severity level: low, medium, high")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Model prediction confidence score")
    latitude: float = Field(..., description="GPS Latitude coordinate")
    longitude: float = Field(..., description="GPS Longitude coordinate")
    image_url: Optional[str] = Field(None, max_length=512, description="Optional URL to distress image frame")
    status: str = Field("detected", max_length=50, description="Status of the distress record")


class RoadDistressCreate(RoadDistressBase):
    """
    Properties required to create a new road distress log.
    """
    detected_at: Optional[datetime] = Field(None, description="Time the distress was detected")


class RoadDistressUpdate(BaseModel):
    """
    Properties for updating an existing road distress log.
    """
    distress_type: Optional[str] = Field(None, max_length=100)
    severity: Optional[str] = Field(None, max_length=50)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = Field(None, max_length=512)
    status: Optional[str] = Field(None, max_length=50)
    detected_at: Optional[datetime] = None


class RoadDistressResponse(RoadDistressBase):
    """
    API response representation of a Road Distress.
    """
    id: int
    detected_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
