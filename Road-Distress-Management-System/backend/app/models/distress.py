"""
RoadDistress database model for the Road Distress Management System.
"""

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.maintenance import MaintenanceTask


class RoadDistress(Base):
    """
    RoadDistress model representing detected road distress instances (potholes, cracks, ruts, etc.).
    """
    __tablename__ = "road_distresses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    distress_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), default="detected", nullable=False)


    # Relationships
    maintenance_tasks: Mapped[List["MaintenanceTask"]] = relationship(
        "MaintenanceTask",
        back_populates="distress",
        cascade="all, delete-orphan"
    )
