"""Rate limiting service using Redis."""
import time
from typing import Optional, Tuple
import redis.asyncio as redis

from app.core.config import get_settings
from app.services.api_key_service import api_key_service, RateLimitTier

settings = get_settings()


class RateLimiter:
    """Redis-based rate limiter for API requests."""
    
    def __init__(self):
        self._redis: Optional[redis.Redis] = None
    
    async def get_redis(self) -> redis.Redis:
        """Get or create Redis connection."""
        if self._redis is None:
            self._redis = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
        return self._redis
    
    async def close(self):
        """Close Redis connection."""
        if self._redis:
            await self._redis.close()
            self._redis = None
    
    async def check_rate_limit(
        self, 
        key_id: str, 
        tier: RateLimitTier
    ) -> Tuple[bool, int, int]:
        """
        Check if request is within rate limit.
        
        Returns:
            Tuple of (allowed, remaining, reset_time)
        """
        requests_per_minute, burst_limit = api_key_service.get_rate_limit(tier)
        
        if tier == RateLimitTier.ENTERPRISE:
            # Enterprise has unlimited rate limits
            return True, -1, -1
        
        redis_client = await self.get_redis()
        
        # Use sliding window rate limiting
        window = 60  # 1 minute window
        now = time.time()
        window_start = now - window
        
        # Key for rate limiting
        rate_key = f"ratelimit:{key_id}"
        
        # Remove old entries outside the window
        await redis_client.zremrangebyscore(rate_key, 0, window_start)
        
        # Count current requests in window
        current_count = await redis_client.zcard(rate_key)
        
        # Check if within limit
        if current_count >= requests_per_minute:
            # Calculate reset time
            oldest = await redis_client.zrange(rate_key, 0, 0, withscores=True)
            reset_time = int(oldest[0][1]) + window if oldest else int(now + window)
            return False, 0, reset_time
        
        # Add current request
        await redis_client.zadd(rate_key, {f"{now}": now})
        await redis_client.expire(rate_key, window + 1)
        
        remaining = requests_per_minute - current_count - 1
        
        # Calculate time until window resets
        oldest = await redis_client.zrange(rate_key, 0, 0, withscores=True)
        reset_time = int(oldest[0][1]) + window if oldest else int(now + window)
        
        return True, remaining, reset_time
    
    async def get_usage_stats(
        self, 
        key_id: str, 
        tier: RateLimitTier
    ) -> dict:
        """
        Get usage statistics for an API key.
        
        Returns:
            Dictionary with usage stats
        """
        requests_per_minute, _ = api_key_service.get_rate_limit(tier)
        
        redis_client = await self.get_redis()
        rate_key = f"ratelimit:{key_id}"
        
        window = 60
        now = time.time()
        window_start = now - window
        
        # Clean old entries and count
        await redis_client.zremrangebyscore(rate_key, 0, window_start)
        current_count = await redis_client.zcard(rate_key)
        
        return {
            "requests_this_minute": current_count,
            "limit_per_minute": requests_per_minute,
            "remaining": max(0, requests_per_minute - current_count),
            "tier": tier.value,
        }


# Singleton instance
rate_limiter = RateLimiter()