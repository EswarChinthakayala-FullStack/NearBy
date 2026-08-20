from celery.schedules import crontab

BEAT_SCHEDULE = {
    "recalculate-ratings-nightly": {
        "task": "maintenance.recalculate_ratings",
        "schedule": crontab(hour=2, minute=0),  # Runs daily at 02:00 AM UTC
    },
    "recalculate-favorites-nightly": {
        "task": "maintenance.recalculate_favorites",
        "schedule": crontab(hour=2, minute=30),  # Runs daily at 02:30 AM UTC
    },
    "cleanup-expired-routing-cache-daily": {
        "task": "maintenance.cleanup_routing_cache",
        "schedule": crontab(hour=3, minute=0),  # Runs daily at 03:00 AM UTC
    },
    "osm-periodic-sync-check-weekly": {
        "task": "maintenance.osm_sync_health_check",
        "schedule": crontab(day_of_week=0, hour=2, minute=0),  # Runs every Sunday at 02:00 AM UTC
    },
    "refresh-trending-periodic": {
        "task": "maintenance.refresh_trending",
        "schedule": 900.0,  # Runs every 15 minutes (900 seconds)
    },
}
