"""
Schemas package exposing all Pydantic schemas.
"""

from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse
from app.schemas.distress import (
    RoadDistressBase,
    RoadDistressCreate,
    RoadDistressUpdate,
    RoadDistressResponse
)
from app.schemas.video import (
    UploadedVideoBase,
    UploadedVideoCreate,
    UploadedVideoUpdate,
    UploadedVideoResponse
)
from app.schemas.maintenance import (
    MaintenanceTaskBase,
    MaintenanceTaskCreate,
    MaintenanceTaskUpdate,
    MaintenanceTaskResponse
)
from app.schemas.report import ReportBase, ReportCreate, ReportResponse

__all__ = [
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "RoadDistressBase",
    "RoadDistressCreate",
    "RoadDistressUpdate",
    "RoadDistressResponse",
    "UploadedVideoBase",
    "UploadedVideoCreate",
    "UploadedVideoUpdate",
    "UploadedVideoResponse",
    "MaintenanceTaskBase",
    "MaintenanceTaskCreate",
    "MaintenanceTaskUpdate",
    "MaintenanceTaskResponse",
    "ReportBase",
    "ReportCreate",
    "ReportResponse",
]
