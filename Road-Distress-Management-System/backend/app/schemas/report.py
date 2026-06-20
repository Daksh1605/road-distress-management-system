"""
Pydantic schemas for Report entity in the Road Distress Management System.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ReportBase(BaseModel):
    """
    Shared base schema properties for Report logs.
    """
    report_name: str = Field(..., max_length=255, description="Descriptive name of the report")
    report_type: str = Field(..., max_length=100, description="Format or template: PDF, CSV, JSON")
    generated_by: Optional[int] = Field(None, description="ID of the user who generated this report")


class ReportCreate(ReportBase):
    """
    Properties required to log a generated report.
    """
    pass


class ReportResponse(ReportBase):
    """
    API response representation of a Report log.
    """
    id: int
    generated_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
