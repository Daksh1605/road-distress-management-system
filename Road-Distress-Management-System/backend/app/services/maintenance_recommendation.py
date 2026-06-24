"""
Intelligent Maintenance Recommendation Engine.
Maps road distresses to repair tasks, schedules responses, escalates priorities, and generates dashboard telemetry.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.distress import RoadDistress
from app.models.maintenance import MaintenanceTask
from app.crud.maintenance import create_maintenance_task
from app.schemas.maintenance import MaintenanceTaskCreate

logger = logging.getLogger(__name__)


def recommend_maintenance(
    distress_type: str,
    severity: str,
    confidence: float,
    frequency: int = 1
) -> Dict[str, Any]:
    """
    Core algorithm of the Maintenance Recommendation Engine.
    
    Inputs:
        distress_type (str): Type of distress (e.g. pothole, crack, rutting, raveling)
        severity (str): Distress severity level (critical, high, medium, low)
        confidence (float): AI model confidence score (0.0 to 1.0)
        frequency (int): Number of duplicate/spatially near distresses in the vicinity
        
    Outputs:
        Dict: Contains recommended_action, priority, estimated_response_time,
              maintenance_category, and estimated_cost.
    """
    dtype = distress_type.lower()
    sev = severity.lower()
    
    # 1. Base rule mappings by type and severity
    if "pothole" in dtype:
        if sev == "critical":
            action = "Emergency Road Patching & Asphalt Filling"
            category = "Emergency"
            priority = "P1"
            response_time = "within 24 hours"
            cost = 75000
        elif sev == "high":
            action = "Structural Hot-Mix Asphalt Patching"
            category = "Structural"
            priority = "P2"
            response_time = "within 7 days"
            cost = 55000
        elif sev == "medium":
            action = "Preventative Cold-Mix Patching & Sealing"
            category = "Preventative"
            priority = "P3"
            response_time = "within 30 days"
            cost = 30000
        else:
            action = "Routine Surface Monitoring & Minor Repair"
            category = "Routine"
            priority = "P4"
            response_time = "routine next cycle"
            cost = 15000
            
    elif "crack" in dtype:
        if sev in ["critical", "high"]:
            action = "Structural Joint Crack Sealing & Routing"
            category = "Structural"
            priority = "P2"
            response_time = "within 7 days"
            cost = 120000
        elif sev == "medium":
            action = "Preventative Slurry Seal Crack Application"
            category = "Preventative"
            priority = "P3"
            response_time = "within 30 days"
            cost = 45000
        else:
            action = "Routine Surface Dressing & Inspection"
            category = "Routine"
            priority = "P4"
            response_time = "routine next cycle"
            cost = 20000

    elif "rut" in dtype:
        if sev in ["critical", "high"]:
            action = "Structural Milling & Asphalt Overlay Replacement"
            category = "Structural"
            priority = "P2"
            response_time = "within 7 days"
            cost = 210000
        elif sev == "medium":
            action = "Preventative Micro-Surfacing Correction"
            category = "Preventative"
            priority = "P3"
            response_time = "within 30 days"
            cost = 90000
        else:
            action = "Routine Leveling Treatment"
            category = "Routine"
            priority = "P4"
            response_time = "routine next cycle"
            cost = 40000

    else:  # Raveling, Edge Break, or other distresses
        if sev in ["critical", "high"]:
            action = "Structural Patching & Edge Rebuilding"
            category = "Structural"
            priority = "P2"
            response_time = "within 7 days"
            cost = 95000
        elif sev == "medium":
            action = "Preventative Seal Coat Re-surfacing"
            category = "Preventative"
            priority = "P3"
            response_time = "within 30 days"
            cost = 35000
        else:
            action = "Routine Maintenance Sweeping & Monitoring"
            category = "Routine"
            priority = "P4"
            response_time = "routine next cycle"
            cost = 10000

    # 2. Intelligence: Escalation based on spatial recurrence frequency (cluster size)
    if frequency >= 3:
        if priority == "P4":
            priority = "P3"
            response_time = "within 30 days"
            action += " (Escalated due to high recurrence frequency)"
            cost = int(cost * 1.2)
        elif priority == "P3":
            priority = "P2"
            response_time = "within 7 days"
            action += " (Escalated due to high recurrence frequency)"
            cost = int(cost * 1.3)
        elif priority == "P2":
            priority = "P1"
            response_time = "within 24 hours"
            category = "Emergency"
            action += " (Escalated due to high recurrence frequency)"
            cost = int(cost * 1.5)
            
    return {
        "recommended_action": action,
        "priority": priority,
        "estimated_response_time": response_time,
        "maintenance_category": category,
        "estimated_cost": cost
    }


def calculate_spatial_frequency(db: Session, distress: RoadDistress) -> int:
    """
    Calculates spatial frequency by counting similar distresses within 
    approx 100 meters (0.001 degrees latitude/longitude bounding box).
    """
    lat_range = 0.001
    lon_range = 0.001
    count = db.query(RoadDistress).filter(
        RoadDistress.distress_type == distress.distress_type,
        RoadDistress.latitude.between(distress.latitude - lat_range, distress.latitude + lat_range),
        RoadDistress.longitude.between(distress.longitude - lon_range, distress.longitude + lon_range)
    ).count()
    return max(1, count)


def generate_recommendations_for_pending_distresses(db: Session) -> List[MaintenanceTask]:
    """
    Scans road distress records, computes recommendations for those without maintenance tasks,
    saves the new tasks to PostgreSQL, and returns all maintenance tasks.
    """
    logger.info("Running Maintenance Recommendation Engine for pending distresses...")
    
    # 1. Fetch all distress logs
    all_distresses = db.query(RoadDistress).all()
    
    for distress in all_distresses:
        # 2. Check if a task is already registered for this distress ID
        existing_task = db.query(MaintenanceTask).filter(
            MaintenanceTask.distress_id == distress.id
        ).first()
        
        if not existing_task:
            # 3. Compute spatial cluster frequency
            frequency = calculate_spatial_frequency(db, distress)
            
            # 4. Generate recommendation
            rec = recommend_maintenance(
                distress_type=distress.distress_type,
                severity=distress.severity,
                confidence=distress.confidence_score,
                frequency=frequency
            )
            
            # 5. Compute due date based on response time
            now = datetime.utcnow()
            rt = rec["estimated_response_time"]
            if rt == "within 24 hours":
                due_date = now + timedelta(days=1)
            elif rt == "within 7 days":
                due_date = now + timedelta(days=7)
            elif rt == "within 30 days":
                due_date = now + timedelta(days=30)
            else:  # routine next cycle
                due_date = now + timedelta(days=90)
                
            # 6. Create MaintenanceTask
            task_in = MaintenanceTaskCreate(
                distress_id=distress.id,
                recommendation=rec["recommended_action"],
                priority=rec["priority"],
                assigned_to=None,
                due_date=due_date,
                status="scheduled",
                estimated_response_time=rt,
                maintenance_category=rec["maintenance_category"],
                estimated_cost=rec["estimated_cost"]
            )
            create_maintenance_task(db, task_in=task_in)
            
    # Return all maintenance tasks
    return db.query(MaintenanceTask).all()


def get_maintenance_summary_statistics(db: Session) -> Dict[str, Any]:
    """
    Compiles summary statistics and KPIs for maintenance dashboard analytics.
    """
    total_tasks = db.query(MaintenanceTask).count()
    
    completed_repairs = db.query(MaintenanceTask).filter(
        MaintenanceTask.status == "completed"
    ).count()
    
    in_progress_repairs = db.query(MaintenanceTask).filter(
        MaintenanceTask.status == "in_progress"
    ).count()
    
    pending_repairs = db.query(MaintenanceTask).filter(
        MaintenanceTask.status == "scheduled"
    ).count()
    
    # Calculate total cost
    total_cost_res = db.query(func.sum(MaintenanceTask.estimated_cost)).scalar()
    total_cost = int(total_cost_res) if total_cost_res is not None else 0
    
    # Count by priority (P1, P2, P3, P4)
    priority_query = db.query(
        MaintenanceTask.priority,
        func.count(MaintenanceTask.id)
    ).group_by(MaintenanceTask.priority).all()
    priority_distribution = {p: count for p, count in priority_query}
    
    # Count by status
    status_query = db.query(
        MaintenanceTask.status,
        func.count(MaintenanceTask.id)
    ).group_by(MaintenanceTask.status).all()
    status_distribution = {s: count for s, count in status_query}
    
    # Count by category
    category_query = db.query(
        MaintenanceTask.maintenance_category,
        func.count(MaintenanceTask.id)
    ).group_by(MaintenanceTask.maintenance_category).all()
    category_distribution = {c: count for c, count in category_query if c is not None}

    # Generate last 6 months repairs completed list for charts
    months_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    current_month = datetime.utcnow().month
    
    monthly_repairs = []
    for i in range(5, -1, -1):
        m_idx = (current_month - i - 1 + 12) % 12
        monthly_repairs.append({
            "month": months_names[m_idx],
            "repairs": 0
        })
        
    # Query completed tasks and group them by month
    completed_tasks = db.query(MaintenanceTask).filter(
        MaintenanceTask.status == "completed"
    ).all()
    
    for task in completed_tasks:
        # Use updated_at as the completed date proxy
        m_name = months_names[task.updated_at.month - 1]
        for item in monthly_repairs:
            if item["month"] == m_name:
                item["repairs"] += 1
                
    return {
        "total_tasks": total_tasks,
        "completed_repairs": completed_repairs,
        "in_progress_repairs": in_progress_repairs,
        "pending_repairs": pending_repairs,
        "total_cost": total_cost,
        "priority_distribution": priority_distribution,
        "status_distribution": status_distribution,
        "category_distribution": category_distribution,
        "monthly_repairs": monthly_repairs
    }
