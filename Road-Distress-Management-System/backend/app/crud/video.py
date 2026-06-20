"""
CRUD operations for the UploadedVideo entity.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.video import UploadedVideo
from app.schemas.video import UploadedVideoCreate, UploadedVideoUpdate


def get_video(db: Session, video_id: int) -> Optional[UploadedVideo]:
    """
    Retrieve a single uploaded video record by ID.
    """
    return db.query(UploadedVideo).filter(UploadedVideo.id == video_id).first()


def get_videos(db: Session, skip: int = 0, limit: int = 100) -> List[UploadedVideo]:
    """
    Retrieve a list of uploaded video records with pagination.
    """
    return db.query(UploadedVideo).offset(skip).limit(limit).all()


def create_video(db: Session, video_in: UploadedVideoCreate) -> UploadedVideo:
    """
    Create a new uploaded video record.
    """
    db_video = UploadedVideo(
        file_name=video_in.file_name,
        processing_status=video_in.processing_status,
        uploaded_by=video_in.uploaded_by,
    )
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return db_video


def update_video(db: Session, video_id: int, video_in: UploadedVideoUpdate) -> Optional[UploadedVideo]:
    """
    Update the status of an uploaded video record.
    """
    db_video = get_video(db, video_id)
    if not db_video:
        return None

    update_data = video_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_video, field, value)

    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return db_video


def delete_video(db: Session, video_id: int) -> Optional[UploadedVideo]:
    """
    Delete an uploaded video record by ID.
    """
    db_video = get_video(db, video_id)
    if db_video:
        db.delete(db_video)
        db.commit()
    return db_video
