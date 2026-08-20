from celery import Celery
from app.core.config import settings
from app.tasks.beat_schedule import BEAT_SCHEDULE

celery_app = Celery(
    "nearby_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.tasks", "app.tasks.image_search_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour limit for long OSM ingestion jobs
    beat_schedule=BEAT_SCHEDULE
)
