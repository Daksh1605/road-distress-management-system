"""
AI processing helper utility functions.
"""

import random
from typing import Tuple

# Mapping from class ID to distress type
CLASS_MAPPING = {
    0: "pothole",
    1: "crack",
    2: "rutting",
    3: "raveling"
}

# Base location coordinates from seed data for realistic Indian corridor simulation
BASE_LOCATIONS = [
    (18.7501, 73.4002),  # Lonavala Ghats NH-48
    (18.5912, 73.7123),  # Hinjewadi Phase 3 Road
    (19.0824, 72.9135),  # Ghatkopar Flyover Eastern Express
    (19.2015, 73.0112),  # Thane Toll Plaza Corridor
    (13.1042, 77.3821),  # Nelamangala Highway NH-48
    (12.8915, 77.4812),  # Kengeri Metro Corridor SH-17
    (12.5231, 76.9015),  # Mandya Bypass NH-275
    (15.3614, 75.1213),  # Davangere Highway Corridor
    (28.5612, 77.2145),  # Ring Road AIIMS Underpass
    (28.6315, 77.2212),  # CP Outer Circle G-Block
    (28.5942, 77.1712),  # Dhaula Kuan Flyover Loop
    (12.9214, 80.1215),  # Tambaram-Chengalpattu Flyover
    (13.0712, 80.2014),  # Koyambedu Junction Flyover
    (12.9712, 77.5914)   # MG Road Metro Pillar 110
]


def map_class_id_to_name(class_id: int) -> str:
    """
    Map YOLO class integer ID to human readable distress type.
    """
    return CLASS_MAPPING.get(class_id, "unknown")


def map_confidence_to_severity(confidence: float) -> str:
    """
    Convert confidence score into severity classification.
    """
    if confidence >= 0.8:
        return "critical" if confidence >= 0.9 else "high"
    elif confidence >= 0.5:
        return "medium"
    else:
        return "low"


def generate_gps_coordinates() -> Tuple[float, float]:
    """
    Generates realistic GPS coordinates by picking a base corridor location
    and applying a small random geographical offset.
    """
    base_lat, base_lon = random.choice(BASE_LOCATIONS)
    # Small offset: +/- 0.005 approx 500 meters
    offset_lat = random.uniform(-0.005, 0.005)
    offset_lon = random.uniform(-0.005, 0.005)
    return round(base_lat + offset_lat, 6), round(base_lon + offset_lon, 6)
