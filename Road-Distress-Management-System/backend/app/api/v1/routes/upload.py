"""
Media upload and processing routes for the Road Distress Management System.
Retained for legacy/backward compatibility (used by older tests and integrations).
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.crud.video import (
    get_video,
    get_videos,
    create_video,
    update_video,
    delete_video
)
from app.schemas.video import (
    UploadedVideoCreate,
    UploadedVideoUpdate,
    LegacyUploadedVideoCreate,
    LegacyUploadedVideoResponse
)

router = APIRouter()


@router.get("/videos", response_model=List[LegacyUploadedVideoResponse])
def read_videos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[LegacyUploadedVideoResponse]:
    """
    Retrieve logs for all uploaded surveillance videos.
    """
    return get_videos(db, skip=skip, limit=limit)


@router.get("/video/{id}", response_model=LegacyUploadedVideoResponse)
def read_video_by_id(id: int, db: Session = Depends(get_db)) -> LegacyUploadedVideoResponse:
    """
    Retrieve metadata of a single uploaded video log.
    """
    db_video = get_video(db, video_id=id)
    if not db_video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video upload log with ID {id} not found"
        )
    return db_video


@router.post("/video", response_model=LegacyUploadedVideoResponse, status_code=status.HTTP_201_CREATED)
def upload_video_file(
    video_in: LegacyUploadedVideoCreate,
    db: Session = Depends(get_db)
) -> LegacyUploadedVideoResponse:
    """
    Log the metadata of an uploaded road surveillance video (Legacy API endpoint).
    """
    # Map legacy schema format to current database metadata format
    new_video_in = UploadedVideoCreate(
        filename=video_in.file_name,
        filepath=f"uploads/videos/{video_in.file_name}",
        processing_status=video_in.processing_status,
        uploader_id=video_in.uploaded_by
    )
    return create_video(db, video_in=new_video_in)


@router.put("/video/{id}", response_model=LegacyUploadedVideoResponse)
def update_video_status(
    id: int,
    video_in: UploadedVideoUpdate,
    db: Session = Depends(get_db)
) -> LegacyUploadedVideoResponse:
    """
    Update processing status of an uploaded video.
    """
    db_video = update_video(db, video_id=id, video_in=video_in)
    if not db_video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video upload log with ID {id} not found"
        )
    return db_video


@router.delete("/video/{id}", response_model=LegacyUploadedVideoResponse)
def delete_video_log(id: int, db: Session = Depends(get_db)) -> LegacyUploadedVideoResponse:
    """
    Delete video upload metadata.
    """
    db_video = delete_video(db, video_id=id)
    if not db_video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video upload log with ID {id} not found"
        )
    return db_video
