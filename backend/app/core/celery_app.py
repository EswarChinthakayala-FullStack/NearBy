from celery import Celery
from app.core.config import settings
from app.tasks.beat_schedule import BEAT_SCHEDULE

# Global Celery application instance
celery_app = Celery(
    "nearby_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.tasks",
        "app.tasks.osm_tasks",
        "app.tasks.wikipedia_tasks",
        "app.tasks.image_tasks",
        "app.tasks.maintenance_tasks",
    ]
)

# Production Celery worker configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,          # Hard limit: 1 hour maximum per background job
    task_soft_time_limit=3300,     # Soft limit: 55 minutes
    worker_prefetch_multiplier=1,  # Prevent worker overload during heavy scrapers
    worker_concurrency=4,          # Dedicated worker threads
    beat_schedule=BEAT_SCHEDULE
)
