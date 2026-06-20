"""
Authentication routes for the Road Distress Management System.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.crud.user import get_user_by_email, create_user
from app.schemas.user import UserResponse, UserCreate
from app.core.security import verify_password

router = APIRouter()


class LoginRequest(BaseModel):
    """
    Request model for user authentication.
    """
    email: str
    password: str


@router.post("/login", response_model=UserResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> UserResponse:
    """
    Authenticate user using email and password.
    """
    user = get_user_by_email(db, email=request.email)
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """
    Register a new inspector or user in the database.
    """
    user = get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    return create_user(db, user_in=user_in)
