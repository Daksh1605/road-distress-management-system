"""
Frame extraction service utilizing OpenCV to extract individual frames from surveillance video files.
"""

import os
import cv2
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def extract_frames(video_path: str, video_id: int, frame_interval: int = 30) -> List[Dict[str, Any]]:
    """
    OpenCV frame extractor. Reads a video file and saves every Nth frame to disk.
    
    Args:
        video_path (str): Relative or absolute path to the video file.
        video_id (int): Database ID of the video record (used in folder pathing).
        frame_interval (int): Capture interval count (e.g. 30 extracts every 30th frame).

    Returns:
        List[Dict[str, Any]]: List of dicts representing extracted frames:
            - 'frame_path': path relative to backend root directory
            - 'frame_number': index integer of the frame
            - 'timestamp': timestamp offset in seconds from start of video
    """
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    
    # Target frame storage directory
    frames_dir = os.path.join(base_dir, "uploads", "frames", str(video_id))
    os.makedirs(frames_dir, exist_ok=True)

    # Determine absolute path to video file
    full_video_path = os.path.join(base_dir, video_path)
    if not os.path.exists(full_video_path):
        # Fallback if path is already absolute
        full_video_path = video_path

    if not os.path.exists(full_video_path):
        raise FileNotFoundError(f"Video file not found at: {full_video_path}")

    cap = cv2.VideoCapture(full_video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file using OpenCV: {full_video_path}")

    # Determine frames per second (FPS) to compute correct video timestamps
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        logger.warning(f"Invalid video FPS ({fps}) detected. Defaulting calculation to 30.0 FPS.")
        fps = 30.0

    extracted_frames = []
    frame_count = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                frame_filename = f"frame_{frame_count:06d}.jpg"
                frame_filepath = os.path.join(frames_dir, frame_filename)
                
                # Write frame to disk
                cv2.imwrite(frame_filepath, frame)

                # Store relative filepath for backend schema updates
                relative_path = os.path.relpath(frame_filepath, base_dir).replace("\\", "/")
                timestamp = round(frame_count / fps, 3)

                extracted_frames.append({
                    "frame_path": relative_path,
                    "frame_number": frame_count,
                    "timestamp": timestamp
                })

            frame_count += 1
    finally:
        cap.release()

    logger.info(f"Extracted {len(extracted_frames)} frames from video {video_id} (Total read frames: {frame_count}).")
    return extracted_frames
