import logging
import time
import uuid
from typing import Dict, Any, Optional

logger = logging.getLogger("nearby.telemetry")

class StructuredLogger:
    """Structured JSON telemetry and metrics logger for tracking request performance."""

    @staticmethod
    def log_ai_nearby_request(
        request_id: str,
        user_id: Optional[str],
        query: str,
        latitude: float,
        longitude: float,
        cache_hit: bool,
        ai_latency_ms: float,
        db_latency_ms: float,
        total_latency_ms: float,
        result_count: int
    ) -> None:
        log_entry = {
            "timestamp": time.time(),
            "event": "ai_nearby_search",
            "request_id": request_id,
            "user_id": user_id or "anonymous",
            "coordinates": {"lat": latitude, "lng": longitude},
            "query": query,
            "cache_hit": cache_hit,
            "latency_ms": {
                "ai": round(ai_latency_ms, 2),
                "db": round(db_latency_ms, 2),
                "total": round(total_latency_ms, 2)
            },
            "result_count": result_count
        }
        logger.info(f"AI_NEARBY_SEARCH: {log_entry}")

telemetry_logger = StructuredLogger()
