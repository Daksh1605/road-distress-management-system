"""
CRUD operations for the MaintenanceTask entity.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.maintenance import MaintenanceTask
from app.schemas.maintenance import MaintenanceTaskCreate, MaintenanceTaskUpdate


def get_maintenance_task(db: Session, task_id: int) -> Optional[MaintenanceTask]:
    """
    Retrieve a single maintenance task by ID.
    """
    return db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()


def get_maintenance_tasks(db: Session, skip: int = 0, limit: int = 100) -> List[MaintenanceTask]:
    """
    Retrieve a list of maintenance tasks with pagination.
    """
    return db.query(MaintenanceTask).offset(skip).limit(limit).all()


def create_maintenance_task(db: Session, task_in: MaintenanceTaskCreate) -> MaintenanceTask:
    """
    Schedule a new maintenance task.
    """
    db_task = MaintenanceTask(
        distress_id=task_in.distress_id,
        recommendation=task_in.recommendation,
        priority=task_in.priority,
        assigned_to=task_in.assigned_to,
        due_date=task_in.due_date,
        status=task_in.status,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_maintenance_task(db: Session, task_id: int, task_in: MaintenanceTaskUpdate) -> Optional[MaintenanceTask]:
    """
    Update an existing maintenance task.
    """
    db_task = get_maintenance_task(db, task_id)
    if not db_task:
        return None

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_maintenance_task(db: Session, task_id: int) -> Optional[MaintenanceTask]:
    """
    Delete a maintenance task by ID.
    """
    db_task = get_maintenance_task(db, task_id)
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task
