"""
Database session management for the Road Distress Management System.
Handles engine setup and dependency generation for requests.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app.core.config import settings

# Initialize SQLAlchemy engine connection
engine = create_engine(
    settings.sqlalchemy_database_uri,
    pool_pre_ping=True,  # Proactively test connection status on checkout
    echo=False           # Logs generated SQL queries to stdout if True
)

# Configured sessionmaker factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency generator yielding database session instances.
    Guarantees session teardown/closure post request cycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
