import json
import logging
from typing import Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Memory fallback cache if Redis connection is not established
_memory_cache: dict[str, tuple[Any, float]] = {}

class CacheManager:
    """Production-grade asynchronous Redis cache manager with in-memory fallback."""

    def __init__(self):
        self._redis_client = None
        self._initialized = False

    async def _get_client(self):
        if self._initialized:
            return self._redis_client
        try:
            import redis.asyncio as aioredis
            self._redis_client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=2.0,
                socket_connect_timeout=2.0
            )
            await self._redis_client.ping()
            self._initialized = True
            logger.info("Redis cache client connected successfully.")
            return self._redis_client
        except Exception as e:
            logger.warning(f"Redis connection failed ({e}). Falling back to in-memory cache.")
            self._redis_client = None
            self._initialized = True
            return None

    async def get(self, key: str) -> Optional[Any]:
        try:
            client = await self._get_client()
            if client:
                val = await client.get(key)
                if val:
                    return json.loads(val)
                return None
            else:
                import time
                if key in _memory_cache:
                    val, expire_at = _memory_cache[key]
                    if expire_at > time.time():
                        return val
                    del _memory_cache[key]
                return None
        except Exception as e:
            logger.error(f"Error fetching cache key '{key}': {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        try:
            client = await self._get_client()
            val_str = json.dumps(value, default=str)
            if client:
                await client.set(key, val_str, ex=ttl)
                return True
            else:
                import time
                _memory_cache[key] = (value, time.time() + ttl)
                return True
        except Exception as e:
            logger.error(f"Error setting cache key '{key}': {e}")
            return False

    async def delete(self, key: str) -> bool:
        try:
            client = await self._get_client()
            if client:
                await client.delete(key)
            if key in _memory_cache:
                del _memory_cache[key]
            return True
        except Exception as e:
            logger.error(f"Error deleting cache key '{key}': {e}")
            return False

cache_manager = CacheManager()
