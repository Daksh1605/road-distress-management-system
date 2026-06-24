"""
MaintenanceTask database model for the Road Distress Management System.
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.distress import RoadDistress
    from app.models.user import User


class MaintenanceTask(Base):
    """
    MaintenanceTask model representing scheduled/assigned repairs for detected road distresses.
    """
    __tablename__ = "maintenance_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    distress_id: Mapped[int] = mapped_column(
        ForeignKey("road_distresses.id", ondelete="CASCADE"), 
        nullable=False
    )
    recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(50), nullable=False)
    assigned_to: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), 
        nullable=True
    )
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
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
    status: Mapped[str] = mapped_column(String(50), default="scheduled", nullable=False)

    # Recommendation Engine fields
    estimated_response_time: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    maintenance_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    estimated_cost: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


    # Relationships
    distress: Mapped["RoadDistress"] = relationship(
        "RoadDistress",
        back_populates="maintenance_tasks"
    )
    assignee: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="assigned_tasks"
    )
