"""
ai/scripts/extract_frames.py

Extracts frames from dashcam videos stored on Google Drive.
Run this in Google Colab — see ai/notebooks/01_extract_frames.ipynb

Input:  DRIVE_BASE/raw_videos/*.mp4
Output: DRIVE_BASE/frames/*.jpg
"""

import cv2
import os
from pathlib import Path


def extract_frames(video_path: str, output_dir: str, every_n_frames: int = 15) -> int:
    """
    Extract 1 frame every N frames from a dashcam video.

    Args:
        video_path:     path to .mp4 / .avi / .mov file
        output_dir:     directory to save extracted JPG frames
        every_n_frames: sample rate (default 15 = 2fps from 30fps video)

    Returns:
        number of frames saved
    """
    video_name = Path(video_path).stem
    os.makedirs(output_dir, exist_ok=True)

    cap         = cv2.VideoCapture(video_path)
    total       = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps         = cap.get(cv2.CAP_PROP_FPS)

    print(f"Processing: {video_name}  ({total} frames at {fps:.0f}fps)")

    frame_count = saved_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % every_n_frames == 0:
            filename = f"{video_name}_frame_{frame_count:06d}.jpg"
            cv2.imwrite(
                os.path.join(output_dir, filename),
                frame,
                [cv2.IMWRITE_JPEG_QUALITY, 95]
            )
            saved_count += 1
        frame_count += 1

    cap.release()
    print(f"  Saved {saved_count} frames from {frame_count} total.")
    return saved_count


def main():
    # Paths — update DRIVE_BASE to your Google Drive folder
    DRIVE_BASE = "/content/drive/MyDrive/pavement-shm-data"
    VIDEO_DIR  = f"{DRIVE_BASE}/raw_videos"
    FRAMES_DIR = f"{DRIVE_BASE}/frames"

    VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".MOV"}

    videos = [
        f for f in os.listdir(VIDEO_DIR)
        if Path(f).suffix in VIDEO_EXTENSIONS
    ]

    if not videos:
        print(f"No videos found in {VIDEO_DIR}")
        return

    print(f"Found {len(videos)} video(s). Extracting frames...")
    total_saved = 0

    for video_file in videos:
        total_saved += extract_frames(
            video_path     = os.path.join(VIDEO_DIR, video_file),
            output_dir     = FRAMES_DIR,
            every_n_frames = 15,
        )

    print(f"
Done. Total frames saved: {total_saved}")
    print(f"Location: {FRAMES_DIR}")


if __name__ == "__main__":
    main()
