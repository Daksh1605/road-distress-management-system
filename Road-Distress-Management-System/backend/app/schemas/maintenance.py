"""
Pydantic schemas for MaintenanceTask entity in the Road Distress Management System.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MaintenanceTaskBase(BaseModel):
    """
    Shared base schema properties for Maintenance Task.
    """
    distress_id: int = Field(..., description="ID of the associated road distress record")
    recommendation: Optional[str] = Field(None, description="Detailed repair recommendations")
    priority: str = Field(..., max_length=50, description="Priority level: low, medium, high, critical")
    assigned_to: Optional[int] = Field(None, description="ID of the user assigned to this task")
    due_date: Optional[datetime] = Field(None, description="Optional due date for the repairs")
    status: str = Field("scheduled", max_length=50, description="Current task status: scheduled, in_progress, completed, cancelled")
    estimated_response_time: Optional[str] = Field(None, max_length=100, description="Estimated response timeframe")
    maintenance_category: Optional[str] = Field(None, max_length=100, description="Maintenance category type")
    estimated_cost: Optional[int] = Field(None, description="Estimated cost of repairs in INR")


class MaintenanceTaskCreate(MaintenanceTaskBase):
    """
    Properties required to schedule a new maintenance task.
    """
    pass


class MaintenanceTaskUpdate(BaseModel):
    """
    Properties for updating an existing maintenance task.
    """
    distress_id: Optional[int] = None
    recommendation: Optional[str] = None
    priority: Optional[str] = Field(None, max_length=50)
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = Field(None, max_length=50)
    estimated_response_time: Optional[str] = Field(None, max_length=100)
    maintenance_category: Optional[str] = Field(None, max_length=100)
    estimated_cost: Optional[int] = None


class MaintenanceTaskResponse(MaintenanceTaskBase):
    """
    API response representation of a Maintenance Task.
    """
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
