"""
Media upload and processing routes for the Road Distress Management System.
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
    UploadedVideoResponse
)

router = APIRouter()


@router.get("/videos", response_model=List[UploadedVideoResponse])
def read_videos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[UploadedVideoResponse]:
    """
    Retrieve logs for all uploaded surveillance videos.
    """
    return get_videos(db, skip=skip, limit=limit)


@router.get("/video/{id}", response_model=UploadedVideoResponse)
def read_video_by_id(id: int, db: Session = Depends(get_db)) -> UploadedVideoResponse:
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


@router.post("/video", response_model=UploadedVideoResponse, status_code=status.HTTP_201_CREATED)
def upload_video_file(
    video_in: UploadedVideoCreate,
    db: Session = Depends(get_db)
) -> UploadedVideoResponse:
    """
    Log the metadata of an uploaded road surveillance video.
    """
    # In a real app, video file storage would be handled here (S3 / Local storage).
    # We will log the video metadata and initial "pending" status in database.
    return create_video(db, video_in=video_in)


@router.put("/video/{id}", response_model=UploadedVideoResponse)
def update_video_status(
    id: int,
    video_in: UploadedVideoUpdate,
    db: Session = Depends(get_db)
) -> UploadedVideoResponse:
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


@router.delete("/video/{id}", response_model=UploadedVideoResponse)
def delete_video_log(id: int, db: Session = Depends(get_db)) -> UploadedVideoResponse:
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
