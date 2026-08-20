import time
from typing import Dict, Any

class PerformanceMetricsTracker:
    """In-memory metrics tracker for Prometheus & OpenTelemetry integration."""

    def __init__(self):
        self.total_requests = 0
        self.cache_hits = 0
        self.cache_misses = 0
        self.ai_errors = 0

    def record_search(self, cache_hit: bool, duration_ms: float):
        self.total_requests += 1
        if cache_hit:
            self.cache_hits += 1
        else:
            self.cache_misses += 1

    def get_summary(self) -> Dict[str, Any]:
        hit_ratio = (self.cache_hits / self.total_requests * 100) if self.total_requests > 0 else 0.0
        return {
            "total_requests": self.total_requests,
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "cache_hit_ratio_pct": round(hit_ratio, 2),
            "ai_errors": self.ai_errors
        }

metrics_tracker = PerformanceMetricsTracker()
