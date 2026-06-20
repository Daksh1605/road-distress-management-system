"""
User CRUD routes for the Road Distress Management System.
"""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.services.user import UserService

router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user_in: UserCreate, db: Session = Depends(get_db)
) -> UserResponse:
    """
    Create a new user.
    """
    return UserService.create(db, user_in=user_in)


@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> List[UserResponse]:
    """
    Retrieve all users with pagination.
    """
    return UserService.get_all(db, skip=skip, limit=limit)


@router.get("/{id}", response_model=UserResponse)
def read_user_by_id(id: int, db: Session = Depends(get_db)) -> UserResponse:
    """
    Retrieve a user by ID.
    """
    return UserService.get_by_id(db, user_id=id)


@router.put("/{id}", response_model=UserResponse)
def update_user_by_id(
    id: int, user_in: UserUpdate, db: Session = Depends(get_db)
) -> UserResponse:
    """
    Update user information.
    """
    return UserService.update(db, user_id=id, user_in=user_in)


@router.delete("/{id}", response_model=UserResponse)
def delete_user_by_id(id: int, db: Session = Depends(get_db)) -> UserResponse:
    """
    Delete a user by ID.
    """
    return UserService.delete(db, user_id=id)
