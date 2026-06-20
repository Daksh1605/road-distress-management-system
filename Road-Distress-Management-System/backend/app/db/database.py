"""
Database models base configuration for the Road Distress Management System.
Defines SQLAlchemy DeclarativeBase with standard index naming conventions.
"""

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# Naming convention for SQL constraints to make database migrations clean
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy database models.
    Inherited tables will automatically resolve properties.
    """
    metadata = MetaData(naming_convention=convention)
