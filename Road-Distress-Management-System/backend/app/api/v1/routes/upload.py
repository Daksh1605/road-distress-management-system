"""
Media upload and processing routes for the Road Distress Management System.
Placeholder for uploading video streams and image frames for YOLO distress processing.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/video")
def upload_video_file() -> dict:
    """
    Placeholder endpoint to upload road surveillance video files.
    """
    return {"message": "Upload surveillance video stub"}
