"""
Service layer for User business logic in the Road Distress Management System.
"""

from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.crud.user import (
    get_user,
    get_user_by_email,
    get_users,
    create_user,
    update_user,
    delete_user,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """
    UserService handles business rules and exceptions for User operations.
    """

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User:
        """
        Retrieves a user by ID or raises 404.
        """
        user = get_user(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found",
            )
        return user

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """
        Retrieves a user by email.
        """
        return get_user_by_email(db, email)

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Retrieves a list of users.
        """
        return get_users(db, skip=skip, limit=limit)

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        """
        Creates a user after verifying email uniqueness.
        """
        existing_user = get_user_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists",
            )
        return create_user(db, user_in=user_in)

    @staticmethod
    def update(db: Session, user_id: int, user_in: UserUpdate) -> User:
        """
        Updates a user by checking email uniqueness and existence.
        """
        # Ensure user exists
        UserService.get_by_id(db, user_id)

        # Check if email is updated and is already in use by someone else
        if user_in.email:
            existing_user = get_user_by_email(db, email=user_in.email)
            if existing_user and existing_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A user with this email already exists",
                )

        updated = update_user(db, user_id=user_id, user_in=user_in)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found",
            )
        return updated

    @staticmethod
    def delete(db: Session, user_id: int) -> User:
        """
        Deletes a user after checking existence.
        """
        UserService.get_by_id(db, user_id)
        deleted = delete_user(db, user_id=user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found",
            )
        return deleted
