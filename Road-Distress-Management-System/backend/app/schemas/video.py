"""
Pydantic schemas for UploadedVideo entity in the Road Distress Management System.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UploadedVideoBase(BaseModel):
    """
    Shared base schema properties for Uploaded Video.
    """
    file_name: str = Field(..., max_length=255, description="Name of the video file")
    processing_status: str = Field("pending", max_length=50, description="Status of video processing: pending, processing, completed, failed")
    uploaded_by: Optional[int] = Field(None, description="ID of the user who uploaded the video")


class UploadedVideoCreate(UploadedVideoBase):
    """
    Properties required to register an uploaded video.
    """
    pass


class UploadedVideoUpdate(BaseModel):
    """
    Properties for updating processing status or details of a video.
    """
    processing_status: Optional[str] = Field(None, max_length=50)


class UploadedVideoResponse(UploadedVideoBase):
    """
    API response representation of an Uploaded Video.
    """
    id: int
    upload_time: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
