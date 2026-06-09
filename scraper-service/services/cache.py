"""
PennyWise Scraper — Redis Cache Service
Caching layer for scraped results. Gracefully degrades if Redis is unavailable.
"""

import json
from typing import Optional, List
from config import settings


class CacheService:
    """Redis cache wrapper with graceful fallback."""

    def __init__(self):
        self.client = None
        self._connect()

    def _connect(self):
        """Try to connect to Redis. Fail silently if unavailable."""
        if not settings.REDIS_URL:
            print("[CACHE] Redis URL not configured - caching disabled")
            return

        try:
            import redis
            self.client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
            )
            # Test connection
            self.client.ping()
            print(f"[CACHE] Redis connected: {settings.REDIS_URL}")
        except Exception as e:
            print(f"[CACHE] Redis connection failed: {e} - caching disabled")
            self.client = None

    def _key(self, product_name: str) -> str:
        """Generate a cache key from a product name."""
        clean = product_name.lower().strip().replace(' ', '_')
        return f"{settings.CACHE_PREFIX}{clean}"

    def get(self, product_name: str) -> Optional[list]:
        """
        Get cached scrape results for a product.
        Returns None if not cached or Redis unavailable.
        """
        if not self.client:
            return None

        try:
            key = self._key(product_name)
            cached = self.client.get(key)
            if cached:
                return json.loads(cached)
            return None
        except Exception as e:
            print(f"[CACHE] Read error: {e}")
            return None

    def set(self, product_name: str, results: list, ttl: int = None) -> bool:
        """
        Cache scrape results for a product.
        Returns True if cached successfully.
        """
        if not self.client:
            return False

        if ttl is None:
            ttl = settings.CACHE_TTL

        try:
            key = self._key(product_name)
            self.client.setex(key, ttl, json.dumps(results))
            return True
        except Exception as e:
            print(f"[CACHE] Write error: {e}")
            return False

    def invalidate(self, product_name: str) -> bool:
        """Remove a product from cache."""
        if not self.client:
            return False

        try:
            key = self._key(product_name)
            self.client.delete(key)
            return True
        except Exception as e:
            print(f"[CACHE] Delete error: {e}")
            return False

    @property
    def is_available(self) -> bool:
        """Check if Redis is connected and responsive."""
        if not self.client:
            return False
        try:
            return self.client.ping()
        except Exception:
            return False


# Singleton instance
cache = CacheService()
