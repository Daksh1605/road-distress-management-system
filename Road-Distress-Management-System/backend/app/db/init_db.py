"""
Database initialization and validation utility.
Verifies connection, verifies table existence, prints registered models and database URL,
and seeds initial administrative users.
"""

import logging
from sqlalchemy import text, inspect
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings

# Set up logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def verify_db_connection() -> None:
    """
    Verifies connection to PostgreSQL database and checks registered tables.
    """
    # 1. Print Database URL (without password)
    db_uri = settings.sqlalchemy_database_uri
    url = make_url(db_uri)
    safe_url = url.render_as_string(hide_password=True)
    logger.info(f"Database URL (redacted): {safe_url}")

    # 2. Verify connection
    logger.info("Verifying database connection...")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection works through SQLAlchemy.")
    except Exception as e:
        logger.critical(f"Database connection validation failed: {e}")
        raise e

    # 3. Print registered models
    registered_tables = list(Base.metadata.tables.keys())
    logger.info(f"Registered SQLAlchemy models (tables): {registered_tables}")


def init_db(db: Session) -> None:
    """
    Creates tables via SQLAlchemy Base metadata and inserts standard initial seed data.
    """
    logger.info("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    # Verify tables actually exist in database
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    logger.info(f"Current tables in database: {existing_tables}")
    
    required_tables = ["users", "road_distresses", "uploaded_videos", "maintenance_tasks", "reports"]
    missing_tables = [t for t in required_tables if t not in existing_tables]
    if missing_tables:
        err_msg = f"Table verification failed. Missing tables: {missing_tables}"
        logger.critical(err_msg)
        raise RuntimeError(err_msg)
    
    logger.info("All required tables are present in the database.")

    logger.info("Checking for administrative seeding conditions...")
    # Seed a default admin if none exist
    admin_email = "admin@roaddistress.org"
    admin_user = db.query(User).filter(User.email == admin_email).first()
    
    if not admin_user:
        logger.info(f"Seeding default system administrator: {admin_email}...")
        new_admin = User(
            email=admin_email,
            full_name="Default Administrator",
            hashed_password=get_password_hash("AdminSecurePassword123!"),
            role="admin"
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        logger.info("Seeding completed successfully.")
    else:
        logger.info("Administrator account already exists. Seeding skipped.")


def main() -> None:
    """
    Runner entrypoint for manual database initialization and validation.
    """
    try:
        verify_db_connection()
        db = SessionLocal()
        try:
            init_db(db)
        finally:
            db.close()
        logger.info("Database initialization script finished successfully.")
    except Exception as e:
        logger.critical(f"Database initialization script failed: {e}")
        exit(1)


if __name__ == "__main__":
    main()
