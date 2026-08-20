import time
from typing import Dict, Any, Optional
import redis
from app.core.config import settings
from app.core.logging_config import logger


class SourceCircuitBreaker:
    """
    Per-source circuit breaker managing scraper availability.
    If a scraper source fails N consecutive times (default: 3), it enters a cooldown
    period (default: 600 seconds / 10 mins) to prevent hammering breaking targets.
    """

    def __init__(
        self,
        failure_threshold: int = 3,
        cooldown_seconds: int = 600
    ):
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self._memory_state: Dict[str, Dict[str, Any]] = {}
        self._redis_client: Optional[redis.Redis] = None

    def _get_redis(self) -> Optional[redis.Redis]:
        """Lazy connection to Redis client for persistent state sharing across processes."""
        try:
            return redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1.0)
        except Exception:
            return None

    def is_available(self, source: str) -> bool:
        """Check whether a search source is currently healthy and outside cooldown."""
        now = time.time()
        r = self._get_redis()

        if r:
            try:
                cooldown_until = r.get(f"cb:{source}:cooldown_until")
                if cooldown_until and float(cooldown_until) > now:
                    logger.info(
                        f"Circuit breaker OPEN for source '{source}'. Skipping. "
                        f"Cooldown remaining: {int(float(cooldown_until) - now)}s"
                    )
                    return False
                return True
            except Exception as e:
                logger.debug(f"Redis circuit breaker read error ({e}), falling back to memory state.")

        # In-memory fallback
        state = self._memory_state.get(source, {})
        cooldown_until = state.get("cooldown_until", 0.0)
        if cooldown_until > now:
            logger.info(f"Circuit breaker OPEN for source '{source}' (memory). Skipping request.")
            return False
        return True

    def record_success(self, source: str, count: int = 1, latency: float = 0.0) -> None:
        """Record a successful extraction from a source."""
        now = time.time()
        logger.info(f"[Circuit Breaker] Success for source '{source}' - fetched {count} items in {latency:.2f}s")

        r = self._get_redis()
        if r:
            try:
                pipe = r.pipeline()
                pipe.set(f"cb:{source}:consecutive_failures", 0)
                pipe.delete(f"cb:{source}:cooldown_until")
                pipe.incr(f"cb:{source}:total_successes")
                pipe.incr(f"cb:{source}:total_requests")
                pipe.execute()
                return
            except Exception as e:
                logger.debug(f"Redis circuit breaker success write error: {e}")

        # In-memory state update
        state = self._memory_state.setdefault(source, {
            "consecutive_failures": 0,
            "cooldown_until": 0.0,
            "total_successes": 0,
            "total_failures": 0,
            "total_requests": 0
        })
        state["consecutive_failures"] = 0
        state["cooldown_until"] = 0.0
        state["total_successes"] += 1
        state["total_requests"] += 1

    def record_failure(self, source: str, error: str = "") -> None:
        """Record a failure from a source and open circuit breaker if threshold reached."""
        now = time.time()
        r = self._get_redis()

        if r:
            try:
                failures = r.incr(f"cb:{source}:consecutive_failures")
                r.incr(f"cb:{source}:total_failures")
                r.incr(f"cb:{source}:total_requests")

                if failures >= self.failure_threshold:
                    cooldown_until = now + self.cooldown_seconds
                    r.setex(f"cb:{source}:cooldown_until", self.cooldown_seconds, str(cooldown_until))
                    logger.warning(
                        f"[Circuit Breaker] Source '{source}' reached failure threshold ({failures}/{self.failure_threshold}). "
                        f"Entering {self.cooldown_seconds}s cooldown. Error: {error}"
                    )
                else:
                    logger.warning(f"[Circuit Breaker] Source '{source}' failed ({failures}/{self.failure_threshold}). Error: {error}")
                return
            except Exception as e:
                logger.debug(f"Redis circuit breaker failure write error: {e}")

        # In-memory fallback
        state = self._memory_state.setdefault(source, {
            "consecutive_failures": 0,
            "cooldown_until": 0.0,
            "total_successes": 0,
            "total_failures": 0,
            "total_requests": 0
        })
        state["consecutive_failures"] += 1
        state["total_failures"] += 1
        state["total_requests"] += 1

        if state["consecutive_failures"] >= self.failure_threshold:
            state["cooldown_until"] = now + self.cooldown_seconds
            logger.warning(
                f"[Circuit Breaker] Source '{source}' reached memory threshold ({state['consecutive_failures']}/{self.failure_threshold}). "
                f"Entering cooldown. Error: {error}"
            )
        else:
            logger.warning(f"[Circuit Breaker] Source '{source}' failed (memory {state['consecutive_failures']}/{self.failure_threshold}). Error: {error}")

    def get_stats(self, source: str) -> Dict[str, Any]:
        """Return operational metrics for a specific scraper source."""
        now = time.time()
        r = self._get_redis()
        if r:
            try:
                succ = int(r.get(f"cb:{source}:total_successes") or 0)
                fail = int(r.get(f"cb:{source}:total_failures") or 0)
                tot = int(r.get(f"cb:{source}:total_requests") or 0)
                cooldown = r.get(f"cb:{source}:cooldown_until")
                cooldown_remaining = max(0, int(float(cooldown) - now)) if cooldown else 0
                rate = (succ / tot * 100) if tot > 0 else 100.0
                return {
                    "source": source,
                    "available": cooldown_remaining == 0,
                    "cooldown_remaining_sec": cooldown_remaining,
                    "success_rate_pct": round(rate, 2),
                    "total_requests": tot,
                    "total_successes": succ,
                    "total_failures": fail,
                }
            except Exception:
                pass

        state = self._memory_state.get(source, {})
        tot = state.get("total_requests", 0)
        succ = state.get("total_successes", 0)
        fail = state.get("total_failures", 0)
        cooldown_until = state.get("cooldown_until", 0.0)
        cooldown_remaining = max(0, int(cooldown_until - now))
        rate = (succ / tot * 100) if tot > 0 else 100.0
        return {
            "source": source,
            "available": cooldown_remaining == 0,
            "cooldown_remaining_sec": cooldown_remaining,
            "success_rate_pct": round(rate, 2),
            "total_requests": tot,
            "total_successes": succ,
            "total_failures": fail,
        }


source_circuit_breaker = SourceCircuitBreaker()
