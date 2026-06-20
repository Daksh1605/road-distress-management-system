"""
Authentication routes for the Road Distress Management System.
Placeholder for login, registration, and session token verification.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
def login() -> dict:
    """
    Placeholder endpoint to authenticate users.
    """
    return {"message": "Authentication endpoint stub"}
