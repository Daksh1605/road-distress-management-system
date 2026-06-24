"""
Report database model for the Road Distress Management System.
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Report(Base):
    """
    Report model representing generated system reports and analytics summaries.
    """
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    report_name: Mapped[str] = mapped_column(String(255), nullable=False)
    generated_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), 
        nullable=True
    )
    generated_at: Mapped[datetime] = mapped_column(
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
    report_type: Mapped[str] = mapped_column(String(100), nullable=False)
    filepath: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)


    # Relationships
    generator: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="generated_reports"
    )
