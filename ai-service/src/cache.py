"""
Redis Cache Integration
Caches classification results to reduce inference time
"""

import json
import hashlib
import logging
from typing import Optional, Dict
import redis
from config import config

logger = logging.getLogger(__name__)


class CacheService:
    """Redis cache service for classification results"""
    
    def __init__(self):
        self.redis_client = None
        self.enabled = False
        self._connect()
    
    def _connect(self):
        """Connect to Redis server"""
        try:
            self.redis_client = redis.Redis(
                host=config.REDIS_HOST,
                port=config.REDIS_PORT,
                password=config.REDIS_PASSWORD if config.REDIS_PASSWORD else None,
                db=0,
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5
            )
            # Test connection
            self.redis_client.ping()
            self.enabled = True
            logger.info("Redis cache connected successfully")
        except Exception as e:
            logger.warning(f"Redis cache not available: {e}")
            self.enabled = False
    
    def _generate_cache_key(self, image_path: str = None, image_base64: str = None) -> str:
        """
        Generate cache key from image content
        
        Args:
            image_path: Path to image file
            image_base64: Base64 encoded image
            
        Returns:
            Cache key (hash of image content)
        """
        if image_base64:
            # Hash base64 string
            content = image_base64.encode('utf-8')
        elif image_path:
            # Read and hash file content
            try:
                with open(image_path, 'rb') as f:
                    content = f.read()
            except Exception as e:
                logger.error(f"Error reading file for cache key: {e}")
                return None
        else:
            return None
        
        # Generate SHA256 hash
        hash_obj = hashlib.sha256(content)
        cache_key = f"classification:{hash_obj.hexdigest()}"
        return cache_key
    
    def get(self, image_path: str = None, image_base64: str = None) -> Optional[Dict]:
        """
        Get cached classification result
        
        Args:
            image_path: Path to image file
            image_base64: Base64 encoded image
            
        Returns:
            Cached result or None
        """
        if not self.enabled:
            return None
        
        try:
            cache_key = self._generate_cache_key(image_path, image_base64)
            if not cache_key:
                return None
            
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                logger.info(f"Cache hit for key: {cache_key[:20]}...")
                return json.loads(cached_data)
            
            logger.debug(f"Cache miss for key: {cache_key[:20]}...")
            return None
        
        except Exception as e:
            logger.error(f"Error getting cache: {e}")
            return None
    
    def set(self, result: Dict, image_path: str = None, image_base64: str = None) -> bool:
        """
        Cache classification result
        
        Args:
            result: Classification result to cache
            image_path: Path to image file
            image_base64: Base64 encoded image
            
        Returns:
            True if cached successfully
        """
        if not self.enabled:
            return False
        
        try:
            cache_key = self._generate_cache_key(image_path, image_base64)
            if not cache_key:
                return False
            
            # Cache with TTL
            self.redis_client.setex(
                cache_key,
                config.CACHE_TTL,
                json.dumps(result)
            )
            logger.info(f"Cached result with key: {cache_key[:20]}...")
            return True
        
        except Exception as e:
            logger.error(f"Error setting cache: {e}")
            return False
    
    def clear(self) -> bool:
        """Clear all classification cache"""
        if not self.enabled:
            return False
        
        try:
            # Delete all keys matching pattern
            keys = self.redis_client.keys('classification:*')
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Cleared {len(keys)} cached results")
            return True
        
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        if not self.enabled:
            return {
                'enabled': False,
                'connected': False
            }
        
        try:
            info = self.redis_client.info('stats')
            keys = self.redis_client.keys('classification:*')
            
            return {
                'enabled': True,
                'connected': True,
                'total_keys': len(keys),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
                'hit_rate': info.get('keyspace_hits', 0) / max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1)
            }
        
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {
                'enabled': self.enabled,
                'connected': False,
                'error': str(e)
            }


# Global cache instance
cache_service = None


def get_cache_service() -> CacheService:
    """Get or create cache service singleton"""
    global cache_service
    if cache_service is None:
        cache_service = CacheService()
    return cache_service
