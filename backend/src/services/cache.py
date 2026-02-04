"""Cache service using Redis"""

import redis.asyncio as redis
from ..config import settings

cache = None

async def init_cache():
    """Initialize Redis cache"""
    global cache
    
    try:
        cache = await redis.from_url(settings.redis_url)
        await cache.ping()
        print("✅ Redis cache initialized")
    except Exception as e:
        print(f"⚠️ Redis initialization failed: {e}")
        cache = None

async def get_cached(key: str):
    """Get value from cache"""
    if not cache:
        return None
    
    try:
        value = await cache.get(key)
        if value:
            return value.decode()
    except Exception as e:
        print(f"Cache read error: {e}")
    
    return None

async def set_cached(key: str, value: str, ttl: int = 3600):
    """Set value in cache with TTL"""
    if not cache:
        return False
    
    try:
        await cache.setex(key, ttl, value)
        return True
    except Exception as e:
        print(f"Cache write error: {e}")
    
    return False
