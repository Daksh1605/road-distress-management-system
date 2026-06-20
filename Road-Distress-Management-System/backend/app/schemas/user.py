"""
Pydantic schemas for User entity in the Road Distress Management System.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

# Regular expression pattern to validate standard email format
EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"


class UserBase(BaseModel):
    """
    Shared base schema properties for User.
    """
    email: str = Field(
        ..., 
        max_length=255, 
        pattern=EMAIL_REGEX,
        description="Unique email address of the user"
    )
    full_name: Optional[str] = Field(None, max_length=255, description="Full name of the user")
    role: str = Field("inspector", max_length=50, description="Role of the user, e.g., inspector, admin, maintenance")


class UserCreate(UserBase):
    """
    Properties required to create a new user.
    """
    password: str = Field(..., min_length=6, description="Plain text password of the user")


class UserUpdate(BaseModel):
    """
    Properties for updating an existing user. All fields are optional.
    """
    email: Optional[str] = Field(None, max_length=255, pattern=EMAIL_REGEX)
    full_name: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, max_length=50)
    password: Optional[str] = Field(None, min_length=6)


class UserResponse(UserBase):
    """
    API response representation of a User.
    """
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
