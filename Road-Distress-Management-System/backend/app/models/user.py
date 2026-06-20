"""
User database model for the Road Distress Management System.
"""

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.video import UploadedVideo
    from app.models.maintenance import MaintenanceTask
    from app.models.report import Report


class User(Base):
    """
    User model representing registered system users (inspectors, admins, maintenance team).
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="inspector", nullable=False)
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


    # Relationships
    uploaded_videos: Mapped[List["UploadedVideo"]] = relationship(
        "UploadedVideo",
        back_populates="uploader"
    )
    assigned_tasks: Mapped[List["MaintenanceTask"]] = relationship(
        "MaintenanceTask",
        back_populates="assignee"
    )
    generated_reports: Mapped[List["Report"]] = relationship(
        "Report",
        back_populates="generator"
    )
