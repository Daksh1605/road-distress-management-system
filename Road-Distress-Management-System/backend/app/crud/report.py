"""
CRUD operations for the Report entity.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.report import Report
from app.schemas.report import ReportCreate


def get_report(db: Session, report_id: int) -> Optional[Report]:
    """
    Retrieve a single report log by ID.
    """
    return db.query(Report).filter(Report.id == report_id).first()


def get_reports(db: Session, skip: int = 0, limit: int = 100) -> List[Report]:
    """
    Retrieve a list of report logs with pagination.
    """
    return db.query(Report).offset(skip).limit(limit).all()


def create_report(db: Session, report_in: ReportCreate) -> Report:
    """
    Log a new report.
    """
    db_report = Report(
        report_name=report_in.report_name,
        report_type=report_in.report_type,
        generated_by=report_in.generated_by,
        filepath=report_in.filepath,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def delete_report(db: Session, report_id: int) -> Optional[Report]:
    """
    Delete a report log by ID.
    """
    db_report = get_report(db, report_id)
    if db_report:
        db.delete(db_report)
        db.commit()
    return db_report
