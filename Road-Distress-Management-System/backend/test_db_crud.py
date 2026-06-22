"""
Validation script for verifying database connection, CRUD operations,
and model relationships/cascades in Road Distress Management System.
"""

import sys
import logging
from sqlalchemy import text
from app.db.session import SessionLocal, engine
from app.models import User, RoadDistress, UploadedVideo, MaintenanceTask, Report
from app.core.security import get_password_hash, verify_password

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def test_database_crud() -> None:
    logger.info("Starting Database CRUD Validation Test...")
    db = SessionLocal()
    try:
        # 1. Connection check
        db.execute(text("SELECT 1"))
        logger.info("Step 1: Database connection is active.")

        # 2. Clean up any leftover test data
        test_email = "test_inspector@roaddistress.org"
        leftover_user = db.query(User).filter(User.email == test_email).first()
        if leftover_user:
            logger.info("Cleaning up leftover test user...")
            db.delete(leftover_user)
            db.commit()

        # 3. Create User
        logger.info("Step 2: Creating test user...")
        pwd_plain = "InspectorSecurePass123!"
        hashed_pwd = get_password_hash(pwd_plain)
        test_user = User(
            email=test_email,
            full_name="Test Inspector User",
            hashed_password=hashed_pwd,
            role="inspector"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        logger.info(f"Test user created successfully with ID: {test_user.id}")

        # Verify password validation
        assert verify_password(pwd_plain, test_user.hashed_password), "Password verification failed!"
        logger.info("Password verification logic verified successfully.")

        # 4. Create Road Distress
        logger.info("Step 3: Creating road distress log...")
        test_distress = RoadDistress(
            distress_type="Pothole",
            severity="high",
            confidence_score=0.92,
            latitude=37.7749,
            longitude=-122.4194,
            image_url="http://example.com/images/pothole1.jpg",
            status="detected"
        )
        db.add(test_distress)
        db.commit()
        db.refresh(test_distress)
        logger.info(f"Road distress log created successfully with ID: {test_distress.id}")

        # 5. Create Uploaded Video (referenced to User)
        logger.info("Step 4: Creating uploaded video log (linked to user)...")
        test_video = UploadedVideo(
            filename="highway_scan_01.mp4",
            filepath="uploads/videos/highway_scan_01.mp4",
            processing_status="completed",
            uploader_id=test_user.id
        )
        db.add(test_video)
        db.commit()
        db.refresh(test_video)
        logger.info(f"Uploaded video log created successfully with ID: {test_video.id}")

        # 6. Create Maintenance Task (referenced to Distress and User)
        logger.info("Step 5: Creating maintenance task (linked to distress and assignee)...")
        test_task = MaintenanceTask(
            distress_id=test_distress.id,
            recommendation="Apply cold mix asphalt patch immediately.",
            priority="high",
            assigned_to=test_user.id,
            status="scheduled"
        )
        db.add(test_task)
        db.commit()
        db.refresh(test_task)
        logger.info(f"Maintenance task created successfully with ID: {test_task.id}")

        # 7. Create Report (referenced to User)
        logger.info("Step 6: Creating report log (linked to generator user)...")
        test_report = Report(
            report_name="Q2 Distress Summary",
            report_type="PDF",
            generated_by=test_user.id
        )
        db.add(test_report)
        db.commit()
        db.refresh(test_report)
        logger.info(f"Report log created successfully with ID: {test_report.id}")

        # 8. Verify Relationships & Back-Populations
        logger.info("Step 7: Verifying relationships...")
        # Check user relationship
        db.refresh(test_user)
        assert len(test_user.uploaded_videos) == 1, "User's uploaded_videos relationship failed!"
        assert len(test_user.assigned_tasks) == 1, "User's assigned_tasks relationship failed!"
        assert len(test_user.generated_reports) == 1, "User's generated_reports relationship failed!"
        
        # Check distress relationship
        db.refresh(test_distress)
        assert len(test_distress.maintenance_tasks) == 1, "Distress's maintenance_tasks relationship failed!"
        
        logger.info("All ORM relationship properties verified successfully.")

        # 9. Verify Cascade Deletion of Maintenance Task when Distress is deleted
        logger.info("Step 8: Verifying cascade deletion (deleting distress should delete task)...")
        distress_id = test_distress.id
        task_id = test_task.id
        db.delete(test_distress)
        db.commit()
        
        # Try to retrieve task
        deleted_task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
        assert deleted_task is None, f"Cascade delete failed! Maintenance task {task_id} still exists."
        logger.info("Cascade deletion verified successfully (task deleted when associated distress is deleted).")

        # 10. Clean up remaining elements
        logger.info("Step 9: Cleaning up remaining test records...")
        db.delete(test_report)
        db.delete(test_video)
        db.delete(test_user)
        db.commit()
        logger.info("Cleanup completed successfully.")

        logger.info("--- DATABASE CRUD VALIDATION TEST COMPLETED SUCCESSFULLY ---")

    except Exception as e:
        logger.critical(f"Database CRUD Validation Test failed: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    test_database_crud()
