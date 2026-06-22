"""
Video upload and management routes for the Road Distress Management System.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, Form, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.video import UploadedVideoResponse
from app.services.video import (
    handle_video_upload,
    retrieve_video_metadata,
    retrieve_videos_list,
    remove_video
)

router = APIRouter()


@router.post("/upload", response_model=UploadedVideoResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: UploadFile = File(...),
    uploader_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
) -> UploadedVideoResponse:
    """
    Accepts video files (.mp4, .avi, .mov), saves them to the server storage,
    and registers upload metadata in PostgreSQL.
    """
    return await handle_video_upload(db=db, file=file, uploader_id=uploader_id)


@router.get("/", response_model=List[UploadedVideoResponse])
def get_videos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[UploadedVideoResponse]:
    """
    Retrieve metadata records of all uploaded videos.
    """
    return retrieve_videos_list(db=db, skip=skip, limit=limit)


@router.get("/{id}", response_model=UploadedVideoResponse)
def get_video_by_id(
    id: int, 
    db: Session = Depends(get_db)
) -> UploadedVideoResponse:
    """
    Retrieve metadata of a single uploaded video log by ID.
    """
    return retrieve_video_metadata(db=db, video_id=id)


@router.delete("/{id}", response_model=UploadedVideoResponse)
def delete_video(
    id: int, 
    db: Session = Depends(get_db)
) -> UploadedVideoResponse:
    """
    Delete a video record from the database and remove its physical file from disk.
    """
    return remove_video(db=db, video_id=id)
