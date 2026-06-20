"""
CRUD package exposing all database operations.
"""

from app.crud.user import (
    get_user,
    get_user_by_email,
    get_users,
    create_user,
    update_user,
    delete_user
)
from app.crud.distress import (
    get_distress,
    get_distresses,
    create_distress,
    update_distress,
    delete_distress
)
from app.crud.video import (
    get_video,
    get_videos,
    create_video,
    update_video,
    delete_video
)
from app.crud.maintenance import (
    get_maintenance_task,
    get_maintenance_tasks,
    create_maintenance_task,
    update_maintenance_task,
    delete_maintenance_task
)
from app.crud.report import (
    get_report,
    get_reports,
    create_report,
    delete_report
)

__all__ = [
    "get_user",
    "get_user_by_email",
    "get_users",
    "create_user",
    "update_user",
    "delete_user",
    "get_distress",
    "get_distresses",
    "create_distress",
    "update_distress",
    "delete_distress",
    "get_video",
    "get_videos",
    "create_video",
    "update_video",
    "delete_video",
    "get_maintenance_task",
    "get_maintenance_tasks",
    "create_maintenance_task",
    "update_maintenance_task",
    "delete_maintenance_task",
    "get_report",
    "get_reports",
    "create_report",
    "delete_report",
]
