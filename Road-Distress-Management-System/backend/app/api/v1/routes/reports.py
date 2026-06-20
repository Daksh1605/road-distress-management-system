"""
Reporting and analytics routes for the Road Distress Management System.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.crud.report import (
    get_report,
    get_reports,
    create_report,
    delete_report
)
from app.schemas.report import (
    ReportCreate,
    ReportResponse
)

router = APIRouter()


@router.get("/", response_model=List[ReportResponse])
def read_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[ReportResponse]:
    """
    Retrieve all generated report logs.
    """
    return get_reports(db, skip=skip, limit=limit)


@router.get("/generate")
def generate_report() -> dict:
    """
    Placeholder endpoint to trigger and download a PDF/CSV/JSON system report.
    """
    return {"message": "Generate report stub"}


@router.get("/{id}", response_model=ReportResponse)
def read_report_by_id(id: int, db: Session = Depends(get_db)) -> ReportResponse:
    """
    Retrieve a single report log by ID.
    """
    db_report = get_report(db, report_id=id)
    if not db_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {id} not found"
        )
    return db_report


@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_system_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db)
) -> ReportResponse:
    """
    Trigger and log the generation of a PDF/CSV/JSON report.
    """
    # In a real app, logic would trigger actual file generation here.
    # We will log the report generation task metadata in database.
    return create_report(db, report_in=report_in)


@router.delete("/{id}", response_model=ReportResponse)
def delete_existing_report(id: int, db: Session = Depends(get_db)) -> ReportResponse:
    """
    Delete a report metadata log.
    """
    db_report = delete_report(db, report_id=id)
    if not db_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {id} not found"
        )
    return db_report
