"""
Analytics service compiling road distress metrics and distributions.
"""

from typing import Dict, Any
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.distress import RoadDistress
from app.models.video import UploadedVideo


def get_detection_analytics(db: Session) -> Dict[str, Any]:
    """
    Computes summary analytics for road distress detections.
    
    Includes:
      - total_detections: Total count of distress records.
      - distress_type_distribution: Dictionary of counts keyed by distress type (pothole, crack, etc.).
      - severity_distribution: Dictionary of counts keyed by severity category (low, medium, high, critical).
      - average_confidence: Average accuracy score across all recorded detections.
      - detections_per_video: Dictionary mapping video filenames to their respective detection counts.
    """
    # Total count of logged distress anomalies
    total_detections = db.query(RoadDistress).count()

    # Distress type distribution counts
    type_query = db.query(
        RoadDistress.distress_type,
        func.count(RoadDistress.id)
    ).group_by(RoadDistress.distress_type).all()
    distress_type_distribution = {str(t).lower(): count for t, count in type_query}

    # Severity level distribution counts
    severity_query = db.query(
        RoadDistress.severity,
        func.count(RoadDistress.id)
    ).group_by(RoadDistress.severity).all()
    severity_distribution = {str(s).lower(): count for s, count in severity_query}

    # Average confidence index score
    avg_conf = db.query(func.avg(RoadDistress.confidence_score)).scalar()
    average_confidence = round(float(avg_conf), 4) if avg_conf is not None else 0.0

    # Detections counts segmented per uploaded video
    video_query = db.query(
        RoadDistress.video_id,
        func.count(RoadDistress.id)
    ).filter(RoadDistress.video_id.isnot(None)).group_by(RoadDistress.video_id).all()

    detections_per_video = {}
    for vid_id, count in video_query:
        video = db.query(UploadedVideo).filter(UploadedVideo.id == vid_id).first()
        filename = video.filename if video else f"Video ID {vid_id}"
        detections_per_video[filename] = count

    return {
        "total_detections": total_detections,
        "distress_type_distribution": distress_type_distribution,
        "severity_distribution": severity_distribution,
        "average_confidence": average_confidence,
        "detections_per_video": detections_per_video
    }
